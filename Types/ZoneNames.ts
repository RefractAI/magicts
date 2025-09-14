export const ZoneNames = ['Field','Hand','Library','Graveyard','Exile','Stack'
    ,'FastStack','Player','Emblem','NewCardHolding','Removed'] as const;
export type ZoneName = typeof ZoneNames[number];