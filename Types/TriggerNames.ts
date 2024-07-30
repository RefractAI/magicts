export const TriggerNames = ['WhenYouDo','ETB','LTB','OnAttack'
,'Upkeep','DrawStep','FirstMain','BeginCombat','Combat','EndCombat','SecondMain','EndStep'
,'DrawCard','GainLife','LoseLife'
,'Dies','Discard'
,'Enlist'
] as const;
export type TriggerName = typeof TriggerNames[number];