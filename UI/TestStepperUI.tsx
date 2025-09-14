import React, { useState, useEffect, useContext } from 'react';
import { TestStepper, TestStepperState } from '../Testing/TestStepper';
import { UIContext } from './UIContext';
import './TestStepperUI.css';

export const TestStepperUI: React.FC = () => {
    const [stepper] = useState(() => new TestStepper((state) => setStepperState(state)));
    const [stepperState, setStepperState] = useState<TestStepperState>(() => stepper.getState());
    const [isVisible, setIsVisible] = useState(false);
    const { context, setContext, setInput } = useContext(UIContext)!;

    useEffect(() => {
        stepper.setUICallbacks({ setContext, setInput });
    }, [stepper, setContext, setInput]);

    const handleTestSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const testName = event.target.value;
        if (testName) {
            stepper.selectTest(testName);
        }
    };

    const handleNextStep = () => {
        stepper.nextStep();
    };

    const handleReset = () => {
        stepper.reset();
    };

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    if (!isVisible) {
        return (
            <div className="test-stepper-collapsed">
                <button onClick={toggleVisibility} className="test-stepper-toggle">
                    📋 Test Stepper
                </button>
            </div>
        );
    }

    return (
        <div className="test-stepper-container">
            <div className="test-stepper-header">
                <h3>🧪 Test Stepper</h3>
                <button onClick={toggleVisibility} className="test-stepper-close">
                    ✕
                </button>
            </div>

            <div className="test-stepper-controls">
                <div className="test-selection">
                    <label htmlFor="test-select">Select Test:</label>
                    <select 
                        id="test-select"
                        value={stepperState.test?.name || ''} 
                        onChange={handleTestSelect}
                        className="test-select"
                    >
                        <option value="">Choose a test...</option>
                        {stepperState.availableTests.map(test => (
                            <option key={test.name} value={test.name}>
                                {test.name}
                            </option>
                        ))}
                    </select>
                </div>

                {stepperState.test && (
                    <div className="test-info">
                        <p><strong>Description:</strong> {stepperState.test.description}</p>
                        <p><strong>Phase:</strong> {stepperState.test.initialPhase}</p>
                        <p><strong>Progress:</strong> {(() => {
                            const totalInputs = stepperState.test.steps.filter(step => 'name' in step).length;
                            const executedInputs = stepperState.test.steps.slice(0, stepperState.currentStep).filter(step => 'name' in step).length;
                            return `${executedInputs} of ${totalInputs} input steps completed`;
                        })()}</p>
                    </div>
                )}

                <div className="test-controls">
                    <button 
                        onClick={handleNextStep}
                        disabled={!stepperState.test || stepperState.isComplete}
                        className="next-step-btn"
                    >
                        {stepperState.currentStep >= (stepperState.test?.steps.length || 0) 
                            ? '✅ Test Complete' 
                            : (() => {
                                // Find the next input step to show what will be executed
                                const nextInputStep = stepperState.test?.steps.slice(stepperState.currentStep).find(step => 'name' in step);
                                const nextStepName = nextInputStep ? (nextInputStep as any).name : 'Step';
                                return `▶️ ${nextStepName} + Assertions`;
                            })()
                        }
                    </button>
                    
                    <button 
                        onClick={handleReset}
                        className="reset-btn"
                    >
                        🔄 Reset
                    </button>
                </div>

                {stepperState.isComplete && (
                    <div className={`test-result ${stepperState.execution?.passed ? 'passed' : 'failed'}`}>
                        {stepperState.execution?.passed ? '🎉 TEST PASSED!' : '❌ TEST FAILED!'}
                        {stepperState.execution?.errors.length ? (
                            <div className="error-details">
                                <strong>Error:</strong> {stepperState.execution.errors[0].message}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            <div className="test-log-container">
                <h4>📝 Test Log</h4>
                <div className="test-log">
                    {stepperState.stepLog.map((logEntry, index) => (
                        <div key={index} className="log-entry">
                            {logEntry}
                        </div>
                    ))}
                </div>
            </div>

            {stepperState.test && (
                <div className="game-state-info">
                    <h4>🎮 Current Game State</h4>
                    <div className="game-stats">
                        <span><strong>Phase:</strong> {context.phase}</span>
                        <span><strong>Active Player:</strong> {context.active2}</span>
                        <span><strong>Stack Size:</strong> {context.cards.filter(c => c.zone === 'Stack').length}</span>
                        <span><strong>Input Type:</strong> {context.input?.name || 'none'}</span>
                    </div>
                    
                    <div className="card-counts">
                        <div className="player-cards">
                            <h5>Player 1 Cards:</h5>
                            <ul>
                                <li>Hand: {context.cards.filter(c => c.zone === 'Hand' && c.controller === 1).length}</li>
                                <li>Field: {context.cards.filter(c => c.zone === 'Field' && c.controller === 1).length}</li>
                                <li>Graveyard: {context.cards.filter(c => c.zone === 'Graveyard' && c.controller === 1).length}</li>
                            </ul>
                        </div>
                        <div className="player-cards">
                            <h5>Player 2 Cards:</h5>
                            <ul>
                                <li>Hand: {context.cards.filter(c => c.zone === 'Hand' && c.controller === 2).length}</li>
                                <li>Field: {context.cards.filter(c => c.zone === 'Field' && c.controller === 2).length}</li>
                                <li>Graveyard: {context.cards.filter(c => c.zone === 'Graveyard' && c.controller === 2).length}</li>
                            </ul>
                        </div>
                    </div>

                    {stepperState.execution && (
                        <div className="mapped-cards">
                            <h5>🗺️ Test Card Mapping:</h5>
                            <div className="card-mapping">
                                {Array.from(stepperState.execution.cardIdMap.entries()).map(([testId, gameId]) => {
                                    const card = context.cards.find(c => c.id === gameId);
                                    return (
                                        <div key={testId} className="card-map-entry">
                                            <span className="test-id">{testId}</span>
                                            <span className="arrow">→</span>
                                            <span className="game-info">
                                                {card ? `${card.name} (${gameId}) in ${card.zone}` : `ID ${gameId}`}
                                                {card && card.power !== undefined && (
                                                    <span className="power-info"> [{card.power}/{card.toughness}]</span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};