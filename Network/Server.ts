import { GameLoop } from "../Logic/GameLoop";
import { GetCard } from "../Logic/GetCard";
import { AbilityTypeRegistry } from "../Types/AbilityTypes";
import { ActualCardName } from "../Cards/Common/CardNames";
import { CardTypes } from "../Cards/Common/CardTypes";
import { AbilityTypeId, CardId, PlayerId } from "../Types/IdCounter";
import { InputUnion } from "../Types/InputTypes";
import { Controller } from "../Types/CardTypes";

export const History:Controller[] = []

// Test mode flag to suppress verbose logs during testing
export let isTestMode = false;
export const setTestMode = (enabled: boolean) => { isTestMode = enabled; };

export function ResetController(controller:Controller):Controller {

  controller.cards = []
  controller.phase = 'Upkeep'
  controller.turnNumber = 1
  controller.active = 1 as PlayerId
  controller.active2 = 1 as PlayerId
  controller.activePlayerPassed = false
  controller.nonActivePlayerPassed = false
  controller.input = undefined
  controller.stack = []
  controller.fastStack = []
  controller.actions = []
  controller.autoTapLoopCount = 0
  controller.triggeredAbilityQueue = []
  return controller
}

export const controller: Controller = ResetController({} as Controller);

if (typeof window !== 'undefined') {
    (window as any).controller = controller;
    (window as any).cards = () => controller.cards;
    (window as any).card = (id: CardId) => GetCard(id);
    (window as any).type = (id:ActualCardName) => CardTypes[id];
    (window as any).ab = (id:AbilityTypeId) => AbilityTypeRegistry[id];
}

function validateInputResponse(input: InputUnion, response: any): void {
  switch (input.name) {
    case 'ChooseInput':
      if (!Array.isArray(response)) {
        throw new Error(`ChooseInput response must be an array, got: ${typeof response}`);
      }
      const invalidChoices = response.filter((cardId: CardId) => !input.allowed.includes(cardId));
      if (invalidChoices.length > 0) {
        throw new Error(`ChooseInput response contains invalid card IDs: [${invalidChoices.join(', ')}]. Allowed: [${input.allowed.join(', ')}]`);
      }
      break;
    
    case 'PairInput':
      if (!Array.isArray(response)) {
        throw new Error(`PairInput response must be an array, got: ${typeof response}`);
      }
      for (const pair of response) {
        if (!Array.isArray(pair) || pair.length !== 2) {
          throw new Error(`PairInput response must contain pairs of card IDs, got invalid pair: ${JSON.stringify(pair)}`);
        }
        const [fromCard, toCard] = pair;
        if (!input.allowed.includes(fromCard)) {
          throw new Error(`PairInput response contains invalid 'from' card ID: ${fromCard}. Allowed: [${input.allowed.join(', ')}]`);
        }
        if (!input.toCards.includes(toCard)) {
          throw new Error(`PairInput response contains invalid 'to' card ID: ${toCard}. Allowed toCards: [${input.toCards.join(', ')}]`);
        }
      }
      break;
    
    case 'CastInput':
    case 'PayInput':
      if (response.cardId !== null && !input.allowed.includes(response.cardId)) {
        throw new Error(`${input.name} response contains invalid card ID: ${response.cardId}. Allowed: [${input.allowed.join(', ')}]`);
      }
      
      // Additional validation: check that the response playerId matches the input's expected playerId
      if (response.playerId !== input.playerId) {
        throw new Error(`${input.name} response playerId ${response.playerId} does not match input playerId ${input.playerId}`);
      }
      
      // Additional validation: check that the card actually has the canCast entry
      if (response.cardId !== null) {
        const card = GetCard(response.cardId);
        const canCastEntry = card.canCast.find(c => 
          c.playerId === response.playerId && 
          c.abilityTypeId === response.abilityTypeId
        );
        
        if (!canCastEntry) {
          throw new Error(`${input.name} response invalid: Card ${response.cardId} does not have canCast entry for player ${response.playerId} with ability ${response.abilityTypeId}`);
        }
      }
      break;
    
    case 'BucketInput':
      if (!Array.isArray(response)) {
        throw new Error(`BucketInput response must be an array, got: ${typeof response}`);
      }
      
      // Validate bucket count
      if (response.length !== input.buckets.length) {
        throw new Error(`BucketInput response has ${response.length} buckets but expected ${input.buckets.length}`);
      }
      
      // Get all originally allowed cards
      const allAllowedCards = input.buckets.flatMap(b => b.initial);
      const allResponseCards: CardId[] = [];
      
      for (let bucketIndex = 0; bucketIndex < response.length; bucketIndex++) {
        const bucket = response[bucketIndex];
        if (!Array.isArray(bucket)) {
          throw new Error(`BucketInput response bucket ${bucketIndex} must be an array, got: ${typeof bucket}`);
        }
        
        // Check for invalid cards
        const invalidCards = bucket.filter((cardId: CardId) => !allAllowedCards.includes(cardId));
        if (invalidCards.length > 0) {
          throw new Error(`BucketInput response bucket ${bucketIndex} contains invalid card IDs: [${invalidCards.join(', ')}]. Allowed: [${allAllowedCards.join(', ')}]`);
        }
        
        // Collect all cards for duplicate check
        allResponseCards.push(...bucket);
      }
      
      // Check for duplicate cards across buckets
      const cardCounts = new Map<CardId, number>();
      for (const cardId of allResponseCards) {
        cardCounts.set(cardId, (cardCounts.get(cardId) || 0) + 1);
      }
      const duplicates = Array.from(cardCounts.entries()).filter(([_, count]) => count > 1);
      if (duplicates.length > 0) {
        throw new Error(`BucketInput response contains duplicate cards: [${duplicates.map(([id, count]) => `${id} (${count} times)`).join(', ')}]`);
      }
      
      // Verify all cards are accounted for (optional - some effects might allow cards to be "discarded")
      const missingCards = allAllowedCards.filter(cardId => !allResponseCards.includes(cardId));
      if (missingCards.length > 0) {
        console.warn(`BucketInput: Some cards were not placed in any bucket: [${missingCards.join(', ')}]`);
      }
      
      break;
  }
}

export function ServerInputRespond<T extends InputUnion> (expectedInputType: T['name'], response:T['response'])
{
  console.log("Responding",expectedInputType,JSON.stringify(response, null, 2).replaceAll("\n"," "));
  
  // Validate that the expected input type matches the current game state
  if (!controller.input) {
    throw new Error(`Input type validation failed: Expected '${expectedInputType}' but game has no input waiting. Game may be in an unexpected state.`);
  }
  
  if (controller.input.name !== expectedInputType) {
    throw new Error(`Input type validation failed: Expected '${expectedInputType}' but game has '${controller.input.name}'. Current input: ${JSON.stringify(controller.input, null, 2)}`);
  }
  
  //Only overwrite response, don't trust other fields
  //Server
  validateInputResponse(controller.input!, response);
  controller.input!.response = response;
  controller.input!.responded = true;
  GameLoop()
}