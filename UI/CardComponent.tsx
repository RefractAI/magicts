import React, { useContext } from 'react';
import { Card, Selectable } from '../Types/Types';
import { UIContext } from './UIContext';
import { CardClick } from "./CardClick";
import { GetCardShortText } from '../Types/GetText';

export const CardComponent: React.FC<{ card: Card; }> = ({ card }) => {

  const { id, tapped } = card;
  const { input, selected, setSelected, context, setContext, setInput, setHovered, setButtons } = useContext(UIContext)!;
  
  if (!input) { return; }

  var selectable: Selectable = 'None';

  if (input.source === id) {
    selectable = 'Source';
  }

  switch (input.name) {
    case 'CastInput':
    case 'PayInput':
    case 'ChooseInput':
      if (input.allowed.includes(id)) {
        selectable = 'Allowed';
      }
      break;
    case 'BucketInput':
      if (input.response.some(b => b.includes(id))) {
        selectable = 'Allowed';
      }
      break;
    case 'PairInput':
      if (input.allowed.includes(id)) {
        selectable = 'Allowed';
      }
      if (input.toCards.includes(id)) {
        selectable = 'Other';
      }
      if (input.response.some(i => i[0] === id)) {
        selectable = 'Paired';
      }
      break;
  }

  if (selected.includes(id)) {
    selectable = 'Selected';
  }


  return (
    <div className={`Card 
      ${card.controller === 1 ? 'Player' : 'Opponent'} ${tapped ? ' tapped' : ''} Selectable-${selectable}`}
      id={card.id.toString()}
      onClick={() => { CardClick(id, selectable, input, selected, setSelected, context, setContext, setButtons, setInput); }}
      onMouseEnter={() => setHovered(id)}
    >
      <div>{GetCardShortText(card)}</div>
    </div>
  );
};
