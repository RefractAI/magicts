import { ConditionName } from "./ConditionNames";
import { Card, ConditionConcreteContext, ConditionContext, Controller, ResolutionContext } from "./CardTypes";
import { Color } from "./ColorTypes";

export const NumberVariableNames = ['NumberOfPlusOnePlusOneCountersOnIt','ChosenNumber','LinkedEffectTargetPower','SelectedX','NumberOfCardTypesInGraveyard','NumberOfCardTypesInGraveyardPlusOne','NegativeSelectedX','ContextTargetCMC','ContextTargetPower','SpellsCastThisTurn'] as const;
export type NumberVariableName = typeof NumberVariableNames[number];

export const ColorVariableNames = ['ChosenColor'] as const;
export type ColorVariableName = typeof ColorVariableNames[number];

export interface NumberVariable
{
    name:NumberVariableName,
    fn: (card:Card,source:Card,context:Controller,x:ResolutionContext) => number
    cls:'NumberVariable',
}

export interface ColorVariable
{
    name:ColorVariableName,
    fn: (card:Card,source:Card,context:Controller,x:ResolutionContext) => Color
    cls:'ColorVariable',
}

export interface NumberSpecification
{
    conditions:ConditionSpecification|NumberVariableName,
    min:NumberDef,
    max:NumberDef,
    cls:'NumberSpecification',
}

export type ConditionItem = ConditionName | ConditionSpecification;

export interface ConditionSpecification
{
    conditions:ConditionItem[],
    min:NumberDef,
    max:NumberDef,
    all:boolean,
    andOr: 'AND' | 'OR',
    doesTarget:boolean, 
    context:ConditionContext,
    validationFunction:string,
    cls:'ConditionSpecification'|'NoneCondition'|'SelfCondition'|'AbilitySourceCondition',
}

export type TargetType = ConditionName | PlayerTargetType | ConditionSpecification //assumed 0 or 1 target if name. only used in card constructors
export type PlayerTargetType = "FriendlyPlayer"|"OpponentPlayer"|"AnyPlayer"|'AllPlayers'

export type NumberVar = number | NumberVariableName | ConditionSpecification | NumberSpecification // only used in card constructors
export type NumberDef = number | NumberSpecification 

export interface Condition
{
    name:ConditionName,
    fn: (card:Card,source:Card,context:Controller,x:ConditionConcreteContext) => boolean,
    numberOfTargets:NumberVar
    cls:'Condition',
}