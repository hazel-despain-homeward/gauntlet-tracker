import styled from 'styled-components';
import {
  BORDER_COLOR,
  CTA_COLOR,
  MESSAGING_COLOR,
  NAMED_COLOR,
  TEXT_COLOR,
} from '../design/tokens';
import type { Progress, Team, Week } from '../types';
import { TeamRow } from './TeamRow';
import { Card, SectionEyebrow } from './ui';

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const WeekTitle = styled.h2`
  font-size: 24px;
`;

const Sub = styled.p`
  margin: 2px 0 0;
  font-size: 13px;
  color: ${TEXT_COLOR.SECONDARY};
`;

const HeadRight = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const RulesBtn = styled.button`
  appearance: none;
  background: ${NAMED_COLOR.WHITE};
  border: 1px solid ${BORDER_COLOR.PRIMARY};
  color: ${CTA_COLOR.DARK};
  font-family: inherit;
  font-weight: 600;
  font-size: 12.5px;
  padding: 7px 13px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    border-color: ${CTA_COLOR.PRIMARY};
    background: ${MESSAGING_COLOR.BACKGROUND.DECORATIVE};
  }
`;

const Ring = styled.div<{ $pct: number }>`
  --p: ${(p) => p.$pct};
  width: 52px;
  height: 52px;
  border-radius: 50%;
  flex: none;
  display: grid;
  place-items: center;
  background: conic-gradient(
    ${CTA_COLOR.PRIMARY} calc(var(--p) * 1%),
    ${NAMED_COLOR.LIGHTGREEN} 0
  );

  span {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${NAMED_COLOR.WHITE};
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    color: ${TEXT_COLOR.PRIMARY};
    font-variant-numeric: tabular-nums;
  }
`;

const FinalBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 12px;
  background: ${MESSAGING_COLOR.BACKGROUND.DECORATIVE};
  border: 1px solid ${CTA_COLOR.LIGHT};
`;

const Msg = styled.div`
  font-size: 13.5px;
  color: ${TEXT_COLOR.PRIMARY};

  b {
    color: ${CTA_COLOR.DARK};
  }
`;

interface Props {
  week: Week;
  teams: Team[];
  progress: Progress;
  onEntry: (team: string, seconds: number | null, dnp: boolean) => void;
  onViewRules: () => void;
}

export function WeekBoard({ week, teams, progress, onEntry, onViewRules }: Props) {
  const pct = progress.total ? Math.round((progress.reported / progress.total) * 100) : 0;
  const remaining = progress.total - progress.reported;
  const allIn = remaining === 0;

  return (
    <section>
      <SectionEyebrow>Active week</SectionEyebrow>
      <Head>
        <div>
          <WeekTitle>{week.label}</WeekTitle>
          <Sub>Log your time - lowest time wins</Sub>
        </div>
        <HeadRight>
          <RulesBtn type="button" onClick={onViewRules}>
            View rules
          </RulesBtn>
          <Ring $pct={pct} aria-label={`${progress.reported} of ${progress.total} reported`}>
            <span>
              {progress.reported}/{progress.total}
            </span>
          </Ring>
        </HeadRight>
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

      <FinalBar>
        <Msg>
          {allIn ? (
            <>
              All <b>{progress.total}</b> teams reported — crowning the winner and posting to
              Slack…
            </>
          ) : (
            <>
              <b>{remaining}</b> team{remaining === 1 ? '' : 's'} still to report. The winner posts
              automatically once everyone’s in.
            </>
          )}
        </Msg>
      </FinalBar>
    </section>
  );
}
