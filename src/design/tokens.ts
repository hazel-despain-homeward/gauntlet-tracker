/**
 * Design tokens mirrored from the Homeward HEIDI design system
 * (github.com/home-ward/temp-ai-prototyping →
 *  src/HEIDI/foundations/{Colors,Typography,MediaQueries}).
 *
 * Naming intentionally matches HEIDI so swapping to the real package later
 * is a single import change. Do not rename to a local scheme.
 */

export const BRAND_COLOR = {
  PRIMARY: '#374759',
  SECONDARY: '#207C84',
  TERTIARY: '#BB724E',
} as const;

export const TEXT_COLOR = {
  PRIMARY: '#1E1E1E',
  SECONDARY: '#5F5F5F',
  TERTIARY: '#DBDCDB',
} as const;

export const CTA_COLOR = {
  PRIMARY: '#207C84',
  DARK: '#065A62',
  LIGHT: '#B0D6D7',
} as const;

export const MESSAGING_COLOR = {
  ACCENT: {
    INFO: '#006ADA',
    DEBUG: '#1E1E1E',
    SUCCESS: '#45743D',
    WARNING: '#D09703',
    FAILURE: '#CE2B2B',
    DECORATIVE: '#B0D6D7',
  },
  BACKGROUND: {
    INFO: '#F2F8FF',
    DEBUG: '#F8F8F8',
    SUCCESS: '#EFF8ED',
    WARNING: '#FEF7E6',
    FAILURE: '#FFF5F5',
    DECORATIVE: '#EEF8F8',
  },
} as const;

export const BORDER_COLOR = {
  PRIMARY: '#DBDCDB',
  SECONDARY: '#ADADAD',
} as const;

export const FORM_FIELDS = {
  BORDER_DEFAULT: '#C5C6C5',
  BORDER_FOCUSED: '#207C84',
  BORDER_DISABLED: '#DBDCDB',
} as const;

export const NAMED_COLOR = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TAN: '#F8F7F5',
  LIGHTBLUE: '#EFF9FC',
  LIGHTGREEN: '#EEF8F8',
  LIGHTGREY: '#F8F8F8',
  BLUE: '#52616F',
  YELLOW: '#F8E192',
} as const;

export const BREAKPOINT_IN_PX = {
  XS: 0,
  SM: 600,
  MD: 905,
  LG: 1240,
  XL: 1322,
} as const;

export const MIN_WIDTH = {
  XS: `(min-width: ${BREAKPOINT_IN_PX.XS}px)`,
  SM: `(min-width: ${BREAKPOINT_IN_PX.SM}px)`,
  MD: `(min-width: ${BREAKPOINT_IN_PX.MD}px)`,
  LG: `(min-width: ${BREAKPOINT_IN_PX.LG}px)`,
  XL: `(min-width: ${BREAKPOINT_IN_PX.XL}px)`,
} as const;

export const FONT = {
  BODY: 'Montserrat, sans-serif',
  HEADING: "'Playfair Display', serif",
} as const;
