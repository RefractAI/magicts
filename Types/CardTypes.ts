import { CardType, SelfCondition } from "./Types";
import { ActualCardName, TokenName } from "./CardNames";
import { Artifact, Creature, Generic, Instant, Land, TokenArtifactCreature, TokenCreature } from "./CardTypesHelpers";
import { ChooseAnyColor, Create, CreateTappedAndAttacking, Damage, Destroy, Discard, Gains, DoTrigger, Sacrifice, Scry, Tap, TargetGains, WhenYouDo, May } from "./EffectClassHelpers";
import { ETB, OnAttack } from "./TriggerAbilityHelpers";
import { GainsPowerUntilEndOfTurn, IndestructibleUntilEndOfTurn, MakeActivatedAbility, MakeProtectionFromAbility, MakeTriggeredAbility, XsYouControlHaveY } from "./AbilityClassHelpers";
import { IsOfColor } from "./ConditionTypes";

export const CardTypes:Record<ActualCardName,CardType> =
{
  "Bear": Creature("Bear", "1G", 2, 2, "Bear"),
"Flametongue Kavu": Creature("Flametongue Kavu", "3R", 4, 2, "Kavu"
//When Flametongue Kavu enters the battlefield, it deals 4 damage to target creature.
  ,ETB(
    Damage(4, "AnyCreature")
  )
),

"Lightning Bolt": Instant("Lightning Bolt", "R"
//Lightning Bolt deals 3 damage to any target.
  ,Damage(3, "AnyTarget")
),

"Adeline, Resplendent Cathar": Creature("Adeline, Resplendent Cathar", "1WW", 
////Adeline, Resplendent Cathar's power is equal to the number of creatures you control. 
  "AllFriendlyCreatures", 3
  , "Legendary","Human","Knight", 
//Whenever you attack, for each opponent, create a 1/1 white Human creature token that's tapped and attacking that player or a planeswalker they control.
  OnAttack("Self", 
    CreateTappedAndAttacking("11WhiteHuman"))
),

"Blade Splicer": Creature("Blade Splicer", "2W", 2, 2, "Phyrexian", "Human", "Artificer",
  //When Blade Splicer enters the battlefield, create a 3/3 colorless Phyrexian Golem artifact creature token. Golems you control have first strike.
    ETB(
      Create("33ColorlessPhyrexianGolemArtifactCreature")
    ),
  //Golems you control have first strike.
    XsYouControlHaveY("Golem","FirstStrike")
),

"Benevolent Bodyguard": Creature("Benevolent Bodyguard", "W", 1, 1, "Human", "Cleric",
  //Sacrifice Benevolent Bodyguard: Target creature you control gains protection from the color of your choice until end of turn.
    MakeActivatedAbility(
      Sacrifice(),
      ChooseAnyColor("FriendlyPlayer",TargetGains("AnyFriendlyCreature",MakeProtectionFromAbility(IsOfColor("AllOfColor","ChosenColor"))))
    ) 
),

"Cathar Commando": Creature("Cathar Commando", "1W", 2, 2, "Human", "Soldier", "Flash",
//1, Sacrifice Cathar Commando: Destroy target artifact or enchantment.
  MakeActivatedAbility(
    Sacrifice(),
    Destroy("AnyArtifactOrEnchantment")
  )
),

"Guardian of New Benalia": Creature(
  "Guardian of New Benalia",
  "1W",
  2,
  2,
  "Human",
  "Soldier",  
  //Enlist: As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.
  OnAttack(
    "Self",
    May(
      WhenYouDo(
      Tap("AnyFriendlyCreatureNotAttackingAndNoSummoningSickness"),
      GainsPowerUntilEndOfTurn("LinkedEffectTargetPower", SelfCondition),
      DoTrigger("Enlist")
      )
    )
  ),
  // Whenever Guardian of New Benalia enlists a creature, scry 2.
  MakeTriggeredAbility(
    "Enlist",
    "AnyFriendlyCreature",
    Scry(2)
  ),
  // Discard a card: Guardian of New Benalia gains indestructible until end of turn. Tap it.
  MakeActivatedAbility(
    Discard(1),
    Gains(IndestructibleUntilEndOfTurn())),
    Tap()
),

Plains: Land("Plains", "Plains"),
Island: Land("Island", "Island"),
Swamp: Land("Swamp", "Swamp"),
Mountain: Land("Mountain", "Mountain"),
Forest: Land("Forest", "Forest"),
"Gruul Signet": Artifact("Gruul Signet", "2"),

    Player: Generic("Player","Player"),
    Opponent: Generic("Opponent","Player"),
    Ability: Generic("Ability","Ability"),
    Option: Generic("Option","Option"),
}

export const TokenTypes:Record<TokenName,CardType> =
{
    "11WhiteHuman": TokenCreature("11WhiteHuman", 1, 1, "Human"),
    "33ColorlessPhyrexianGolemArtifactCreature": TokenArtifactCreature("33ColorlessPhyrexianGolemArtifactCreature", 3, 3, "Phyrexian","Golem"),
}

/*
        //todo: colorchoiceeffect gets
        //passes to lower effect
        //color var of chosencolor to pick up that
        //ChosenColor = pick up from parent effect context -> ability effect context -> ability context -> condition context*/