import React, { useContext, useEffect } from 'react';
import { Card } from '../Types/CardTypes';
import { UIContext } from './UIContext';
import { AcceptClick, ButtonClick, LeftClick, PassPriorityClick, RightClick } from './UIFunctions';
import { ClientGetCard, ClientGetPlayer } from './ClientGetCard';
import Xarrow, {Xwrapper} from 'react-xarrows';
import { CardId, PlayerId } from '../Types/IdCounter';
import { CardComponent } from './CardComponent';
import { GetManaPoolText } from '../Types/GetText';
import { IsTribe } from '../Types/IsCard';
import { BucketInput } from '../Types/InputTypes';
import { CardStateSidebar } from './CardStateSidebar';

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

    const {context,setContext,input,setInput,selected,setSelected,buttons,setButtons,isHoldingPriority,setIsHoldingPriority} = useContext(UIContext)!;
    const {cards,active,active2,phase,stack,fastStack} = context;

    useEffect(() => {
      if(input?.name === 'ButtonChooseInput')
      {
        setButtons(input.buttons)
      }
      else
      {
        setButtons([])
      }
      
      // Clear selected cards when input type changes
      // Preserve selection for inputs that work with selected cards
      if(!['ChooseInput', 'PairInput', 'BucketInput', 'NumberInput'].includes(input?.name || ''))
      {
        setSelected([])
      }
      
    },[input?.name, isHoldingPriority])

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

    // Get castable cards from other zones (like graveyard with escape abilities)
    const playerCastableOtherZones = cards.filter(c => 
        c.zone !== 'Hand' && 
        c.zone !== 'Field' && 
        c.zone !== 'Stack' && 
        c.controller === context.active2 && 
        c.canCast.filter(cc => cc.playerId === context.active2).length > 0
    )
    
    const opponentCastableOtherZones = cards.filter(c => 
        c.zone !== 'Hand' && 
        c.zone !== 'Field' && 
        c.zone !== 'Stack' && 
        c.controller !== context.active2 && 
        c.canCast.filter(cc => cc.playerId !== context.active2).length > 0
    )

    const ToArrow = (from:CardId,tos:CardId[]) => tos.map(to => ({from,to}))

    const attackingArrows:Arrow[] = cards.filter(c => c.attacking).flatMap(c => ToArrow(c.id,[c.attacking!]))
    const blockingArrows:Arrow[] = cards.filter(c => c.blocking.length > 0).flatMap(c => ToArrow(c.id,c.blocking))
    const targetingArrows:Arrow[] = cards.filter(c => c.zone === 'Stack').flatMap(c => c.effects.flatMap(e => e.context.targets.flatMap(t => ToArrow(c.id,t))))
     
    const arrows:Arrow[] = [...attackingArrows,...blockingArrows,...targetingArrows]

    if(input.name === 'PairInput')
    {
      arrows.push(...input.response.map(([from,to]) => ({from,to})))
    }

    function BucketClick(i: number,binput:BucketInput) {
      if(selected.length === 1)
      {
        const bi = [...binput.response]
        // Remove the selected card from all buckets
        bi.forEach((bucket, index) => {
          bi[index] = bucket.filter(cardId => cardId !== selected[0])
        })
        // Add the selected card to the target bucket
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
            {opponentCastableOtherZones.length > 0 && <CardRow cards={opponentCastableOtherZones}/>}
            <CardRow cards={opponentLands}/>
            <CardRow cards={[...opponentCreatures,...opponentNonCreatures]}/>
            <CardRow cards={[...playerCreatures,...playerNonCreatures]}/>
            <CardRow cards={playerLands}/>
            <CardRow cards={[player, ...playerHand]}/>
            {playerCastableOtherZones.length > 0 && <CardRow cards={playerCastableOtherZones}/>}
            </div>}
        
        <div className="StackBar">
          <CardCol cards={stackCards}/>
          </div>
        <div className="StatusBar">
          <div className="status-section">
            <h4>Game State</h4>
            <div>Phase: <strong>{phase}</strong></div>
            <div>Turn: <strong>{active === 1 ? 'Player' : 'Opponent'}</strong></div>
            <div>Priority: <strong>{active2 === 1 ? 'Player' : 'Opponent'}</strong></div>
          </div>
          
          <div className="status-section">
            <h4>Stack</h4>
            <div>{stackCards[0]?.name || 'Empty'}</div>
            {fastStackCards[0] && <div>Fast: {fastStackCards[0].name}</div>}
          </div>
          
          <div className="status-section">
            <h4>Current Input</h4>
            <div><strong>{input.name}</strong></div>
            <div className="input-prompt">{input.prompt}</div>
          </div>
          
          <div className="status-section">
            <h4>Mana Pool</h4>
            <div>{GetManaPoolText(player.manaPool) || 'Empty'}</div>
          </div>
            {
            ['BucketInput','ChooseInput','NumberInput','PairInput'].includes(input.name) && <button onClick={() => AcceptClick(selected, input, setContext, setInput, isHoldingPriority)}>OK</button>
            }  <br/>
            {
              input.name == 'BucketInput' && selected.length === 1 && <button onClick={() => LeftClick(input,setInput,selected)}>{"<-"}</button>
            }  <br/>
            {
              input.name == 'BucketInput' && selected.length === 1 && <button onClick={() => RightClick(input,setInput,selected)}>{"->"}</button>
            }  <br/>
            {
              input.name == 'CastInput' && <button onClick={() => PassPriorityClick(input, context, setContext,setInput, isHoldingPriority)}>Pass Priority</button>
            }  <br/>
            {
              input.name == 'CastInput' && <label><input type="checkbox" checked={isHoldingPriority} onChange={(e) => setIsHoldingPriority(e.target.checked)} /> Hold Priority</label>
            }
            {(input.name === 'ButtonChooseInput' || (input.name === 'CastInput' && buttons.length > 0)) && buttons.map((b,i) => <button key={i} onClick={() => ButtonClick(i, input, selected, setSelected, context, setContext, buttons, setButtons, setInput, isHoldingPriority)}>{b}</button>)}
        </div>
        <CardStateSidebar />
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