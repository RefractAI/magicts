import { useEffect, useState } from 'react';
import { Controller } from '../Types/Types';
import { CardId } from '../Types/IdCounter';
import { UIContext } from './UIContext';
import { InputUnion } from '../Types/InputTypes';
import { ClientUpdate, clientState } from '../Network/Client';
import CardLayout from './CardUI';
import { GameLoop } from '../Logic/GameLoop';
import { Init } from '../Logic/Init';

export function App() 
{

  const [context, setContext] = useState(clientState);
  const [input,setInput] = useState<InputUnion|undefined>(undefined)
  const [selected,setSelected] = useState<CardId[]>([])
  const [buttons,setButtons] = useState<string[]>([])
  const [hovered,setHovered] = useState<CardId|null>(null)

  useEffect(() => {
    Init()
    GameLoop()
    ClientUpdate(setContext,setInput)
  },[])
  
  return (
    <UIContext.Provider value={{context,setContext,input,setInput,selected,setSelected,hovered,setHovered,buttons,setButtons}}>
        <CardLayout/>
    </UIContext.Provider>
  )
}

export interface UIContextType
{
  context:Controller
  setContext:(clientState:Controller) => void
  input:InputUnion|undefined,
  setInput:(input:InputUnion) => void,
  selected:CardId[],
  setSelected:(selected:CardId[]) => void
  hovered:CardId|null,
  setHovered:(selected:CardId|null) => void,
  buttons:string[],
  setButtons:(buttons:string[]) => void
}



