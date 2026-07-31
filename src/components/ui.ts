import styled from 'styled-components';
import { BORDER_COLOR, NAMED_COLOR, TEXT_COLOR } from '../design/tokens';

/** Shared surface used across the app. */
export const Card = styled.div`
  background: ${NAMED_COLOR.WHITE};
  border: 1px solid ${BORDER_COLOR.PRIMARY};
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 38, 57, 0.05);
  overflow: hidden;
`;

export const SectionEyebrow = styled.p`
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  color: ${TEXT_COLOR.SECONDARY};
`;
