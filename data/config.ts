/** Configuración general fácil de ajustar. */
export const config = {
  currencySymbol: '$', // peso colombiano (COP)
  currencyLocale: 'es-CO', // separador de miles con puntos: $89.000
  storeName: 'CNTY2',
  storeTagline: 'jeans',
};

export function formatMoney(n: number): string {
  const rounded = Math.round(n);
  return config.currencySymbol + rounded.toLocaleString(config.currencyLocale);
}

export function formatMoneyShort(n: number): string {
  if (n >= 1_000_000) return config.currencySymbol + (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return config.currencySymbol + Math.round(n / 1000) + 'k';
  return config.currencySymbol + Math.round(n);
}
