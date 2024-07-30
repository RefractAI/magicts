var idcounter = 1;

export type PlayerId = number & {brand1:void} & {brand2:void} //i.e. castable to cardid
export type CardId = number & {brand2:void} //actual played card, token
export type CardTypeId = number & {brand3:void} //Named card
export type AbilityTypeId = number & {brand4:void} //actual effect on card
export type Timestamp = number & {brand5:void}

export const newPlayerId = () => {idcounter++; return idcounter as PlayerId}
export const newCardId = () => {idcounter++; return idcounter as CardId}
export const newAbilityTypeId = () => {idcounter++; return idcounter as AbilityTypeId}
export const newTimestamp = () => {idcounter++; return idcounter as Timestamp}