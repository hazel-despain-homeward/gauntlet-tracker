import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  BORDER_COLOR,
  BRAND_COLOR,
  CTA_COLOR,
  FORM_FIELDS,
  MESSAGING_COLOR,
  NAMED_COLOR,
  TEXT_COLOR,
} from '../design/tokens';
import type { Entry } from '../types';
import { formatTime, parseTime } from '../util/time';

type Status = 'waiting' | 'logged' | 'dnp' | 'dnf';

const Row = styled.div<{ $status: Status }>`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  border-bottom: 1px solid ${BORDER_COLOR.PRIMARY};
  opacity: ${(p) => (p.$status === 'dnp' ? 0.6 : 1)};

  &:last-child {
    border-bottom: none;
  }
`;

const Name = styled.div`
  font-weight: 600;
  font-size: 14.5px;
  color: ${TEXT_COLOR.PRIMARY};
`;

const Pill = styled.span<{ $status: Status }>`
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
  ${(p) =>
    p.$status === 'logged'
      ? `background:${MESSAGING_COLOR.BACKGROUND.DECORATIVE};color:${CTA_COLOR.DARK};`
      : p.$status === 'dnp'
        ? `background:${MESSAGING_COLOR.BACKGROUND.WARNING};color:${MESSAGING_COLOR.ACCENT.WARNING};`
        : p.$status === 'dnf'
          ? `background:${MESSAGING_COLOR.BACKGROUND.INFO};color:${MESSAGING_COLOR.ACCENT.INFO};`
          : `background:${NAMED_COLOR.LIGHTGREY};color:${TEXT_COLOR.SECONDARY};`}
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Input = styled.input<{ $filled: boolean }>`
  width: 92px;
  text-align: center;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: ${TEXT_COLOR.PRIMARY};
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.$filled ? CTA_COLOR.LIGHT : FORM_FIELDS.BORDER_DEFAULT)};
  background: ${(p) => (p.$filled ? MESSAGING_COLOR.BACKGROUND.DECORATIVE : NAMED_COLOR.WHITE)};
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:focus {
    border-color: ${FORM_FIELDS.BORDER_FOCUSED};
    box-shadow: 0 0 0 3px rgba(32, 124, 132, 0.16);
  }
  &::placeholder {
    color: ${TEXT_COLOR.SECONDARY};
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  &:disabled {
    background: ${NAMED_COLOR.LIGHTGREY};
    color: ${TEXT_COLOR.TERTIARY};
    cursor: not-allowed;
  }
`;

const Toggle = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${TEXT_COLOR.SECONDARY};
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  input {
    width: 15px;
    height: 15px;
    accent-color: ${BRAND_COLOR.PRIMARY};
    cursor: pointer;
  }
`;

interface Props {
  name: string;
  entry: Entry | undefined;
  onChange: (seconds: number | null, dnp: boolean, dnf: boolean) => void;
}

export function TeamRow({ name, entry, onChange }: Props) {
  const dnp = !!entry?.dnp;
  const dnf = !!entry?.dnf;
  const seconds = entry?.seconds ?? null;
  const status: Status = dnp ? 'dnp' : dnf ? 'dnf' : seconds !== null ? 'logged' : 'waiting';

  const [text, setText] = useState(seconds !== null ? formatTime(seconds) : '');

  useEffect(() => {
    setText(seconds !== null ? formatTime(seconds) : '');
  }, [seconds]);

  // Live mask so times can be typed without a colon: "820" -> "8:20".
  const mask = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 4);
    return d.length <= 2 ? d : d.slice(0, d.length - 2) + ':' + d.slice(d.length - 2);
  };

  const commit = () => {
    if (!text.trim()) {
      onChange(null, false, false);
      return;
    }
    const parsed = parseTime(text);
    if (parsed === null) {
      setText(seconds !== null ? formatTime(seconds) : '');
      return;
    }
    setText(formatTime(parsed));
    onChange(parsed, false, false);
  };

  const label =
    status === 'logged'
      ? 'Logged'
      : status === 'dnp'
        ? 'Did not play'
        : status === 'dnf'
          ? 'Didn’t finish'
          : 'Waiting';

  return (
    <Row $status={status}>
      <Name>{name}</Name>
      <Pill $status={status}>{label}</Pill>
      <Controls>
        <Input
          $filled={status === 'logged'}
          type="text"
          inputMode="numeric"
          placeholder="––:––"
          aria-label={`${name} time in minutes and seconds`}
          value={dnp || dnf ? '' : text}
          disabled={dnp || dnf}
          onChange={(e) => setText(mask(e.target.value))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
        />
        <Toggle>
          <input
            type="checkbox"
            checked={dnf}
            aria-label={`${name} didn’t finish`}
            onChange={(e) => onChange(null, false, e.target.checked)}
          />
          DNF
        </Toggle>
        <Toggle>
          <input
            type="checkbox"
            checked={dnp}
            aria-label={`${name} did not play`}
            onChange={(e) => onChange(null, e.target.checked, false)}
          />
          DNP
        </Toggle>
      </Controls>
    </Row>
  );
}
