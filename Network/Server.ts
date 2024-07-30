import { GameLoop } from "../Logic/GameLoop";
import { GetCard } from "../Logic/GetCard";
import { AbilityTypeRegistry } from "../Types/AbilityClassHelpers";
import { ActualCardName } from "../Types/CardNames";
import { CardTypes } from "../Types/CardTypes";
import { AbilityTypeId, CardId, PlayerId } from "../Types/IdCounter";
import { InputUnion } from "../Types/InputTypes";
import { Controller, InputName } from "../Types/Types";

export const History:Controller[] = []

export const controller: Controller = {
  cards: [],
  phase: 'Upkeep',
  turn: 1,
  active: 1 as PlayerId,
  active2: 1 as PlayerId,
  priorityPassed: 0,
  hasCastOrPassed: true, //starts on true
  input: undefined,
  stack: [],
  fastStack: [],
  actions: [],
  autoTapLoopCount: 0
};

(window as any).controller = controller;
(window as any).cards = () => controller.cards;
(window as any).card = (id:CardId) => GetCard(id);
(window as any).type = (id:ActualCardName) => CardTypes[id];
(window as any).ab = (id:AbilityTypeId) => AbilityTypeRegistry[id];

export function ServerInputRespond<T extends InputUnion> (response:T['response'])
{
  console.log("Responding",name,response);
  //Only overwrite response, don't trust other fields
  //Server
  controller.input!.response = response;
  controller.input!.responded = true;
  GameLoop()
}