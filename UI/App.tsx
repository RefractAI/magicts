import { useEffect, useState } from 'react';
import { CardId } from '../Types/IdCounter';
import { UIContext } from './UIContext';
import { InputUnion } from '../Types/InputTypes';
import { ClientUpdate, clientState } from '../Network/Client';
import CardLayout from './CardUI';
import { TestStepperUI } from './TestStepperUI';
import './CardDisplay.css';

export function App() 
{

  const [context, setContext] = useState(clientState);
  const [input,setInput] = useState<InputUnion|undefined>(undefined)
  const [selected,setSelected] = useState<CardId[]>([])
  const [buttons,setButtons] = useState<string[]>([])
  const [hovered,setHovered] = useState<CardId|null>(null)
  const [isHoldingPriority,setIsHoldingPriority] = useState<boolean>(false)

  useEffect(() => {
    ClientUpdate(setContext,setInput)
  },[])
  
  return (
    <UIContext.Provider value={{context,setContext,input,setInput,selected,setSelected,hovered,setHovered,buttons,setButtons,isHoldingPriority,setIsHoldingPriority}}>
        <CardLayout/>
        <TestStepperUI/>
    </UIContext.Provider>
  )
}





