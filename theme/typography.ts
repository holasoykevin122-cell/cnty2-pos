/**
 * Tipografía CNTY2 — "Minimal Analytics".
 * - Manrope: grotesca geométrica para TODA la interfaz y los datos
 *   (números nítidos, soporta cifras tabulares → columnas alineadas).
 * - DancingScript: único toque cursivo, reservado para el acento "jeans".
 */
export const fonts = {
  // Roles nuevos
  wordmark: 'Manrope_800ExtraBold',
  script: 'DancingScript_700Bold',
  extrabold: 'Manrope_800ExtraBold',

  // Roles base (compatibles con todas las pantallas)
  brand: 'DancingScript_700Bold',
  display: 'Manrope_800ExtraBold',
  displayMedium: 'Manrope_700Bold',
  bold: 'Manrope_700Bold',
  semibold: 'Manrope_600SemiBold',
  medium: 'Manrope_500Medium',
  regular: 'Manrope_400Regular',
} as const;

/** Cifras tabulares: úsalo en cualquier número para que las columnas alineen. */
export const tnum = { fontVariant: ['tabular-nums' as const] };

export const type = {
  wordmark: { fontFamily: fonts.wordmark, fontSize: 22, letterSpacing: 3 },
  display: { fontFamily: fonts.extrabold, fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  h1: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  title: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4 },
} as const;
