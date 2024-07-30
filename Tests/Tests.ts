import { ActualCardName } from "../Types/CardNames";
import { ChooseInput } from "../Types/InputTypes";
import { AssertKeyword, AssertPowerToughness, AssertTapped, AssertZone } from "./Asserts";
import { CastTest, ChooseTest } from "./TestHelpers";
import { Setup, ToPhase, Cast, Target, Respond } from "./TestSteps";

export const Tests:Record<ActualCardName,() => void> = 
{
    Plains: function (): void {
        throw new Error("Function not implemented.");
    },
    Island: function (): void {
        throw new Error("Function not implemented.");
    },
    Swamp: function (): void {
        throw new Error("Function not implemented.");
    },
    Mountain: function (): void {
        throw new Error("Function not implemented.");
    },
    Forest: function (): void {
        throw new Error("Function not implemented.");
    },
    Player: function (): void {
        throw new Error("Function not implemented.");
    },
    Opponent: function (): void {
        throw new Error("Function not implemented.");
    },
    Ability: function (): void {
        throw new Error("Function not implemented.");
    },
    Option: function (): void {
        throw new Error("Function not implemented.");
    },

    "Gruul Signet": function (): void {
        throw new Error("Function not implemented.");
    },
    "Flametongue Kavu": function (): void {
        const card = Setup("Player", "Hand", "Flametongue Kavu"); //For this test, add a Flametongue Kavu to the player's hand
        const target = Setup("Opponent", "Field", "Flametongue Kavu"); //For this test, add a Flametongue Kavu to the opponent's board
        ToPhase("Player", "FirstMain"); //Move the phase onto the first main for this test
        Cast(card); //Cast a card of the given ID
        Target(target); //Respond to the resulting input by targeting
        AssertZone(card, "Field");
        AssertZone(target, "Graveyard");
    },
    "Lightning Bolt": function (): void {
        throw new Error("Function not implemented.");
    },
    "Adeline, Resplendent Cathar": function (): void {
        throw new Error("Function not implemented.");
    },
    "Blade Splicer": function (): void {
        throw new Error("Function not implemented.");
    },
    "Benevolent Bodyguard": function (): void {
        throw new Error("Function not implemented.");
    },
    "Cathar Commando": function (): void {
        const card = Setup("Player", "Hand", "Cathar Commando"); //Add a Cathar Commando to the player's hand
        const target = Setup("Opponent", "Field", "Gruul Signet"); //Add an artifact to the opponent's board
        ToPhase("Player", "FirstMain"); //Move the phase onto the first main for this test
        CastTest(card); //Cast a card of the given ID
        Target(target); //Respond to the resulting input by targeting
        AssertZone(card, "Graveyard"); //Check the expected result of the board state matches
        AssertZone(target, "Graveyard"); //Check the expected result of the board state matches
    },
    "Guardian of New Benalia": function (): void {
        // Setup
        const guardian = Setup("Player", "Hand", "Guardian of New Benalia");
        const friendlyCreature1 = Setup("Player", "Field", "Bear");
        const library1 = Setup("Player", "Library","Bear");
        const library2 = Setup("Player", "Library","Bear");
        const library3 = Setup("Player", "Library","Bear");

        ToPhase("Player", "DeclareAttackers");

        // Wait a turn
        ToPhase("Player", "DeclareAttackers");

        // Attack with the Guardian
        ChooseTest(guardian);

        // Enlist the friendly creature without summoning sickness
        ChooseTest(friendlyCreature1);
        AssertPowerToughness(guardian, 4, 2); // Guardian's power should be boosted by 2
        AssertTapped(friendlyCreature1); // The enlisted creature should be tapped


        // Resolve the attack
        ToPhase("Player", "EndCombat");

        // Scry should be triggered after the enlist
        AssertZone(library2,"Library",1)
        AssertZone(library3,"Library",-1)

        // Move to the second main phase
        ToPhase("Player", "SecondMain");

        // Activate the discard ability
        CastTest(guardian, 0);
        AssertKeyword(guardian,"Indestructible"); // Guardian should gain indestructible
        AssertTapped(guardian); // Guardian should be tapped
    },
    Bear: function (): void {
        throw new Error("Function not implemented.");
    }
}
