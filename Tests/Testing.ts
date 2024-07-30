import { controller } from "../Network/Server"
import { ActualCardName } from "../Types/CardNames"
import { Tests } from "./Tests"

export const PerformTests = () =>
{
    const tests = GetTests()

    tests.forEach(t => {
        controller.currentTest = t[0]
        t[1]()
    })
}

export const GetTests = () =>
{
    const tests:ActualCardName[] = ["Flametongue Kavu"]
    return tests.map(t => [t,Tests[t]] as [test:ActualCardName,fn:() => void])
}