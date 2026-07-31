import styled from 'styled-components';
import {
  BORDER_COLOR,
  BRAND_COLOR,
  CTA_COLOR,
  MESSAGING_COLOR,
  NAMED_COLOR,
  TEXT_COLOR,
} from '../design/tokens';
import type { Progress, Team, Week } from '../types';
import { formatTime } from '../util/time';
import { teamColor } from '../util/teamColor';
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

const RightHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Ring = styled.div<{ $pct: number }>`
  --p: ${(p) => p.$pct};
  width: 52px;
  height: 52px;
  border-radius: 50%;
  flex: none;
  display: grid;
  place-items: center;
  background: conic-gradient(${CTA_COLOR.PRIMARY} calc(var(--p) * 1%), ${NAMED_COLOR.LIGHTGREEN} 0);

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

  &:hover {
    border-color: ${CTA_COLOR.PRIMARY};
    background: ${MESSAGING_COLOR.BACKGROUND.DECORATIVE};
  }
`;

const Rows = styled.div``;

const Row = styled.div<{ $me: boolean; $muted: boolean }>`
  display: grid;
  grid-template-columns: 26px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid ${BORDER_COLOR.PRIMARY};
  background: ${(p) => (p.$me ? MESSAGING_COLOR.BACKGROUND.DECORATIVE : 'transparent')};
  opacity: ${(p) => (p.$muted ? 0.7 : 1)};

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

const Name = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 600;
  color: ${TEXT_COLOR.PRIMARY};

  .dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    flex: none;
  }
  .you {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: ${CTA_COLOR.DARK};
    background: ${NAMED_COLOR.WHITE};
    border: 1px solid ${CTA_COLOR.LIGHT};
    border-radius: 10px;
    padding: 1px 6px;
  }
`;

const Val = styled.div<{ $kind: 'time' | 'waiting' | 'dnp' }>`
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 15px;
  text-align: right;
  ${(p) =>
    p.$kind === 'time'
      ? `color:${TEXT_COLOR.PRIMARY};`
      : p.$kind === 'dnp'
        ? `color:${MESSAGING_COLOR.ACCENT.WARNING};font-size:12px;`
        : `color:${TEXT_COLOR.SECONDARY};font-size:12px;font-weight:600;`}
`;

const FootNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: ${MESSAGING_COLOR.BACKGROUND.DECORATIVE};
  border: 1px solid ${CTA_COLOR.LIGHT};
  font-size: 13px;
  color: ${BRAND_COLOR.PRIMARY};

  b {
    color: ${CTA_COLOR.DARK};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
`;

const LinkBtn = styled.button`
  appearance: none;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: ${TEXT_COLOR.SECONDARY};
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  week: Week;
  teams: Team[];
  progress: Progress;
  myTeam: string;
  onViewRules: () => void;
  onRedo: () => void;
  onEdit: () => void;
}

export function WeekResults({ week, teams, progress, myTeam, onViewRules, onRedo, onEdit }: Props) {
  const colorOf = (name: string) => teamColor(teams.findIndex((t) => t.name === name));

  const played = teams
    .map((t) => ({ name: t.name, entry: week.entries[t.name] }))
    .filter((r) => r.entry && !r.entry.dnp && r.entry.seconds != null)
    .sort((a, b) => (a.entry!.seconds ?? 0) - (b.entry!.seconds ?? 0));
  const dnp = teams.filter((t) => week.entries[t.name]?.dnp);
  const waiting = teams.filter(
    (t) => !week.entries[t.name] || (!week.entries[t.name]!.dnp && week.entries[t.name]!.seconds == null),
  );

  const remaining = progress.total - progress.reported;
  const pct = progress.total ? Math.round((progress.reported / progress.total) * 100) : 0;

  const NameCell = (name: string) => (
    <Name>
      <span className="dot" style={{ background: colorOf(name) }} />
      {name}
    </Name>
  );

  return (
    <section>
      <SectionEyebrow>Current week · live results</SectionEyebrow>
      <Head>
        <div>
          <Title>{week.label}</Title>
          <Sub>Times reveal as teams finish. Lowest time wins.</Sub>
        </div>
        <RightHead>
          <RulesBtn onClick={onViewRules}>View rules</RulesBtn>
          <Ring $pct={pct} aria-label={`${progress.reported} of ${progress.total} logged`}>
            <span>
              {progress.reported}/{progress.total}
            </span>
          </Ring>
        </RightHead>
      </Head>

      <Card>
        <Rows>
          {played.map((r, i) => (
            <Row key={r.name} $me={r.name === myTeam} $muted={false}>
              <Rank>{i + 1}</Rank>
              {NameCell(r.name)}
              <Val $kind="time">{formatTime(r.entry!.seconds)}</Val>
            </Row>
          ))}
          {waiting.map((t) => (
            <Row key={t.name} $me={t.name === myTeam} $muted>
              <Rank>·</Rank>
              {NameCell(t.name)}
              <Val $kind="waiting">Waiting…</Val>
            </Row>
          ))}
          {dnp.map((t) => (
            <Row key={t.name} $me={t.name === myTeam} $muted>
              <Rank>·</Rank>
              {NameCell(t.name)}
              <Val $kind="dnp">Did not play</Val>
            </Row>
          ))}
        </Rows>
      </Card>

      <FootNote>
        {remaining > 0 ? (
          <span>
            Waiting on <b>{remaining}</b> more team{remaining === 1 ? '' : 's'}. The winner posts
            automatically once everyone’s in.
          </span>
        ) : (
          <span>All teams reported — crowning the winner…</span>
        )}
      </FootNote>

      <Actions>
        <LinkBtn onClick={onRedo}>Redo my time</LinkBtn>
        <LinkBtn onClick={onEdit}>✎ Edit times</LinkBtn>
      </Actions>
    </section>
  );
}
