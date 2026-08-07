import styled from 'styled-components';
import { BORDER_COLOR, CTA_COLOR, NAMED_COLOR, TEXT_COLOR } from '../design/tokens';
import type { Team } from '../types';
import { teamColor } from '../util/teamColor';
import { SectionEyebrow } from './ui';

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 4px;
`;

const Sub = styled.p`
  margin: 0 0 20px;
  font-size: 13.5px;
  color: ${TEXT_COLOR.SECONDARY};
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const TeamButton = styled.button`
  appearance: none;
  /* Grow to fill each row; ~190px basis => 4 per row on desktop (8 teams = 4+4),
     and any partial last row stretches to fill instead of leaving a gap. */
  flex: 1 1 190px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  background: ${NAMED_COLOR.WHITE};
  border: 1px solid ${BORDER_COLOR.PRIMARY};
  border-radius: 12px;
  padding: 15px 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: ${TEXT_COLOR.PRIMARY};
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.05s;

  &:hover {
    border-color: ${CTA_COLOR.PRIMARY};
    box-shadow: 0 6px 18px -10px rgba(0, 38, 57, 0.35);
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Dot = styled.span<{ $c: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex: none;
  background: ${(p) => p.$c};
`;

interface Props {
  teams: Team[];
  onSelect: (name: string) => void;
}

export function TeamSelect({ teams, onSelect }: Props) {
  return (
    <section>
      <SectionEyebrow>Current week</SectionEyebrow>
      <Title>Which team are you?</Title>
      <Sub>Pick your team to log this week’s time. We’ll remember it on this device.</Sub>
      <Grid>
        {teams.map((t, i) => (
          <TeamButton key={t.id} onClick={() => onSelect(t.name)}>
            <Dot $c={teamColor(i)} />
            {t.name}
          </TeamButton>
        ))}
      </Grid>
    </section>
  );
}
