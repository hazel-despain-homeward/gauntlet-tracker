import { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  BORDER_COLOR,
  BRAND_COLOR,
  CTA_COLOR,
  MESSAGING_COLOR,
  NAMED_COLOR,
  TEXT_COLOR,
} from '../design/tokens';
import type { Team, Week } from '../types';
import type { TeamStat } from '../util/stats';
import { formatTime } from '../util/time';
import { computeStats } from '../util/stats';
import { Card, SectionEyebrow } from './ui';

type SortKey = 'wins' | 'played' | 'avg' | 'best';

const Records = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 22px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Record = styled.div<{ $worst?: boolean }>`
  padding: 18px;
  display: flex;
  gap: 14px;
  align-items: flex-start;

  .ic {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    font-size: 20px;
    background: ${(p) =>
      p.$worst ? MESSAGING_COLOR.BACKGROUND.WARNING : NAMED_COLOR.LIGHTGREEN};
  }
  .lab {
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    color: ${TEXT_COLOR.SECONDARY};
  }
  .big {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 24px;
    color: ${TEXT_COLOR.PRIMARY};
    margin-top: 2px;
    font-variant-numeric: tabular-nums;
  }
  .who {
    font-size: 13px;
    color: ${TEXT_COLOR.SECONDARY};
    margin-top: 2px;
  }
  .who b {
    color: ${(p) => (p.$worst ? BRAND_COLOR.TERTIARY : CTA_COLOR.DARK)};
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;

  th {
    text-align: left;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${TEXT_COLOR.SECONDARY};
    font-weight: 700;
    padding: 12px 16px;
    border-bottom: 1px solid ${BORDER_COLOR.PRIMARY};
    white-space: nowrap;
  }
  th.n,
  td.n {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  th.sortable {
    cursor: pointer;
    user-select: none;
  }
  th.sortable:hover {
    color: ${TEXT_COLOR.PRIMARY};
  }
  .caret {
    margin-left: 5px;
    font-size: 9px;
    color: ${CTA_COLOR.PRIMARY};
  }
  .caret.dim {
    opacity: 0.3;
    color: ${TEXT_COLOR.SECONDARY};
  }
  td {
    padding: 13px 16px;
    border-bottom: 1px solid ${BORDER_COLOR.PRIMARY};
    color: ${TEXT_COLOR.PRIMARY};
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover {
    background: ${MESSAGING_COLOR.BACKGROUND.DECORATIVE};
  }
`;

const TeamCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;

  .rank {
    flex: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    background: ${NAMED_COLOR.LIGHTGREEN};
    color: ${BRAND_COLOR.PRIMARY};
  }
  .rank.first {
    background: ${CTA_COLOR.PRIMARY};
    color: ${NAMED_COLOR.WHITE};
  }
`;

const Empty = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: ${TEXT_COLOR.SECONDARY};
  font-size: 13.5px;
`;

interface Props {
  weeks: Week[];
  teams: Team[];
}

export function StatsPage({ weeks, teams }: Props) {
  const stats = computeStats(weeks, teams);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'wins',
    dir: 'desc',
  });

  const sorted = useMemo(() => {
    const arr = [...stats.teams];
    const { key, dir } = sort;
    arr.sort((a: TeamStat, b: TeamStat) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1; // nulls always last
      if (bv == null) return -1;
      const cmp = av - bv;
      return dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [stats.teams, sort]);

  // Wins/played read best high-to-low; times read best low-to-high.
  const defaultDir = (k: SortKey): 'asc' | 'desc' => (k === 'avg' || k === 'best' ? 'asc' : 'desc');
  const clickSort = (k: SortKey) =>
    setSort((prev) =>
      prev.key === k ? { key: k, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: defaultDir(k) },
    );
  const th = (label: string, k: SortKey) => (
    <th
      className="n sortable"
      aria-sort={sort.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      onClick={() => clickSort(k)}
    >
      {label}
      <span className={'caret' + (sort.key === k ? '' : ' dim')}>
        {sort.key === k ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </th>
  );

  if (stats.weeksCompleted === 0) {
    return (
      <>
        <SectionEyebrow>Stats</SectionEyebrow>
        <Card>
          <Empty>No completed weeks yet — stats appear once a week is finalized.</Empty>
        </Card>
      </>
    );
  }

  const anyWins = stats.teams.some((t) => t.wins > 0);

  return (
    <>
      <SectionEyebrow>Records · {stats.weeksCompleted} week{stats.weeksCompleted === 1 ? '' : 's'}</SectionEyebrow>
      <Records>
        <Card as={Record}>
          <div className="ic">🥇</div>
          <div>
            <div className="lab">Best time on record</div>
            <div className="big">{stats.best ? formatTime(stats.best.seconds) : '—'}</div>
            <div className="who">
              {stats.best ? (
                <>
                  <b>{stats.best.team}</b> · {stats.best.week}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
        </Card>
        <Card as={Record} $worst>
          <div className="ic">🐌</div>
          <div>
            <div className="lab">Slowest time on record</div>
            <div className="big">{stats.worst ? formatTime(stats.worst.seconds) : '—'}</div>
            <div className="who">
              {stats.worst ? (
                <>
                  <b>{stats.worst.team}</b> · {stats.worst.week}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
        </Card>
      </Records>

      <SectionEyebrow>Team standings</SectionEyebrow>
      <Card>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Team</th>
                {th('Wins', 'wins')}
                {th('Avg time', 'avg')}
                {th('Best', 'best')}
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => (
                <tr key={t.team}>
                  <td>
                    <TeamCell>
                      <span className={`rank${i === 0 && sort.key === 'wins' && anyWins ? ' first' : ''}`}>
                        {i + 1}
                      </span>
                      {t.team}
                    </TeamCell>
                  </td>
                  <td className="n">{t.wins}</td>
                  <td className="n">{t.avg == null ? '—' : formatTime(t.avg)}</td>
                  <td className="n">{t.best == null ? '—' : formatTime(t.best)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </Card>
    </>
  );
}
