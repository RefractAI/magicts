export const TriggerNames = ['WhenYouDo','ETB','LTB','OnAttack'
,'Upkeep','DrawStep','FirstMain','BeginCombat','Combat','EndCombat','SecondMain','EndStep'
,'DrawCard','DrawSecondCard','GainLife','LoseLife'
,'Dies','Discard','Sacrifice','Search','Scry','Surveil'
,'Enlist','CastSpell','Transform','Untap'
] as const;
export type TriggerName = typeof TriggerNames[number];