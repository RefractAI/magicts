export const ActualCardNames = ['Plains','Island','Swamp','Mountain','Forest','Bear','Gruul Signet','Flametongue Kavu','Lightning Bolt'
,'Adeline, Resplendent Cathar'
,'Blade Splicer'
,'Benevolent Bodyguard'
,'Cathar Commando'
,'Guardian of New Benalia'
] as const;

export const SpecialCardNames = ['Player','Opponent','Ability','Option'] as const;

export const TokenNames = ['11WhiteHuman','33ColorlessPhyrexianGolemArtifactCreature'] as const;

export type ActualCardName = typeof ActualCardNames[number] | typeof SpecialCardNames[number]

export type TokenName =  typeof TokenNames[number]

export type CardName = ActualCardName | TokenName;




