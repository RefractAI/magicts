import { InputUnion } from "../Types/InputTypes";
import { Controller, InputName } from "../Types/Types";
import { ServerInputRespond, controller } from "./Server";


export var clientState:Controller = {...controller}

export function ClientUpdate(setContext:(context:Controller) => void,setInput:(input:InputUnion) => void)
{
    //Client
    clientState = {...controller}
    setContext(clientState)
    console.log(clientState.input)
    setInput(clientState.input!)
}

export function ClientInputRespond<T extends InputUnion> (response:T['response'],setContext:(context:Controller) => void,setInput:(input:InputUnion) => void)
{
  ServerInputRespond(response)
  ClientUpdate(setContext,setInput)
}