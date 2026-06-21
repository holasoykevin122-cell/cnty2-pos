/**
 * Paleta CNTY2 — dirección "Minimal Analytics" (estilo Stripe / Linear).
 * Neutros fríos disciplinados + UN acento denim usado con precisión.
 * Sin pasteles repartidos: el color comunica jerarquía, no decoración.
 */
export const colors = {
  // Fondos
  bg: '#F5F6F8', // gris claro frío
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F3',
  surfaceSunken: '#ECEEF1',

  // Acento de marca (denim) — único color "vivo"
  primary: '#2E4A7A',
  primaryDark: '#21385F',
  primarySoft: '#E9EEF6',
  primaryTint: '#4A6CA6',

  // Neutros cálidos para detalles puntuales (stock bajo)
  clay: '#9A7B4F',
  claySoft: '#F2ECDF',
  sage: '#3E7C5A',
  sageSoft: '#E6F1EA',

  // Texto (alto contraste tipográfico)
  text: '#14161A',
  textMuted: '#5C626B',
  textSubtle: '#9AA0A8',
  onPrimary: '#FFFFFF',

  // Estados (sobrios, usados solo en indicadores)
  success: '#1F8A5B',
  successSoft: '#E5F3EC',
  warning: '#9A7B4F',
  danger: '#C0492E',
  dangerSoft: '#FBE9E4',

  // Líneas finas (hairline) — el recurso principal de profundidad
  border: '#E7E9ED',
  borderStrong: '#D7DAE0',

  // Sombra (muy sutil)
  shadow: '#0B1B3A',
} as const;

export type ColorKey = keyof typeof colors;
