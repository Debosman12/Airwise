/**
 * Unified AQI Calculator Module
 */

import { AQICalculationResult, AQIStandard, PollutantValues } from './types';
import { calculateCPCBAQI } from './cpcb';
import { calculateUSEPAAQI } from './usepa';

export * from './types';
export * from './cpcb';
export * from './usepa';
export * from './recommendations';

/**
 * Calculates AQI using the specified standard (defaults to CPCB).
 */
export function calculateAQI(
  values: PollutantValues,
  standard: AQIStandard = 'cpcb'
): AQICalculationResult {
  if (standard === 'usepa') {
    return calculateUSEPAAQI(values);
  }
  return calculateCPCBAQI(values);
}
