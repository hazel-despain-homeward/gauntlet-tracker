import styled from 'styled-components';
import { CTA_COLOR, NAMED_COLOR, TEXT_COLOR } from '../design/tokens';
import type { Team, Week } from '../types';
import { TeamRow } from './TeamRow';
import { Card, SectionEyebrow } from './ui';

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 24px;
`;

const Sub = styled.p`
  margin: 2px 0 0;
  font-size: 13px;
  color: ${TEXT_COLOR.SECONDARY};
`;

const Done = styled.button`
  appearance: none;
  border: none;
  border-radius: 9px;
  padding: 10px 18px;
  font-family: inherit;
  font-weight: 700;
  font-size: 14px;
  color: ${NAMED_COLOR.WHITE};
  background: ${CTA_COLOR.PRIMARY};
  cursor: pointer;

  &:hover {
    background: ${CTA_COLOR.DARK};
  }
`;

interface Props {
  week: Week;
  teams: Team[];
  onEntry: (team: string, seconds: number | null, dnp: boolean) => void;
  onDone: () => void;
}

export function EditTimes({ week, teams, onEntry, onDone }: Props) {
  return (
    <section>
      <Head>
        <div>
          <SectionEyebrow>Edit mode · {week.label}</SectionEyebrow>
          <Title>Edit times</Title>
          <Sub>Fix any team’s time or clear it. Changes save as you type.</Sub>
        </div>
        <Done onClick={onDone}>Done</Done>
      </Head>
      <Card>
        {teams.map((t) => (
          <TeamRow
            key={t.id}
            name={t.name}
            entry={week.entries[t.name]}
            onChange={(seconds, dnp) => onEntry(t.name, seconds, dnp)}
          />
        ))}
      </Card>
    </section>
  );
}
