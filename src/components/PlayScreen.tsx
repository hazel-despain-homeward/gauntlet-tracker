import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  BORDER_COLOR,
  BRAND_COLOR,
  CTA_COLOR,
  MESSAGING_COLOR,
  NAMED_COLOR,
  TEXT_COLOR,
} from '../design/tokens';
import type { Week } from '../types';
import { SectionEyebrow } from './ui';

// Opened in this order, each in its own tab, from the single Open Games click.
const GAMES = [
  { name: 'Contexto', url: 'https://contexto.me/en/daily' },
  { name: 'Connections', url: 'https://www.nytimes.com/games/connections' },
  { name: 'Strands', url: 'https://www.nytimes.com/games/strands' },
  { name: 'Wordle', url: 'https://www.nytimes.com/games/wordle/index.html' },
];

const Card = styled.div`
  background: ${NAMED_COLOR.WHITE};
  border: 1px solid ${BORDER_COLOR.PRIMARY};
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 38, 57, 0.05);
  padding: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 2px;
`;

const Sub = styled.p`
  margin: 0 0 20px;
  font-size: 13.5px;
  color: ${TEXT_COLOR.SECONDARY};
`;

const OpenGames = styled.button`
  appearance: none;
  width: 100%;
  border: none;
  border-radius: 12px;
  background: ${BRAND_COLOR.PRIMARY};
  color: ${NAMED_COLOR.WHITE};
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  padding: 15px;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.05s;

  &:hover {
    background: #26394c;
  }
  &:active {
    transform: translateY(1px);
  }
`;

const GameHint = styled.p`
  margin: 8px 0 0;
  font-size: 11.5px;
  color: ${TEXT_COLOR.SECONDARY};
  text-align: center;
`;

const Watch = styled.div`
  margin: 26px 0 18px;
  text-align: center;
`;

const Clock = styled.div<{ $running: boolean }>`
  font-family: 'Playfair Display', serif;
  font-variant-numeric: tabular-nums;
  font-size: 68px;
  line-height: 1;
  letter-spacing: 0.01em;
  color: ${(p) => (p.$running ? CTA_COLOR.DARK : TEXT_COLOR.PRIMARY)};
`;

const Buttons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 18px;
`;

const Btn = styled.button<{ $variant: 'primary' | 'secondary' | 'ghost' }>`
  appearance: none;
  flex: 1;
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  padding: 14px;
  border-radius: 11px;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.05s;

  ${(p) =>
    p.$variant === 'primary'
      ? `border:none;background:${CTA_COLOR.PRIMARY};color:${NAMED_COLOR.WHITE};`
      : p.$variant === 'secondary'
        ? `border:1px solid ${BORDER_COLOR.PRIMARY};background:${NAMED_COLOR.WHITE};color:${TEXT_COLOR.PRIMARY};`
        : `border:1px solid ${BORDER_COLOR.PRIMARY};background:${NAMED_COLOR.WHITE};color:${TEXT_COLOR.SECONDARY};`}

  &:hover {
    ${(p) => (p.$variant === 'primary' ? `background:${CTA_COLOR.DARK};` : `border-color:${CTA_COLOR.PRIMARY};`)}
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Foot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid ${BORDER_COLOR.PRIMARY};
`;

const LinkBtn = styled.button`
  appearance: none;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: ${CTA_COLOR.DARK};
  padding: 4px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const DnpBtn = styled(LinkBtn)`
  color: ${MESSAGING_COLOR.ACCENT.WARNING};
`;

const Switch = styled.button`
  appearance: none;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: ${TEXT_COLOR.SECONDARY};
  margin-top: 14px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

function fmtWatch(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${m}:${String(s).padStart(2, '0')}.${tenths}`;
}

interface Props {
  week: Week;
  team: string;
  onLog: (seconds: number) => void;
  onDnp: () => void;
  onViewRules: () => void;
  onSwitch: () => void;
}

export function PlayScreen({ week, team, onLog, onDnp, onViewRules, onSwitch }: Props) {
  const [running, setRunning] = useState(false);
  const [ms, setMs] = useState(0);
  const baseRef = useRef(0); // performance.now() at (start - elapsed)
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tick = () => {
    setMs(performance.now() - baseRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    baseRef.current = performance.now() - ms;
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const halt = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setRunning(false);
  };

  const reset = () => {
    halt();
    setMs(0);
  };

  const stop = () => {
    const finalMs = performance.now() - baseRef.current;
    halt();
    onLog(Math.max(1, Math.round(finalMs / 1000)));
  };

  const openGames = () => {
    for (const g of GAMES) {
      window.open(g.url, '_blank', 'noopener,noreferrer');
    }
  };

  const dnp = () => {
    if (window.confirm(`Mark ${team} as “Did not play” for ${week.label}?`)) onDnp();
  };

  return (
    <section>
      <SectionEyebrow>{week.label} · playing as {team}</SectionEyebrow>
      <Card>
        <Title>You’re up, {team}</Title>
        <Sub>Open the games, start the clock, play all four, then stop — lowest time wins.</Sub>

        <OpenGames onClick={openGames}>Open all four games ↗</OpenGames>
        <GameHint>Opens Contexto, Connections, Strands & Wordle in new tabs. Allow pop-ups if prompted.</GameHint>

        <Watch>
          <Clock $running={running}>{fmtWatch(ms)}</Clock>
        </Watch>

        {!running ? (
          <Buttons>
            <Btn $variant="primary" onClick={start}>
              {ms > 0 ? 'Resume' : 'Start'}
            </Btn>
          </Buttons>
        ) : (
          <Buttons>
            <Btn $variant="secondary" onClick={reset}>
              Reset
            </Btn>
            <Btn $variant="primary" onClick={stop}>
              Stop
            </Btn>
          </Buttons>
        )}

        <Foot>
          <LinkBtn onClick={onViewRules}>View rules</LinkBtn>
          <DnpBtn onClick={dnp}>We didn’t play</DnpBtn>
        </Foot>
      </Card>

      <Switch onClick={onSwitch}>Not {team}? Switch team</Switch>
    </section>
  );
}
