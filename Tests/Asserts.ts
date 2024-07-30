import { GetCard, GetPlayer } from "../Logic/GetCard"
import { controller } from "../Network/Server"
import { CardId } from "../Types/IdCounter"
import { KeywordName } from "../Types/Types"
import { ZoneName } from "../Types/ZoneNames"

export const AssertZone = (cardId:CardId,zone:ZoneName,libraryIndex:number) =>
{
    const card = GetCard(cardId)


    if(card.zone !== zone)
    {
        Fail(`AssertZone - ${card.name} expected ${zone} but got ${card.name}.`)
    }

    if(card.zone === 'Library' && zone === 'Library')
    {
        const l = GetPlayer(card.controller).library
        const li = l.indexOf(cardId)
        if(li != libraryIndex % l.length)
        {
            Fail(`AssertZone - ${card.name} expected at librry index ${libraryIndex} but got ${li}.`)
        }
    }
}

export const AssertTapped = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    if(!card.tapped)
    {
        Fail(`AssertTapped - ${card.name} expected to be tapped.`)
    }
}

export const AssertKeyword = (cardId:CardId,keyword:KeywordName) =>
{
    const card = GetCard(cardId)
    if(!card.keywords.includes(keyword))
    {
        Fail(`AssertKeyword - ${card.name} expected to have ${keyword}`)
    }
}

export const AssertPowerToughness = (cardId:CardId,power:number,toughness:number) =>
{
    const card = GetCard(cardId)
    if(card.power !== power || card.toughness !== toughness)
    {
        Fail(`AssertPowerToughness - ${card.name} (${card.power}/${card.toughness}) expected to be (${power}/${toughness}).`)
    }
}

const Fail = (err:string) =>
{
    throw `Test failed - ${controller.currentTest} - ${err}`
}