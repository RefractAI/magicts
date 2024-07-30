export const SpecialTribeNames = ['Token','Player','Ability','SpellCopy','CardCopy','Option'] as const;
export const SuperTribeNames = ['Land','Creature','Instant','Sorcery','Planeswalker','Battle','Emblem','Artifact','Enchantment','Legendary'] as const;

export const CreatureTribeNames = ['Kavu','Human','Phyrexian','Golem','Bear'
,'Cleric','Artificer','Knight','Soldier'] as const;
export const LandTribeNames = ['Plains','Island','Swamp','Mountain','Forest'] as const;
export const ArtifactTribeNames = ['Vehicle'] as const;

export const TribeNames = [...SpecialTribeNames,...SuperTribeNames,...CreatureTribeNames,...LandTribeNames,...ArtifactTribeNames]

export type SpecialTribeNames = typeof SpecialTribeNames[number];
export type SuperTribeName = typeof SuperTribeNames[number];
export type ArtifactTribeName = typeof ArtifactTribeNames[number];
export type CreatureTribeName = typeof CreatureTribeNames[number];
export type LandTribeName = typeof LandTribeNames[number];

export type TribeName = SpecialTribeNames | SuperTribeName | CreatureTribeName | LandTribeName | ArtifactTribeName