import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  BORDER_COLOR,
  CTA_COLOR,
  MESSAGING_COLOR,
  NAMED_COLOR,
  TEXT_COLOR,
} from '../design/tokens';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 38, 57, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
`;

const Dialog = styled.div`
  background: ${NAMED_COLOR.WHITE};
  border-radius: 16px;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 20px 60px -20px rgba(0, 38, 57, 0.5);
  overflow: hidden;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 22px 14px;
`;

const HTitle = styled.h2`
  font-size: 22px;
`;

const Close = styled.button`
  appearance: none;
  border: none;
  background: ${NAMED_COLOR.LIGHTGREY};
  color: ${TEXT_COLOR.SECONDARY};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex: none;

  &:hover {
    background: ${BORDER_COLOR.PRIMARY};
    color: ${TEXT_COLOR.PRIMARY};
  }
`;

const Body = styled.div`
  padding: 0 22px 22px;
`;

const Lede = styled.p`
  margin: 0 0 16px;
  font-size: 13.5px;
  color: ${TEXT_COLOR.SECONDARY};
`;

const Rule = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid ${BORDER_COLOR.PRIMARY};

  &:first-of-type {
    border-top: none;
  }
`;

const Dot = styled.div`
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: ${MESSAGING_COLOR.BACKGROUND.DECORATIVE};
  color: ${CTA_COLOR.DARK};
  display: grid;
  place-items: center;
  font-size: 15px;
`;

const RuleText = styled.div`
  font-size: 13.5px;
  color: ${TEXT_COLOR.PRIMARY};
  line-height: 1.5;

  b {
    font-weight: 700;
  }
  span {
    color: ${TEXT_COLOR.SECONDARY};
  }
`;

const Games = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const Game = styled.span`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${NAMED_COLOR.LIGHTGREEN};
  color: ${CTA_COLOR.DARK};
`;

interface Props {
  onClose: () => void;
}

export function RulesModal({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <Backdrop onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        onClick={(e) => e.stopPropagation()}
      >
        <Head>
          <HTitle id="rules-title">How the Gauntlet works</HTitle>
          <Close ref={closeRef} onClick={onClose} aria-label="Close rules">
            ×
          </Close>
        </Head>
        <Body>
          <Lede>Fastest combined time across all four games wins the week.</Lede>

          <Rule>
            <Dot>🎮</Dot>
            <RuleText>
              <b>Play all four games.</b>
              <Games>
                <Game>Contexto</Game>
                <Game>Connections</Game>
                <Game>Strands</Game>
                <Game>Wordle</Game>
              </Games>
            </RuleText>
          </Rule>

          <Rule>
            <Dot>🚫</Dot>
            <RuleText>
              <b>No AI.</b> <span>No AI tools or assistance of any kind.</span>
            </RuleText>
          </Rule>

          <Rule>
            <Dot>🖥️</Dot>
            <RuleText>
              <b>One shared screen, one game at a time.</b>{' '}
              <span>
                Everything is completed on a single screen shared with everyone — no playing on your
                own computer or screen, and no splitting the screen to play multiple games at once.
              </span>
            </RuleText>
          </Rule>
        </Body>
      </Dialog>
    </Backdrop>
  );
}
