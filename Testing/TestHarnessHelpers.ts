import { controller, ServerInputRespond } from "../Network/Server";
import { AssertionUnion, Execution, TestInputUnion } from "./TestTypes";
import { GetCard, GetPlayer, GetCostModificationAbilities } from "../Logic/GetCard";
import { CardId, PlayerId, AbilityTypeId } from "../Types/IdCounter";
import { CastSpecification } from "../Types/InputTypes";
import { ToCost, Cost } from "../Types/CostTypes";
import { GetManaPoolText, GetCostText } from "../Types/GetText";
import { GetAbilityType, ActivatedAbility } from "../Types/AbilityTypes";
import { ConditionTypes } from "../Types/ConditionHelpers";
import { ConditionConcreteContext } from "../Types/CardTypes";

const lookupCardId = (execution: Execution, testCardId: string): CardId | undefined => {
    // Handle special card IDs
    if (testCardId === "Player") {
        return 1 as CardId;
    }
    if (testCardId === "Opponent") {
        return 2 as CardId;
    }
    
    // Use normal mapping
    return execution.cardIdMap.get(testCardId);
};

export const Respond = (execution: Execution, input: TestInputUnion) => {

    switch(input.name)
    {
        case "CastInput":
            const testCard = execution.test.initialCards.find(c => c.id === input.targetCardId);
            const actualCardId = lookupCardId(execution, input.targetCardId);
            
            // Check if this is a token (not in initial cards but has a mapped ID)
            const isToken = !testCard && actualCardId;
            
            if (!testCard && !isToken) {
                throw new Error(`Test card with ID '${input.targetCardId}' not found`);
            }
            if (!actualCardId) {
                throw new Error(`Actual card ID for test card '${input.targetCardId}' not found`);
            }
            
            // Handle ability activation vs spell casting
            let abilityTypeId: AbilityTypeId | null = null;
            if (input.abilityIndex !== undefined) {
                // Get the card to find its casting options
                const card = GetCard(actualCardId);
                // Determine player ID - for tokens, use the card's controller
                const playerId = isToken ? card.controller : (testCard!.friendly ? 1 : 2) as PlayerId;
                const castingOptions = card.canCast.filter(c => c.playerId === playerId);
                
                // Get all ability options (non-null abilityTypeId)
                const abilityOptions = castingOptions.filter(c => c.abilityTypeId !== null);
                
                if (input.abilityIndex >= abilityOptions.length) {
                    throw new Error(`Ability index ${input.abilityIndex} out of range for card '${input.targetCardId}' (has ${abilityOptions.length} abilities)`);
                }
                
                abilityTypeId = abilityOptions[input.abilityIndex].abilityTypeId;
            }
            
            // Determine player ID and card name for logging
            const playerId = isToken ? GetCard(actualCardId).controller : (testCard!.friendly ? 1 : 2) as PlayerId;
            const cardName = isToken ? GetCard(actualCardId).name : testCard!.cardName;
            
            const castSpecification: CastSpecification = {
                playerId: playerId,
                cardId: actualCardId,
                abilityTypeId: abilityTypeId,
                chosenMode: input.chosenMode
            }
            
            if (abilityTypeId !== null) {
                console.log(`  Activate ability: ${cardName}`);
            } else {
                console.log(`  Cast: ${cardName}`);
            }
            
            ServerInputRespond('CastInput', castSpecification)
            break
            
        case "PayInput":
            const payTargetCardId = lookupCardId(execution, input.targetCardId);
            
            if (!payTargetCardId) {
                throw new Error(`Target card ID for '${input.targetCardId}' not found`);
            }
            
            console.log(`  Pay using: ${input.targetCardId} (activate mana ability)`);
            
            // Find the mana ability on the target card
            const targetCard = GetCard(payTargetCardId);
            const manaAbility = targetCard.canCast.find(c => 
                c.playerId === 1 && 
                c.abilityTypeId !== null &&
                GetAbilityType(c.abilityTypeId)?.abilityCls === 'ActivatedAbility' &&
                (GetAbilityType(c.abilityTypeId) as ActivatedAbility).isManaAbility
            );
            
            if (!manaAbility) {
                throw new Error(`No mana ability found on card '${input.targetCardId}'`);
            }
            
            // For PayInput, activate the mana ability of the target card
            const paySpecification: CastSpecification = {
                playerId: 1 as PlayerId,
                cardId: payTargetCardId,
                abilityTypeId: manaAbility.abilityTypeId
            }
            
            ServerInputRespond('PayInput', paySpecification)
            break
            
        case "ChooseInput":
            if (input.targetCardIds) {
                // Handle multiple targets
                const targetCardIds: CardId[] = [];
                for (const testCardId of input.targetCardIds) {
                    const actualCardId = lookupCardId(execution, testCardId);
                    if (!actualCardId) {
                        throw new Error(`Target card ID for '${testCardId}' not found`);
                    }
                    targetCardIds.push(actualCardId);
                }
                
                console.log(`  Targets: ${input.targetCardIds.join(', ')}`);
                ServerInputRespond('ChooseInput', targetCardIds);
            } else if (input.targetCardId) {
                // Handle single target (backward compatibility)
                const targetCardId = lookupCardId(execution, input.targetCardId);
                
                if (!targetCardId) {
                    throw new Error(`Target card ID for '${input.targetCardId}' not found`);
                }
                
                console.log(`  Target: ${input.targetCardId}`);
                ServerInputRespond('ChooseInput', [targetCardId]);
            } else {
                throw new Error("ChooseInput must specify either targetCardId or targetCardIds");
            }
            break

        case "ButtonChooseInput":
            // Find button index by text
            if (!controller.input || controller.input.name !== 'ButtonChooseInput') {
                throw new Error(`Expected ButtonChooseInput but got ${controller.input?.name}`);
            }
            
            const buttonIndex = controller.input.buttons.findIndex(b => b === input.buttonText);
            if (buttonIndex === -1) {
                throw new Error(`Button '${input.buttonText}' not found in available buttons: ${controller.input.buttons.join(', ')}`);
            }
            
            console.log(`  Choose button: ${input.buttonText}`);
            
            ServerInputRespond('ButtonChooseInput', buttonIndex)
            break
            
        case "PairInput":
            const pairs: [CardId, CardId][] = [];
            
            for(const [fromTestId, toTestId] of input.pairs) {
                const fromActualId = lookupCardId(execution, fromTestId);
                const toActualId = lookupCardId(execution, toTestId);
                
                if (!fromActualId) {
                    throw new Error(`From card ID for '${fromTestId}' not found`);
                }
                if (!toActualId) {
                    throw new Error(`To card ID for '${toTestId}' not found`);
                }
                
                pairs.push([fromActualId, toActualId]);
                console.log(`  ${fromTestId} -> ${toTestId}`);
            }
            
            ServerInputRespond('PairInput', pairs);
            break
            
        case "PassPriority":
            // Pass priority by sending appropriate response based on input type
            if (controller.input?.name === 'CastInput' || controller.input?.name === 'PayInput') {
                const passResponse = {
                    playerId: controller.input.playerId,
                    cardId: null,
                    abilityTypeId: null
                };
                ServerInputRespond('CastInput', passResponse);
            } else {
                // Other input types don't support "passing" - the player must make an explicit choice
                throw new Error(`Cannot pass priority when game is waiting for ${controller.input?.name}. Player must make an explicit choice.`);
            }
            break
            
        case "PassUntil":
            // Automatically pass priority until we reach the specified phase and turn
            const passUntilInput = input as import('./TestTypes').PassUntil;
            let passCount = 0;
            const maxPasses = 15;
            
            while (passCount < maxPasses) {
                // Check if we've reached the target state
                const currentPhase = controller.phase;
                const currentActivePlayer = controller.active;
                const isFriendlyTurn = currentActivePlayer === 1;
                
                
                if (currentPhase === passUntilInput.phase && isFriendlyTurn === passUntilInput.friendly) {
                    console.log(`  Reached target: ${passUntilInput.phase}, friendly=${passUntilInput.friendly}`);
                    break;
                }
                
                // Pass priority if possible
                if (controller.input?.name === 'CastInput') {
                    const passResponse = {
                        playerId: controller.input.playerId,
                        cardId: null,
                        abilityTypeId: null
                    };
                    ServerInputRespond('CastInput', passResponse);
                } 
                else if (controller.input?.name === 'PairInput') {
                    ServerInputRespond('PairInput', []);
                }
                else {
                    throw new Error(`PassUntil expected CastInput but got ${controller.input?.name}`);
                }
                
                passCount++;
            }
            
            if (passCount >= maxPasses) {
                throw new Error(`PassUntil exceeded maximum passes (${maxPasses}) trying to reach ${passUntilInput.phase}, friendly=${passUntilInput.friendly}`);
            }
            break
            
        case "BooleanInput":
            console.log(`  Boolean choice: ${input.response}`);
            ServerInputRespond('BooleanInput', input.response);
            break
            
        case "NumberInput":
            console.log(`  Number value: ${input.value}`);
            ServerInputRespond('NumberInput', input.value);
            break

        case "BucketInput":
            console.log(`  Bucket assignment: ${input.buckets.map((bucket, i) => `Pile ${i + 1}: [${bucket.join(', ')}]`).join(', ')}`);
            // Map test card IDs to actual card IDs
            const actualBuckets = input.buckets.map(bucket => 
                bucket.map(testCardId => {
                    const actualId = lookupCardId(execution, testCardId);
                    if (!actualId) {
                        throw new Error(`Could not find actual card ID for test card ID: ${testCardId}`);
                    }
                    return actualId;
                })
            );
            ServerInputRespond('BucketInput', actualBuckets);
            break

        default:
            throw new Error(`Invalid input: ${JSON.stringify(input)}`)
    }
}

