export const ActualCardNames = ['Plains','Island','Swamp','Mountain','Forest','RainbowLand','Bear','Gruul Signet','Flametongue Kavu','Lightning Bolt'
,'Adeline, Resplendent Cathar'
,'Blade Splicer'
,'Benevolent Bodyguard'
,'Birds of Paradise'
,'Cathar Commando'
,'Guardian of New Benalia'
,'Spyglass Siren'
,'Faerie Mastermind'
,"Dragon's Rage Channeler"
,'Concealing Curtains'
,'Revealing Eye'
,'Simic Signet'
,'Demonic Tutor'
,'Goblin Bombardment'
,'Thoughtseize'
,'Walking Ballista'
,'Descendant of Storms'
,'Giver of Runes'
,'Mother of Runes'
,'Ocelot Pride'
,'Nethergoyf'
,'Fire'
,'Ice'
,'Fire // Ice'
,'Toxic Deluge'
,'Thalia, Guardian of Thraben'
,'Guide of Souls'
,'Floodpits Drowner'
,'Dark Confidant'
,'Fact or Fiction'
,'Abrade'
,'Abrupt Decay'
,'Adanto Vanguard'
,'Giant Growth'
,'Aetherflux Reservoir'
,'Preordain'
,'Aether Spellbomb'
,'Akal Pakal, First Among Equals'
,'Ancestral Recall'
,'Sol Ring'
,'Ancient Tomb'
,'Arid Mesa'
] as const;

export const SpecialCardNames = ['Player','Opponent','Ability','Option'] as const;

export const TokenNames = ['11WhiteHuman','33ColorlessPhyrexianGolemArtifactCreature','MapToken','11WhiteSpirit','11WhiteCat'] as const;

export const EmblemNames = ["City's Blessing"] as const;

export type ActualCardName = typeof ActualCardNames[number] | typeof SpecialCardNames[number]

export type TokenName =  typeof TokenNames[number]

export type EmblemName = typeof EmblemNames[number]

export type CardName = ActualCardName | TokenName | EmblemName;




