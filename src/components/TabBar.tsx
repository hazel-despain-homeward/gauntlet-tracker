import styled from 'styled-components';
import {
  BORDER_COLOR,
  BRAND_COLOR,
  CTA_COLOR,
  MESSAGING_COLOR,
  NAMED_COLOR,
} from '../design/tokens';

export type TabKey = 'current' | 'history' | 'stats';

const Bar = styled.nav`
  background: ${NAMED_COLOR.WHITE};
  border-bottom: 1px solid ${BORDER_COLOR.PRIMARY};
  position: sticky;
  top: 0;
  z-index: 20;
`;

const Inner = styled.div`
  max-width: 880px;
  margin: 0 auto;
  padding: 7px 12px;
  display: flex;
  gap: 6px;
`;

const Tab = styled.button<{ $active: boolean }>`
  appearance: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  font-size: 13.5px;
  padding: 5px 14px;
  border-radius: 7px;
  transition:
    background 0.15s,
    color 0.15s;
  color: ${(p) => (p.$active ? NAMED_COLOR.WHITE : CTA_COLOR.PRIMARY)};
  background: ${(p) => (p.$active ? BRAND_COLOR.PRIMARY : 'transparent')};

  &:hover {
    background: ${(p) =>
      p.$active ? BRAND_COLOR.PRIMARY : MESSAGING_COLOR.BACKGROUND.DECORATIVE};
  }
`;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'current', label: 'Current' },
  { key: 'history', label: 'History' },
  { key: 'stats', label: 'Stats' },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export function TabBar({ active, onChange }: Props) {
  return (
    <Bar>
      <Inner role="tablist">
        {TABS.map((t) => (
          <Tab
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            $active={active === t.key}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </Tab>
        ))}
      </Inner>
    </Bar>
  );
}
