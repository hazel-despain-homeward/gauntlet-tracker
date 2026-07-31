import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import styled from 'styled-components';
import {
  BORDER_COLOR,
  BRAND_COLOR,
  CTA_COLOR,
  FONT,
  MESSAGING_COLOR,
  NAMED_COLOR,
  TEXT_COLOR,
} from '../design/tokens';
import type { SlackResult, Week } from '../types';
import { formatTime } from '../util/time';

// Homebase-palette confetti burst — fired once when a fresh winner is crowned.
function celebrate() {
  const colors = ['#207C84', '#374759', '#BB724E', '#B0D6D7', '#F8E192'];
  const fire = (particleRatio: number, opts: confetti.Options) =>
    confetti({ origin: { y: 0.35 }, colors, particleCount: Math.floor(180 * particleRatio), ...opts });
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

const Wrap = styled.section`
  border: 1px solid ${CTA_COLOR.LIGHT};
  border-radius: 14px;
  overflow: hidden;
  background: ${NAMED_COLOR.WHITE};
`;

const Top = styled.div`
  background: ${BRAND_COLOR.PRIMARY};
  color: ${NAMED_COLOR.WHITE};
  padding: 20px 22px;
`;

const Lab = styled.div`
  font-size: 11.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.9;
`;

const Win = styled.h2`
  color: ${NAMED_COLOR.WHITE};
  font-size: 26px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  span {
    font-family: ${FONT.BODY};
    font-size: 14px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.2);
    padding: 3px 11px;
    border-radius: 20px;
    font-variant-numeric: tabular-nums;
  }
`;

const Body = styled.div`
  padding: 18px 22px;
`;

const BarLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  .lab {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    color: ${TEXT_COLOR.SECONDARY};
  }
`;

const StatusPill = styled.span<{ $ok: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  ${(p) =>
    p.$ok
      ? `background:${MESSAGING_COLOR.BACKGROUND.SUCCESS};color:${MESSAGING_COLOR.ACCENT.SUCCESS};`
      : `background:${MESSAGING_COLOR.BACKGROUND.WARNING};color:${MESSAGING_COLOR.ACCENT.WARNING};`}
`;

const Pre = styled.pre`
  font-family:
    ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: ${TEXT_COLOR.PRIMARY};
  background: ${NAMED_COLOR.TAN};
  border: 1px solid ${BORDER_COLOR.PRIMARY};
  border-radius: 9px;
  padding: 14px 16px;
  white-space: pre-wrap;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
`;

const Note = styled.span`
  font-size: 12.5px;
  color: ${TEXT_COLOR.SECONDARY};
`;

const NextBtn = styled.button`
  border: none;
  border-radius: 9px;
  padding: 11px 18px;
  font-size: 14px;
  font-weight: 600;
  color: ${NAMED_COLOR.WHITE};
  background: ${CTA_COLOR.PRIMARY};
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${CTA_COLOR.DARK};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface Props {
  week: Week;
  slack: SlackResult;
  busy: boolean;
  celebrate?: boolean;
  onNext: () => void;
}

export function WinnerCard({ week, slack, busy, celebrate: shouldCelebrate, onNext }: Props) {
  const time = week.winner ? formatTime(week.entries[week.winner]?.seconds ?? null) : '—';
  const posted = slack.posted;

  useEffect(() => {
    if (!shouldCelebrate) return;
    // Only once per week (survives tab switches / re-mounts within the session).
    const key = `gauntlet:celebrated:${week.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      celebrate();
    }
  }, [shouldCelebrate, week.id]);

  return (
    <Wrap>
      <Top>
        <Lab>Winner · {week.label}</Lab>
        <Win>
          🏆 {week.winner}
          <span>{time}</span>
        </Win>
      </Top>
      <Body>
        <BarLabel>
          <span className="lab">Slack announcement → #{slack.channel}</span>
          <StatusPill $ok={posted}>
            {posted ? 'Posted to Slack' : 'Preview (not posted)'}
          </StatusPill>
        </BarLabel>
        <Pre>{slack.message}</Pre>
        <Actions>
          <Note>
            {posted
              ? 'Announcement delivered.'
              : slack.detail === 'no_slack_credentials'
                ? 'Add Slack credentials in the environment to post automatically.'
                : `Not posted: ${slack.detail ?? 'unknown error'}`}
          </Note>
          <NextBtn onClick={onNext} disabled={busy}>
            {busy ? 'Working…' : 'Start next week'}
          </NextBtn>
        </Actions>
      </Body>
    </Wrap>
  );
}
