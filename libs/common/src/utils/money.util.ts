import { CURRENCY_SUBUNIT_MULTIPLIER, CURRENCY_SYMBOL } from '../constants/currency.constants';

/** Converts rupees to paise (stored as integers in DB) */
export function toPaise(rupees: number): number {
  return Math.round(rupees * CURRENCY_SUBUNIT_MULTIPLIER);
}

/** Converts paise to rupees for display */
export function toRupees(paise: number): number {
  return paise / CURRENCY_SUBUNIT_MULTIPLIER;
}

/** Formats paise as human-readable INR string */
export function formatINR(paise: number): string {
  const rupees = toRupees(paise);
  return `${CURRENCY_SYMBOL}${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Validates that an amount in paise is positive and within bounds */
export function isValidAmount(paise: number): boolean {
  return Number.isInteger(paise) && paise > 0;
}
