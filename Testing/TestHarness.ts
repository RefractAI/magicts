import availableTests from "./Tests"
import { GameLoop } from '../Logic/GameLoop';
import { Init } from '../Logic/Init';
import { CalculateAbilities } from '../Logic/CalculateAbilities';
import { controller, ResetController } from "../Network/Server";
import { Execution, Test, TestInputUnion, AssertionUnion } from "./TestTypes";
import { CardId, newTimestamp, PlayerId } from "../Types/IdCounter";
import { Respond, Assert } from "./TestHarnessHelpers";
import { GetCard, NewCard } from "../Logic/GetCard";


const RunTest = (test:Test, verbose: boolean = false):Execution => {
    const execution:Execution = {
        test:test,
        errors:[],
        passed:true,
        cardIdMap:new Map<string,CardId>(),
        stepLogs: []
    }
    
    // Store original console.log
    const originalConsoleLog = console.log;
    
    // Suppress all output during test setup and execution unless verbose mode is enabled
    if (!verbose) {
        console.log = () => {};
    }
    
    ResetController(controller)
    Init()
    controller.phase = test.initialPhase
    GameLoop()
    
    try{
        // Set up initial cards
        for(const testCard of test.initialCards)
        {
            if(testCard.zone == 'Library' && testCard.position === undefined)
            {
                throw new Error(`Library card ${testCard.cardName} (${testCard.id}) has no position`)
            }
            const librarySpec = testCard.zone === 'Library' && testCard.position !== undefined
                ? { direction: 'Top' as const, offset: testCard.position }
                : undefined
            const id = NewCard(testCard.cardName,(testCard.friendly ? 1 : 2) as PlayerId,testCard.zone,1,newTimestamp(),librarySpec)[0].id
            const card = GetCard(id)
            //For testing, remove summoning sickness
            if(testCard.zone == 'Field')
            {
                card.summoningSickness = false
            }
            execution.cardIdMap.set(testCard.id,id)
        }
        
        // Clear existing input and recalculate abilities after adding test cards
        controller.input = undefined
        CalculateAbilities()
        GameLoop()
        
        // Execute test steps
        for(let i = 0; i < test.steps.length; i++)
        {
            const step = test.steps[i];
            const stepLogs: string[] = [];
            
            // Capture logs for this step
            if (verbose) {
                // In verbose mode, log to console AND capture for step logs
                console.log = (...args) => {
                    const message = args.join(' ');
                    stepLogs.push(message);
                    originalConsoleLog(message);
                };
            } else {
                // In non-verbose mode, just capture logs
                console.log = (...args) => {
                    stepLogs.push(args.join(' '));
                };
            }
            
            try {
                if (step.type === "Input") {
                    Respond(execution, step as TestInputUnion);
                } else {
                    Assert(execution, step as AssertionUnion);
                }
                
                execution.stepLogs.push({
                    stepIndex: i,
                    stepType: step.name,
                    logs: stepLogs,
                    success: true
                });
                
            } catch (stepError) {
                execution.stepLogs.push({
                    stepIndex: i,
                    stepType: step.name,
                    logs: stepLogs,
                    success: false
                });
                throw stepError;
            }
        }
    }
    catch(e)
    {
        execution.passed = false
        
        let error: Error;
        if (e instanceof Error) {
            error = e;
        } else {
            error = new Error(String(e));
        }
        
        execution.errors.push(error)
    }
    finally {
        // Always restore console.log (only needed if we suppressed it)
        if (!verbose) {
            console.log = originalConsoleLog;
        }
    }
    
    return execution
}

export const RunAllTests = () => {
    const tests = availableTests
    const executions:Execution[] = []
    
    console.log(`Running ${tests.length} test(s)...\n`);
    
    for(const test of tests)
    {
        executions.push(RunSpecificTest(test.name))
    }
}

export const RunSpecificTest = (testName: string, verbose: boolean = false):Execution => {
    const tests = availableTests
    const test = tests.find(t => t.name === testName)
    
    if (!test) {
        throw new Error(`❌ Test "${testName}" not found. Available tests:`);
    }
    
    const execution = RunTest(test, verbose)
    
    if (execution.passed) {
        console.log(`✅ ${execution.test.name}`);
    } else {
        console.log(`❌ ${execution.test.name}`);
        execution.errors.forEach(error => {
            console.log(`   ${error.message}`);
        });
        
        // Show one-line summary of all steps up to failure
        const failedStepIndex = execution.stepLogs.findIndex(step => !step.success);
        if (failedStepIndex !== -1) {
            console.log(`   Test steps up to failure:`);
            for (let i = 0; i <= Math.max(0, failedStepIndex - 5); i++) {
                const step = execution.stepLogs[i];
                const status = step.success ? '✓' : '✗';
                console.log(`     ${i + 1}. ${status} ${step.stepType}`);
            }
            
            for (let i = Math.max(0, failedStepIndex - 5); i <= failedStepIndex; i++) {
                const step = execution.stepLogs[i];

                if (step.logs.length > 0) {
                    console.log(`     Step ${i + 1} (${step.stepType}):`);
                    step.logs.forEach(logLine => console.log(`       ${logLine}`));
                }
            }
        }
    }

    return execution
}