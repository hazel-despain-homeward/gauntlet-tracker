import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { BORDER_COLOR, CTA_COLOR, NAMED_COLOR, TEXT_COLOR } from '../design/tokens';
import type { Team, Week } from '../types';
import { teamColor } from '../util/teamColor';
import { computeCumulative, computeMonthly, type MonthStanding } from '../util/monthly';
import { Card, SectionEyebrow } from './ui';

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
`;

const Title = styled.h2`
  font-size: 24px;
`;

const Picker = styled.select`
  appearance: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: ${TEXT_COLOR.PRIMARY};
  background: ${NAMED_COLOR.WHITE};
  border: 1px solid ${BORDER_COLOR.PRIMARY};
  border-radius: 9px;
  padding: 8px 30px 8px 12px;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, ${TEXT_COLOR.SECONDARY} 50%),
    linear-gradient(135deg, ${TEXT_COLOR.SECONDARY} 50%, transparent 50%);
  background-position:
    calc(100% - 16px) 55%,
    calc(100% - 11px) 55%;
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;

  &:hover {
    border-color: ${CTA_COLOR.PRIMARY};
  }
`;

const Sub = styled.p`
  margin: 2px 0 18px;
  font-size: 12.5px;
  color: ${TEXT_COLOR.SECONDARY};
`;

const Podium = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Spot = styled.div<{ $rank: number }>`
  border-radius: 12px;
  padding: 16px;
  background: ${NAMED_COLOR.WHITE};
  border: ${(p) => (p.$rank === 1 ? `2px solid ${CTA_COLOR.PRIMARY}` : `1px solid ${BORDER_COLOR.PRIMARY}`)};

  .medal {
    font-size: 22px;
  }
  .team {
    font-weight: 700;
    font-size: 16px;
    color: ${TEXT_COLOR.PRIMARY};
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .team .dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    flex: none;
  }
  .pts {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    color: ${TEXT_COLOR.PRIMARY};
    margin-top: 6px;
  }
  .pts small {
    font-family: inherit;
    font-size: 13px;
    color: ${TEXT_COLOR.SECONDARY};
    font-weight: 600;
  }
`;

const Rows = styled.div``;

const Row = styled.div`
  display: grid;
  grid-template-columns: 26px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  border-bottom: 1px solid ${BORDER_COLOR.PRIMARY};

  &:last-child {
    border-bottom: none;
  }
`;

const Rank = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 13px;
  color: ${TEXT_COLOR.SECONDARY};
  text-align: center;
`;

const TeamBar = styled.div`
  min-width: 0;

  .name {
    display: flex;
    align-items: center;
    gap: 9px;
    font-weight: 600;
    font-size: 14px;
    color: ${TEXT_COLOR.PRIMARY};
    margin-bottom: 5px;
  }
  .name .dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    flex: none;
  }
  .track {
    height: 8px;
    border-radius: 5px;
    background: ${NAMED_COLOR.LIGHTGREEN};
    overflow: hidden;
  }
  .track > i {
    display: block;
    height: 100%;
    border-radius: 5px;
  }
`;

const Right = styled.div`
  text-align: right;
  white-space: nowrap;

  .pts {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    font-size: 15px;
    color: ${TEXT_COLOR.PRIMARY};
  }
  .breakdown {
    font-size: 11.5px;
    color: ${TEXT_COLOR.SECONDARY};
    margin-top: 2px;
  }
`;

interface Props {
  weeks: Week[];
  teams: Team[];
}

export function MonthlyStandings({ weeks, teams }: Props) {
  const months = useMemo(() => computeMonthly(weeks, teams), [weeks, teams]);
  const [monthKey, setMonthKey] = useState<string | null>(null);

  if (months.length === 0) return null;

  const active = months.find((m) => m.key === monthKey) ?? months[0];
  const cumulative = computeCumulative(months, teams);
  const totalWeeks = months.reduce((a, m) => a + m.weekCount, 0);
  const colorOf = (name: string) => teamColor(teams.findIndex((t) => t.name === name));
  const medals = ['🥇', '🥈', '🥉'];

  const breakdown = (s: { gold: number; silver: number; bronze: number; weeks: number }) => {
    const parts: string[] = [];
    if (s.gold) parts.push(`🥇×${s.gold}`);
    if (s.silver) parts.push(`🥈×${s.silver}`);
    if (s.bronze) parts.push(`🥉×${s.bronze}`);
    parts.push(`${s.weeks} wk${s.weeks === 1 ? '' : 's'}`);
    return parts.join(' · ');
  };

  const barRows = (list: MonthStanding[]) => {
    const max = list[0]?.points || 1;
    return list.map((s, i) => (
      <Row key={s.team}>
        <Rank>{i + 1}</Rank>
        <TeamBar>
          <div className="name">
            <span className="dot" style={{ background: colorOf(s.team) }} />
            {s.team}
          </div>
          <div className="track">
            <i style={{ width: `${Math.round((s.points / max) * 100)}%`, background: colorOf(s.team) }} />
          </div>
        </TeamBar>
        <Right>
          <div className="pts">{s.points} pts</div>
          <div className="breakdown">{breakdown(s)}</div>
        </Right>
      </Row>
    ));
  };

  return (
    <>
      <section style={{ marginBottom: '28px' }}>
        <Head>
          <div>
            <SectionEyebrow>Monthly standings</SectionEyebrow>
            <Title>Points race</Title>
          </div>
          <Picker
            value={active.key}
            onChange={(e) => setMonthKey(e.target.value)}
            aria-label="Select month"
          >
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </Picker>
        </Head>
        <Sub>
          {active.weekCount} week{active.weekCount === 1 ? '' : 's'} · weekly finishers score 5 · 4 · 3 · 2 · 1
        </Sub>

        <Podium>
          {active.standings.slice(0, 3).map((s, i) => (
            <Spot key={s.team} $rank={i + 1}>
              <div className="medal">{medals[i]}</div>
              <div className="team">
                <span className="dot" style={{ background: colorOf(s.team) }} />
                {s.team}
              </div>
              <div className="pts">
                {s.points} <small>pts</small>
              </div>
            </Spot>
          ))}
        </Podium>

        <Card>
          <Rows>{barRows(active.standings)}</Rows>
        </Card>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <SectionEyebrow>Season to date · {totalWeeks} week{totalWeeks === 1 ? '' : 's'}</SectionEyebrow>
        <Title>Overall points</Title>
        <Sub>Every week this season, all months combined.</Sub>
        <Card>
          <Rows>{barRows(cumulative)}</Rows>
        </Card>
      </section>
    </>
  );
}
