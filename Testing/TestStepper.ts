import availableTests from "./Tests"
import { GameLoop } from '../Logic/GameLoop';
import { Init } from '../Logic/Init';
import { CalculateAbilities } from '../Logic/CalculateAbilities';
import { controller, ResetController } from "../Network/Server";
import { Execution, Test, TestInputUnion, AssertionUnion } from "./TestTypes";
import { CardId, newTimestamp, PlayerId } from "../Types/IdCounter";
import { ClientUpdate } from "../Network/Client";
import { Respond, Assert } from "./TestHarnessHelpers";
import { NewCard } from "../Logic/GetCard";

export interface TestStepperState {
    test: Test | null;
    execution: Execution | null;
    currentStep: number;
    isComplete: boolean;
    stepLog: string[];
    availableTests: Test[];
}

export interface UIUpdateCallbacks {
    setContext: (context: any) => void;
    setInput: (input: any) => void;
}

export class TestStepper {
    private state: TestStepperState;
    private onStateChange: (state: TestStepperState) => void;
    private uiCallbacks: UIUpdateCallbacks | null = null;

    constructor(onStateChange: (state: TestStepperState) => void) {
        this.onStateChange = onStateChange;
        this.state = {
            test: null,
            execution: null,
            currentStep: 0,
            isComplete: false,
            stepLog: [],
            availableTests: availableTests
        };
    }

    public getState(): TestStepperState {
        return { ...this.state };
    }

    public setUICallbacks(callbacks: UIUpdateCallbacks): void {
        this.uiCallbacks = callbacks;
    }

    private updateUI(): void {
        if (this.uiCallbacks) {
            ClientUpdate(this.uiCallbacks.setContext, this.uiCallbacks.setInput);
        }
    }

    public selectTest(testName: string): void {
        const test = this.state.availableTests.find(t => t.name === testName);
        if (!test) return;

        this.state = {
            ...this.state,
            test,
            execution: null,
            currentStep: 0,
            isComplete: false,
            stepLog: []
        };
        
        this.initializeTest();
        this.updateUI();
        this.onStateChange(this.getState());
    }

    private initializeTest(): void {
        if (!this.state.test) return;

        const execution: Execution = {
            test: this.state.test,
            errors: [],
            passed: true,
            stepLogs: [],
            cardIdMap: new Map<string, CardId>()
        };

        this.state.execution = execution;
        
        // Reset game state
        ResetController(controller);
        Init();
        controller.phase = this.state.test.initialPhase;
        GameLoop();

        for (const testCard of this.state.test.initialCards) {
            const librarySpec = testCard.zone === 'Library' && testCard.position !== undefined 
                ? { direction: 'Top' as const, offset: testCard.position }
                : undefined
            const id = NewCard(
                testCard.cardName,
                (testCard.friendly ? 1 : 2) as PlayerId,
                testCard.zone,
                1,
                newTimestamp(),
                librarySpec
            )[0].id;
            execution.cardIdMap.set(testCard.id, id);
        }

        // Clear existing input and recalculate abilities after adding test cards
        controller.input = undefined;
        // Recalculate abilities after adding test cards to populate canCast
        CalculateAbilities();
        // Trigger game loop to create new input with updated canCast values
        GameLoop();
    }

    public nextStep(): void {
        if (!this.state.test || !this.state.execution || this.state.isComplete) return;

        const allStepLogs: string[] = [];
            
        // Capture logs for all steps
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            allStepLogs.push(args.join(' '));
        };

        try {
            // First, execute the current step (should be an input)
            const currentStep = this.state.test.steps[this.state.currentStep];
            if (!currentStep) {
                this.state.isComplete = true;
                this.updateUI();
                this.onStateChange(this.getState());
                return;
            }

            if (currentStep.type === "Input") {
                // Check if this input would be auto-handled by ClientUpdate
                const shouldSkip = currentStep.name === "ChooseInput" && 
                                   controller.input?.name === 'ChooseInput' && 
                                   controller.input.allowed.length === controller.input.min;
                
                if (shouldSkip) {
                    // Skip this step as it would be auto-handled
                    this.state.stepLog.push(`⏭️ Step ${this.state.currentStep + 1}: ${currentStep.name} (auto-skipped)`);
                    this.state.currentStep++;
                } else {
                    // Execute the input step
                    Respond(this.state.execution, currentStep as TestInputUnion);
                    
                    this.state.execution.stepLogs.push({
                        stepIndex: this.state.currentStep,
                        stepType: currentStep.name,
                        logs: [...allStepLogs],
                        success: true
                    });
                    
                    this.state.stepLog.push(`✅ Step ${this.state.currentStep + 1}: ${currentStep.name}`);
                    this.state.currentStep++;
                }
            }

            // Then execute all following assertions until we hit another input or end
            while (this.state.currentStep < this.state.test.steps.length) {
                const nextStep = this.state.test.steps[this.state.currentStep];
                
                if (nextStep.type === "Input") {
                    // Check if this input would be auto-handled by ClientUpdate
                    const shouldSkipInput = nextStep.name === "ChooseInput" && 
                                           controller.input?.name === 'ChooseInput' && 
                                           controller.input.allowed.length === controller.input.min;
                    
                    if (shouldSkipInput) {
                        // Skip this step as it would be auto-handled
                        this.state.stepLog.push(`⏭️ Step ${this.state.currentStep + 1}: ${nextStep.name} (auto-skipped)`);
                        this.state.currentStep++;
                        continue; // Keep processing more steps
                    } else {
                        // Hit a real input that needs user interaction, stop here
                        break;
                    }
                } else {
                    // Execute assertion and continue
                    Assert(this.state.execution, nextStep as AssertionUnion);
                    
                    this.state.execution.stepLogs.push({
                        stepIndex: this.state.currentStep,
                        stepType: nextStep.name,
                        logs: [],
                        success: true
                    });
                    
                    this.state.stepLog.push(`✅ Step ${this.state.currentStep + 1}: ${nextStep.name}`);
                    this.state.currentStep++;
                }
            }
            
            // Add all logs from this batch
            if (allStepLogs.length > 0) {
                allStepLogs.forEach(log => {
                    this.state.stepLog.push(`   ${log}`);
                });
            }
            
        } catch (stepError) {
            this.state.execution.passed = false;
            
            let error: Error;
            if (stepError instanceof Error) {
                error = stepError;
            } else {
                error = new Error(String(stepError));
            }
            
            this.state.execution.errors.push(error);
            this.state.stepLog.push(`❌ Step ${this.state.currentStep + 1}: ${error.message}`);
            this.state.isComplete = true;
        } finally {
            // Restore console.log
            console.log = originalConsoleLog;
        }
        
        // Check if we've completed all steps
        if (this.state.currentStep >= this.state.test.steps.length) {
            this.state.isComplete = true;
            this.state.stepLog.push(`🎉 Test completed successfully!`);
        }

        this.updateUI();
        this.onStateChange(this.getState());
    }

    public runToCompletion(): void {
        if (!this.state.test || !this.state.execution || this.state.isComplete) return;

        while (this.state.currentStep < this.state.test.steps.length && this.state.execution.passed) {
            this.nextStep();
        }
    }

    public reset(): void {
        this.state = {
            test: null,
            execution: null,
            currentStep: 0,
            isComplete: false,
            stepLog: [],
            availableTests: availableTests
        };
        
        // Reset game state to initial
        ResetController(controller);
        Init();
        GameLoop();
        this.updateUI();
        this.onStateChange(this.getState());
    }
}