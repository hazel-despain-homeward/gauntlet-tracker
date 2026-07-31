import { createGlobalStyle } from 'styled-components';
import { FONT, NAMED_COLOR, TEXT_COLOR, CTA_COLOR } from './tokens';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html, body, #root { height: 100%; }

  body {
    margin: 0;
    background: ${NAMED_COLOR.TAN};
    color: ${TEXT_COLOR.PRIMARY};
    font-family: ${FONT.BODY};
    font-size: 14px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${FONT.HEADING};
    font-weight: 700;
    margin: 0;
    color: ${TEXT_COLOR.PRIMARY};
  }

  button { font-family: inherit; }

  a { color: ${CTA_COLOR.PRIMARY}; }

  :focus-visible {
    outline: 2px solid ${CTA_COLOR.PRIMARY};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
  }
`;
