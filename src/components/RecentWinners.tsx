import styled from 'styled-components';
import { BORDER_COLOR, CTA_COLOR, MESSAGING_COLOR, NAMED_COLOR, TEXT_COLOR } from '../design/tokens';
import type { Team, Week } from '../types';
import { formatTime } from '../util/time';
import { Card, SectionEyebrow } from './ui';

const Item = styled.div`
  padding: 15px 18px;
  border-bottom: 1px solid ${BORDER_COLOR.PRIMARY};

  &:last-child {
    border-bottom: none;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

const WeekName = styled.span`
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 16px;
  color: ${TEXT_COLOR.PRIMARY};
`;

const Date = styled.span`
  font-size: 12px;
  color: ${TEXT_COLOR.SECONDARY};
`;

const Champ = styled.span`
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  color: ${CTA_COLOR.DARK};
  font-variant-numeric: tabular-nums;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 2px;

  /* thin, unobtrusive scrollbar only if the row overflows */
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${BORDER_COLOR.PRIMARY};
    border-radius: 3px;
  }
`;

const Chip = styled.span<{ $win?: boolean; $dnp?: boolean }>`
  flex: none;
  white-space: nowrap;
  font-size: 11.5px;
  padding: 4px 9px;
  border-radius: 20px;
  font-variant-numeric: tabular-nums;
  ${(p) =>
    p.$win
      ? `background:${CTA_COLOR.PRIMARY};color:${NAMED_COLOR.WHITE};font-weight:600;`
      : p.$dnp
        ? `background:transparent;border:1px dashed ${BORDER_COLOR.PRIMARY};color:${TEXT_COLOR.SECONDARY};`
        : `background:${MESSAGING_COLOR.BACKGROUND.INFO};color:${TEXT_COLOR.PRIMARY};`}
`;

const Wrap = styled.div`
  margin-top: 30px;
`;

interface Props {
  weeks: Week[];
  teams: Team[];
}

export function RecentWinners({ weeks, teams }: Props) {
  const finals = weeks.filter((w) => w.status === 'final').slice().reverse();
  if (finals.length === 0) return null;

  return (
    <Wrap>
      <SectionEyebrow>Recent winners</SectionEyebrow>
      <Card>
        {finals.map((w) => {
          const played = teams
            .map((t) => ({ name: t.name, entry: w.entries[t.name] }))
            .filter((r) => r.entry && (r.entry.dnp || r.entry.seconds !== null));
          const ranked = played
            .filter((r) => !r.entry!.dnp && r.entry!.seconds !== null)
            .sort((a, b) => (a.entry!.seconds ?? 0) - (b.entry!.seconds ?? 0));
          const dnp = played.filter((r) => r.entry!.dnp);

          return (
            <Item key={w.id}>
              <Row>
                <WeekName>{w.label}</WeekName>
                {w.date && <Date>{w.date}</Date>}
                <Champ>
                  🏆 {w.winner} · {formatTime(w.entries[w.winner ?? '']?.seconds ?? null)}
                </Champ>
              </Row>
              <Chips>
                {ranked.map((r) => (
                  <Chip key={r.name} $win={r.name === w.winner}>
                    {r.name === w.winner ? '🏆 ' : ''}
                    {r.name} · {formatTime(r.entry!.seconds)}
                  </Chip>
                ))}
                {dnp.map((r) => (
                  <Chip key={r.name} $dnp>
                    {r.name} · DNP
                  </Chip>
                ))}
              </Chips>
            </Item>
          );
        })}
      </Card>
    </Wrap>
  );
}
