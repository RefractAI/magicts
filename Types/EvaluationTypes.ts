
import { GetCard } from "../Logic/GetCard";
import { Card, Color, ColorVariable, Controller, NumberVariable, ConditionConcreteContext } from "./Types";
import { ColorVariableName, NumberVariableName } from "./VariableNames";

const NN = (name:NumberVariableName,fn:(c:Card,s:Card,b:Controller,x:ConditionConcreteContext) => number):NumberVariable => ({name,cls:'NumberVariable',fn})

export const NumberVariables:Record<NumberVariableName,NumberVariable> =
{
    NumberOfPlusOnePlusOneCountersOnIt: NN("NumberOfPlusOnePlusOneCountersOnIt", c => c.counters.filter(c => c === 'PlusOnePlusOne').length),
    ChosenNumber: NN("NumberOfPlusOnePlusOneCountersOnIt", (_,__,___,x) => x.numberVariable!),
    LinkedEffectTargetPower: NN("LinkedEffectTargetPower", (_,__,___,x) => x.linkedTargets!.flatMap(t => t).map(c => GetCard(c).power).reduce((a,b) => a+b)),
}

const CLN = (name:ColorVariableName,fn:(c:Card,s:Card,b:Controller,x:ConditionConcreteContext) => Color):ColorVariable => ({name,cls:'ColorVariable',fn})

export const ColorVariables:Record<ColorVariableName,ColorVariable> =
{
   ChosenColor: CLN("ChosenColor",(_,__,___,x) => x.colorVariable!) //TODO get chosen color? resolve chosencolor inside AbilityEffect?
}

//numberofcreaturesyoucontrol is a condition