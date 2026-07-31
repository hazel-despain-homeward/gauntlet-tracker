import styled from 'styled-components';
import { BRAND_COLOR, CTA_COLOR, FONT, NAMED_COLOR, MIN_WIDTH } from '../design/tokens';

const Bar = styled.header`
  background: ${BRAND_COLOR.PRIMARY};
  border-bottom: 3px solid ${CTA_COLOR.PRIMARY};
`;

const Inner = styled.div`
  max-width: 880px;
  margin: 0 auto;
  padding: 11px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

// Wordmark: house brandmark + "h" + the logo's own "o" glyph + "me" (bold) + "race" (light).
const Brand = styled.div`
  display: flex;
  align-items: center;
  color: ${NAMED_COLOR.WHITE};
  font-family: ${FONT.BODY};
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.02em;
`;

const Bold = styled.span`
  font-weight: 700;
`;

const Light = styled.span`
  font-weight: 500;
`;

// House brandmark (paths verbatim from homebase-logo.svg), sits before the "h".
const HouseMark = styled.svg`
  height: 1.05em;
  width: auto;
  display: block;
  margin-right: 0.16em;
`;

// The logo's own "o" glyph (verbatim from homebase-logo.svg), used as the "o" in home.
const OGlyph = styled.svg`
  height: 0.58em;
  width: auto;
  display: block;
  margin: 0 0.04em;
  position: relative;
  top: 0.06em;
`;

const Divider = styled.span`
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.28);
  display: none;

  @media ${MIN_WIDTH.SM} {
    display: block;
  }
`;

const Title = styled.h1`
  color: ${NAMED_COLOR.WHITE};
  font-size: 17px;
  font-weight: 700;
`;

export function Header() {
  return (
    <Bar>
      <Inner>
        <Brand aria-label="homerace">
          <HouseMark viewBox="0 0 46 43" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M13.6201 1.64967C16.6336 -0.549887 20.7229 -0.549894 23.7363 1.64967L24.6396 2.30885C22.3392 1.8526 19.892 2.34776 17.9102 3.7942L7.81055 11.1653C5.59788 12.7804 4.29018 15.3555 4.29004 18.095V32.2757C4.29016 34.7627 5.34912 37.0017 7.04004 38.5686C3.03668 37.843 0 34.3427 0 30.1301V15.9505C3.38328e-05 13.2108 1.30865 10.636 3.52148 9.02077L13.6201 1.64967Z"
              fill="white"
            />
            <path
              d="M8.57959 20.2402C8.57959 17.5005 9.88799 14.9256 12.1009 13.3104L22.1996 5.93914C25.213 3.73957 29.3025 3.73957 32.3159 5.93914L42.4147 13.3104C44.6275 14.9256 45.9359 17.5005 45.9359 20.2402V34.42C45.9359 39.1583 42.0948 42.9994 37.3565 42.9994H17.159C12.4207 42.9994 8.57959 39.1583 8.57959 34.42V20.2402Z"
              fill="white"
            />
          </HouseMark>
          <Bold>h</Bold>
          <OGlyph viewBox="81.4 14.6 26.1 28.5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M97.4576 34.725C99.4384 33.5398 100.781 31.345 100.781 28.8428C100.781 26.3407 99.4384 24.1239 97.4576 22.9606C98.426 22.39 99.5704 22.0607 100.781 22.0607C104.434 22.0607 107.406 25.1116 107.406 28.8428C107.406 32.5741 104.434 35.6249 100.781 35.6249C99.5704 35.6469 98.426 35.3177 97.4576 34.725Z"
              fill="white"
            />
            <path
              d="M98.9764 15.2348C93.1659 16.9029 88.8962 22.368 88.8962 28.8429C88.8962 35.3177 93.1659 40.7829 98.9764 42.451C97.7879 42.7802 96.5554 42.9777 95.2568 42.9777C87.6416 42.9777 81.4571 36.6566 81.4571 28.8429C81.4571 21.0292 87.6416 14.708 95.2568 14.708C96.5554 14.708 97.8099 14.9055 98.9764 15.2348Z"
              fill="white"
            />
          </OGlyph>
          <Bold>me</Bold>
          <Light>race</Light>
        </Brand>
        <Divider />
        <Title>Gauntlet Tracker</Title>
      </Inner>
    </Bar>
  );
}
