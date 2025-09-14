import React, { useContext } from 'react';
import { UIContext } from './UIContext';
import { ClientGetCard } from './ClientGetCard';
import { GetBasicInfoText, GetPowerToughnessText, GetKeywordsText, GetCountersText, GetStatusText, GetAbilityText } from '../Types/GetText';
import { GetCastModeSummary } from '../Types/OptionTypes';

export const CardStateSidebar: React.FC = () => {
  const { hovered } = useContext(UIContext)!;

  if (!hovered) return null;

  const card = ClientGetCard(hovered);
  
  const powerToughness = GetPowerToughnessText(card);
  const keywords = GetKeywordsText(card);
  const counters = GetCountersText(card);
  const status = GetStatusText(card);
  const basicInfo = GetBasicInfoText(card);
  const castModes = card.options.length > 0 ? GetCastModeSummary(card.options.flat()) : null;

  return (
    <div className="card-state-sidebar">
      <div className="sidebar-header">
        <h3>{card.name}</h3>
      </div>
      
      <div className="sidebar-content">
        <div className="stat-section">
          <pre>{basicInfo}</pre>
        </div>
        
        {powerToughness && (
          <div className="stat-section">
            <h4>Power/Toughness</h4>
            <div>{powerToughness}</div>
          </div>
        )}
        
        {keywords && (
          <div className="stat-section">
            <h4>Keywords</h4>
            <div>{keywords}</div>
          </div>
        )}
        
        {card.printedAbilities.length > 0 && (
          <div className="stat-section">
            <h4>Abilities</h4>
            <div className="abilities">
              {card.printedAbilities.map((ability, index) => (
                <div key={index} className="ability">
                  {GetAbilityText(ability.type)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {counters && (
          <div className="stat-section">
            <h4>Counters</h4>
            <div>{counters}</div>
          </div>
        )}
        
        {status && (
          <div className="stat-section">
            <h4>Status</h4>
            <div>{status}</div>
          </div>
        )}
        
        {castModes && (
          <div className="stat-section">
            <h4>Cast Modes</h4>
            <div>{castModes}</div>
          </div>
        )}
      </div>
    </div>
  );
};