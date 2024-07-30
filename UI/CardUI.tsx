import React, { useContext, useEffect } from 'react';
import { Card } from '../Types/Types';
import { UIContext } from './UIContext';
import { AcceptClick, ButtonClick, LeftClick, PassPriorityClick, RightClick } from './UIFunctions';
import { ClientGetCard, ClientGetPlayer } from './ClientGetCard';
import Xarrow, {Xwrapper} from 'react-xarrows';
import { CardId, PlayerId } from '../Types/IdCounter';
import { CardComponent } from './CardComponent';
import { GetManaPoolText } from '../Types/GetText';
import { IsTribe } from '../Types/IsCard';
import { BucketInput } from '../Types/InputTypes';

const CardRow: React.FC<{cards: Card[]}> = ({cards}) => {
    return (<div className="CardRow">{cards
    .map((card) => (
      <CardComponent key={card.id} card={card} />
    ))}
    </div>)
  };

  const CardCol: React.FC<{cards: Card[]}> = ({cards}) => {
    return (<div className="CardCol">{cards
    .map((card) => (
      <CardComponent key={card.id} card={card} />
    ))}
    </div>)
  };

  const CardLayout: React.FC = () => {

    const {context,setContext,input,setInput,selected,hovered,setSelected,buttons,setButtons} = useContext(UIContext)!;
    const {cards,active,active2,phase,stack,fastStack,priorityPassed} = context;

    if(!input){return}
  
    const player = ClientGetPlayer(context.active2)
    const opponent = ClientGetPlayer(context.active2 === 1 ? 2 as PlayerId : 1 as PlayerId)
    const playerHand = cards.filter(c => c.zone === 'Hand' && c.controller === context.active2).sort((a,b) => a.cmc - b.cmc)
    const playerLands = cards.filter(c => c.zone === 'Field' && IsTribe(c,'Land') && c.controller === context.active2)
    const playerCreatures = cards.filter(c => c.zone === 'Field' && IsTribe(c,'Creature') && c.controller === context.active2)
    const playerNonCreatures = cards.filter(c => c.zone === 'Field' && !IsTribe(c,'Land') && !IsTribe(c,'Creature') && c.controller === context.active2)
  
    const opponentHand = cards.filter(c => c.zone === 'Hand' && c.controller !== context.active2).sort((a,b) => a.cmc - b.cmc)
    const opponentLands = cards.filter(c => c.zone === 'Field' && IsTribe(c,'Land') && c.controller !== context.active2)
    const opponentCreatures = cards.filter(c => c.zone === 'Field' && IsTribe(c,'Creature') && c.controller !== context.active2)
    const opponentNonCreatures = cards.filter(c => c.zone === 'Field' && !IsTribe(c,'Land') && !IsTribe(c,'Creature') && c.controller !== context.active2)

    const stackCards = stack.map(c => ClientGetCard(c))
    const fastStackCards = fastStack.map(c => ClientGetCard(c))

    const ToArrow = (from:CardId,tos:CardId[]) => tos.map(to => ({from,to}))

    const attackingArrows:Arrow[] = cards.filter(c => c.attacking).flatMap(c => ToArrow(c.id,[c.attacking!]))
    const blockingArrows:Arrow[] = cards.filter(c => c.blocking.length > 0).flatMap(c => ToArrow(c.id,c.blocking))
    const targetingArrows:Arrow[] = cards.filter(c => c.zone === 'Stack').flatMap(c => c.effects.flatMap(e => e.targets.flatMap(t => ToArrow(c.id,t.targets))))
     
    const arrows:Arrow[] = [...attackingArrows,...blockingArrows,...targetingArrows]

    if(input.name === 'PairInput')
    {
      arrows.push(...input.response.map(([from,to]) => ({from,to})))
    }

    useEffect(() => {
      if(input.name === 'ButtonChooseInput')
      {
        setButtons(input.buttons)
      }
    },[input.name])

    function BucketClick(i: number,binput:BucketInput) {
      if(selected.length === 1)
      {
        const bi = [...binput.response]
        bi.forEach(bib => bib = bib.filter(bibi => bibi !== selected[0]))
        bi[i].push(selected[0])
        setInput({...binput, response:bi})

      }
    }

    return (
      <div className="App">
        <Xwrapper>
        <div className="MainContent">
        
            {input.name === 'BucketInput' && <div className="CardRows">{input.response.map((b,i) => <div key={i}><button onClick={() => BucketClick(i, input)}>{input.buckets[i].prompt}</button><CardRow cards={b.map(b => ClientGetCard(b))}></CardRow></div>)}</div>}
            {input.name !== 'BucketInput' && <div className="CardRows"><CardRow cards={[opponent, ...opponentHand]}/>
            <CardRow cards={opponentLands}/>
            <CardRow cards={[...opponentCreatures,...opponentNonCreatures]}/>
            <CardRow cards={[...playerCreatures,...playerNonCreatures]}/>
            <CardRow cards={playerLands}/>
            <CardRow cards={[player, ...playerHand]}/>
            </div>}
        
        <div className="StackBar">
          <CardCol cards={stackCards}/>
          </div>
        <div className="StatusBar">
          Phase: {phase} <br/>
          Turn: {active === 1 ? 'Player' : 'Opponent'}  <br/>
          Active: {active2 === 1 ? 'Player' : 'Opponent'}  <br/>
          Passed: {priorityPassed}  <br/>
          Stack: {stackCards[0]?.name}  <br/>
          StackPhase: {stackCards[0]?.castPhase}  <br/>
          FastStackPhase: {fastStackCards[0]?.castPhase}  <br/>
          Input: {input.name}  <br/>
          Prompt: {input.prompt}  <br/>
          Mana: {GetManaPoolText(player.manaPool)}
            {
            ['BucketInput','ChooseInput','NumberInput','PairInput'].includes(input.name) && <button onClick={() => AcceptClick(selected, input, setContext, setInput)}>OK</button>
            }  <br/>
            {
              input.name == 'BucketInput' && selected.length === 1 && <button onClick={() => LeftClick(input,setInput,selected)}>{"<-"}</button>
            }  <br/>
            {
              input.name == 'BucketInput' && selected.length === 1 && <button onClick={() => RightClick(input,setInput,selected)}>{"->"}</button>
            }  <br/>
            {
              input.name == 'CastInput' && <button onClick={() => PassPriorityClick(input, context, setContext,setInput)}>Pass Priority</button>
            }  <br/>
            {hovered && ClientGetCard(hovered).name}  <br/>
            {hovered && ClientGetCard(hovered).id}
            {hovered && ClientGetCard(hovered).zone}
            {buttons.map((b,i) => <button key={i} onClick={() => ButtonClick(i, input, selected, setSelected, context, setContext, buttons, setButtons, setInput)}>{b}</button>)}
        </div>
        </div>
        {arrows.map(a => <Xarrow key={a.from.toString()+a.to.toString()} start={a.from.toString()} end={a.to.toString()}/>)}
        </Xwrapper>
      </div>
    );
  };
  
  export default CardLayout;

  interface Arrow
  {
    from:CardId,
    to:CardId
  }