export const Assert = (execution: Execution, assertion: AssertionUnion) => {
    switch (assertion.name) {
        case "TokenExists":
            const tokensInZone = controller.cards.filter(c => 
                c.zone === assertion.zone && 
                c.name === assertion.tokenCardName &&
                c.controller === (assertion.friendly ? 1 : 2) as PlayerId
            );

            if(assertion.count !== assertion.tokenTestCardIds.length)
            {
                throw new Error(`TokenExists assertion count must match tokenTestCardIds length`)
            }
            
            if(tokensInZone.length !== assertion.count) {
                console.log(`  Expected: ${assertion.count} ${assertion.tokenCardName} tokens`);
                console.log(`  Actual: ${tokensInZone.length} found`);
                throw new Error(`Expected ${assertion.count} ${assertion.tokenCardName} tokens in ${assertion.zone} but found ${tokensInZone.length}`);
            }

            tokensInZone.forEach((token, index) => {
                execution.cardIdMap.set(assertion.tokenTestCardIds[index], token.id);
            });

            //Assign created tokens to cardIdMap
            return;
            
        case "EmblemExists":
            const emblemsInZone = controller.cards.filter(c => 
                c.zone === assertion.zone && 
                c.name === assertion.emblemCardName &&
                c.controller === (assertion.friendly ? 1 : 2) as PlayerId
            );

            if(assertion.count !== assertion.emblemTestCardIds.length)
            {
                throw new Error(`EmblemExists assertion count must match emblemTestCardIds length`)
            }
            
            if(emblemsInZone.length !== assertion.count) {
                console.log(`  Expected: ${assertion.count} ${assertion.emblemCardName} emblems`);
                console.log(`  Actual: ${emblemsInZone.length} found`);
                throw new Error(`Expected ${assertion.count} ${assertion.emblemCardName} emblems in ${assertion.zone} but found ${emblemsInZone.length}`);
            }

            emblemsInZone.forEach((emblem, index) => {
                execution.cardIdMap.set(assertion.emblemTestCardIds[index], emblem.id);
            });

            //Assign created emblems to cardIdMap
            return;
            
        case "Phase":
            if(assertion.expectedPhase !== controller.phase) {
                console.log(`  Expected: phase ${assertion.expectedPhase}`);
                console.log(`  Actual: phase ${controller.phase}`);
                throw new Error(`Current phase is '${controller.phase}' but expected '${assertion.expectedPhase}'`);
            }
            return;
            
        case "CardsInZone":
            const playerId = assertion.friendly ? 1 : 2;
            const cardsInZone = controller.cards.filter(c => c.zone === assertion.zone && c.controller === playerId);
            const actualCount = cardsInZone.length;
            
            if(assertion.expectedCount !== actualCount) {
                console.log(`  Expected: ${assertion.friendly ? 'friendly' : 'opponent'} player to have ${assertion.expectedCount} cards in ${assertion.zone}`);
                console.log(`  Actual: ${assertion.friendly ? 'friendly' : 'opponent'} player has ${actualCount} cards in ${assertion.zone}`);
                throw new Error(`Player ${playerId} has ${actualCount} cards in ${assertion.zone} but expected ${assertion.expectedCount}`);
            }
            return;
            
        case "ManaPool":
            const manaPlayerId = assertion.friendly ? 1 : 2;
            const player = GetPlayer(manaPlayerId as PlayerId);
            const expectedCost = ToCost(assertion.expectedMana);
            const actualManaText = GetManaPoolText(player.manaPool);
            
            // Convert cost elements to pool mana elements for comparison
            const expectedPoolElements = expectedCost.elements
                .filter(e => e.cls === 'CostManaElement')
                .map(e => {
                    let color: any;
                    switch (e.color) {
                        case 'Generic': color = 'Colorless'; break;
                        case 'W/U': color = 'White'; break; // For hybrid, just use one color for comparison
                        default: color = e.color;
                    }
                    return {
                        color,
                        condition: e.condition,
                        cls: 'CostManaElement' as const
                    };
                });
            
            const expectedManaText = GetManaPoolText(expectedPoolElements);
            
            // Compare mana pools by converting to text representation
            if (actualManaText !== expectedManaText) {
                console.log(`  Expected: ${assertion.friendly ? 'friendly' : 'opponent'} player to have mana pool '${expectedManaText}'`);
                console.log(`  Actual: ${assertion.friendly ? 'friendly' : 'opponent'} player has mana pool '${actualManaText}'`);
                throw new Error(`Player ${manaPlayerId} has mana pool '${actualManaText}' but expected '${expectedManaText}'`);
            }
            return;
            
        case "NotImplemented":
            console.log(`  Expected: Mechanic '${assertion.mechanicName}' to be implemented`);
            console.log(`  Actual: ${assertion.description}`);
            throw new Error(`❌ NOT IMPLEMENTED: ${assertion.mechanicName} - ${assertion.description}`);
            
        case "Debugger":
            console.log(`  Running debug function...`);
            assertion.debugFn(controller);
            throw new Error("Debugger assertion reached");
            
        case "CastCost":
            const actualCardId = lookupCardId(execution, assertion.targetCardId);
            
            if (!actualCardId) {
                throw new Error(`Cannot find actual card ID for test card '${assertion.targetCardId}'`);
            }
            
            const card = GetCard(actualCardId as CardId);
            const testCard = execution.test.initialCards.find(c => c.id === assertion.targetCardId);
            const isToken = !testCard && actualCardId;
            const castCostPlayerId = isToken ? card.controller : (testCard!.friendly ? 1 : 2) as PlayerId;
            
            let actualCostText: string;
            
            if (assertion.abilityIndex !== undefined) {
                // Testing activated ability cost
                const castingOptions = card.canCast.filter(c => c.playerId === castCostPlayerId);
                const abilityOptions = castingOptions.filter(c => c.abilityTypeId !== null);
                
                if (assertion.abilityIndex >= abilityOptions.length) {
                    throw new Error(`Ability index ${assertion.abilityIndex} out of range. Card has ${abilityOptions.length} activated abilities.`);
                }
                
                const selectedAbility = abilityOptions[assertion.abilityIndex];
                const abilityType = GetAbilityType(selectedAbility.abilityTypeId!) as ActivatedAbility;
                actualCostText = GetCostText(abilityType.cost);
            } else {
                // Testing spell casting cost - need to calculate the modified cost like in DetermineCost
                let baseCost = card.cost;
                
                if (assertion.castModeIndex !== undefined) {
                    // Testing specific cast mode cost
                    if (assertion.castModeIndex >= card.options.length) {
                        throw new Error(`Cast mode index ${assertion.castModeIndex} out of range. Card has ${card.options.length} casting options.`);
                    }
                    
                    const selectedOptions = card.options[assertion.castModeIndex];
                    
                    // Apply any cost modifications from the selected casting options
                    selectedOptions.forEach(option => {
                        if (option.cost) {
                            baseCost = option.cost;  // For alternate costs, replace the cost entirely
                        }
                    });
                }
                
                // Apply cost modifications from abilities like Thalia
                const costModAbilities = GetCostModificationAbilities(card);
                const costIncreaseElements = costModAbilities.map(cma => cma[1].costIncrease).flatMap(c => c.elements);
                
                // Create the modified cost by adding the cost increase elements
                const elements = [...baseCost.elements, ...costIncreaseElements];
                const finalCost: Cost = { cls: 'Cost', elements };
                
                actualCostText = GetCostText(finalCost);
            }
            
            if (actualCostText !== assertion.expectedCost) {
                console.log(`  Expected: ${assertion.targetCardId} to have cost '${assertion.expectedCost}'`);
                console.log(`  Actual: ${card.name} has cost '${actualCostText}'`);
                const contextStr = assertion.abilityIndex !== undefined 
                    ? `ability index ${assertion.abilityIndex}`
                    : assertion.castModeIndex !== undefined 
                        ? `cast mode ${assertion.castModeIndex}`
                        : `normal cast`;
                throw new Error(`Card ${assertion.targetCardId} (${card.name}) ${contextStr} has cost '${actualCostText}' but expected '${assertion.expectedCost}'`);
            }
            return;
            
        case "Life":
            const lifePlayerId = assertion.targetCardId === "Player" ? 1 : 2;
            const lifePlayer = GetPlayer(lifePlayerId as PlayerId);
            if (lifePlayer.life !== assertion.expectedLife) {
                console.log(`  Expected: Player ${lifePlayerId} to have life ${assertion.expectedLife}`);
                console.log(`  Actual: Player ${lifePlayerId} has life ${lifePlayer.life}`);
                throw new Error(`Player ${lifePlayerId} has life ${lifePlayer.life} but expected ${assertion.expectedLife}`);
            }
            return;
            
        case "ConditionAssertion":
            const conditionCardId = lookupCardId(execution, assertion.targetCardId);
            
            if (!conditionCardId) {
                throw new Error(`Cannot find actual card ID for test card '${assertion.targetCardId}'`);
            }
            
            const conditionCard = GetCard(conditionCardId as CardId);
            
            let result: boolean;
            let actualValue: any;
            let expectedDesc: string;
            let context: Partial<ConditionConcreteContext> = {}
            
            switch(assertion.conditionName) {
                case "InZone":
                    context.zoneVariable = assertion.expectedValue;
                    actualValue = conditionCard.zone;
                    expectedDesc = `in zone ${assertion.expectedValue}`;
                    break;
                case "OfType":
                    context.tribeVariable = assertion.expectedValue;
                    actualValue = conditionCard.tribes.join(', ');
                    expectedDesc = `type ${assertion.expectedValue}`;
                    break;
                case "HasPower":
                    context.numberVariable = assertion.expectedValue;
                    actualValue = conditionCard.power;
                    expectedDesc = `power ${assertion.expectedValue}`;
                    break;
                case "HasToughness":
                    context.numberVariable = assertion.expectedValue;
                    actualValue = conditionCard.toughness;
                    expectedDesc = `toughness ${assertion.expectedValue}`;
                    break;
                case "HasDamageMarked":
                    context.numberVariable = assertion.expectedValue;
                    actualValue = conditionCard.damageMarked;
                    expectedDesc = `damage marked ${assertion.expectedValue}`;
                    break;
                case "HasAbility":
                    context.abilityVariable = assertion.expectedValue;
                    actualValue = conditionCard.printedAbilities.map(a => a.name).join(', ');
                    expectedDesc = `ability ${assertion.expectedValue}`;
                    break;
                case "HasKeyword":
                    context.keywordVariable = assertion.expectedValue;
                    actualValue = conditionCard.keywords.join(', ');
                    expectedDesc = `keyword ${assertion.expectedValue}`;
                    break;
                case "IsTapped":
                    actualValue = conditionCard.tapped ? "tapped" : "untapped";
                    expectedDesc = "tapped";
                    break;
                case "IsUntapped":
                    actualValue = conditionCard.tapped ? "tapped" : "untapped";
                    expectedDesc = "untapped";
                    break;
                default:
                    throw new Error(`Unknown condition name: ${assertion.conditionName}`);
            }
            
            console.log("Evaluating test condition", assertion.conditionName, JSON.stringify(context));
            result = ConditionTypes[assertion.conditionName].fn(conditionCard, conditionCard, controller, {...context, targets: []});
            
            if(!result) {
                console.log(`  Expected: ${assertion.targetCardId} to be ${expectedDesc}`);
                console.log(`  Actual: ${conditionCard.name} - ${actualValue}`);
                throw new Error(`Card ${assertion.targetCardId} (${conditionCard.name}) condition '${assertion.conditionName}' failed`);
            }
            return;
            
        case "Name":
            const nameCardId = lookupCardId(execution, assertion.targetCardId);
            
            if (!nameCardId) {
                throw new Error(`Cannot find actual card ID for test card '${assertion.targetCardId}'`);
            }
            
            const nameCard = GetCard(nameCardId as CardId);
            
            if(assertion.cardName !== nameCard.name) {
                console.log(`  Expected: ${assertion.targetCardId} to have name ${assertion.cardName}`);
                console.log(`  Actual: ${nameCard.name}`);
                throw new Error(`Card ${assertion.targetCardId} has name '${nameCard.name}' but expected '${assertion.cardName}'`);
            }
            return;
            
        default:
            throw new Error(`Unhandled assertion type: ${(assertion as any).name}`);
    }
}