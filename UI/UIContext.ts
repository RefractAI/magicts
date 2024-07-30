import { createContext } from "react";
import { UIContextType } from "./App";

export const UIContext = createContext<UIContextType|null>(null);