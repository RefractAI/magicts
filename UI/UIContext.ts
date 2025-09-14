import { createContext } from "react";
import { CardId } from "../Types/IdCounter";
import { InputUnion } from "../Types/InputTypes";
import { Controller } from "../Types/CardTypes";

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
  setButtons:(buttons:string[]) => void,
  isHoldingPriority:boolean,
  setIsHoldingPriority:(isHolding:boolean) => void
}

export const UIContext = createContext<UIContextType|null>(null);