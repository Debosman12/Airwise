/**
 * Actionable recommendations helper answering:
 * "What's the air like right now, and what should I do about it?"
 */

import { AQICategory, AQIStandard } from './types';

export interface ActionGuidance {
  headline: string;
  activities: {
    canExerciseOutdoors: boolean;
    exerciseText: string;
    maskRequired: boolean;
    maskText: string;
    openWindows: boolean;
    windowsText: string;
    airPurifierNeeded: boolean;
    purifierText: string;
  };
  keyAdvice: string[];
}

export function getActionGuidance(category: AQICategory, _standard: AQIStandard): ActionGuidance {
  switch (category.level) {
    case 'good':
      return {
        headline: 'Clean air — ideal for all outdoor activities',
        activities: {
          canExerciseOutdoors: true,
          exerciseText: 'Perfect for jogging, running, and playing outside.',
          maskRequired: false,
          maskText: 'No mask required outdoors.',
          openWindows: true,
          windowsText: 'Open your windows to bring fresh air inside.',
          airPurifierNeeded: false,
          purifierText: 'Purifiers not needed today.'
        },
        keyAdvice: [
          'Enjoy your outdoor workouts and commute.',
          'Ventilate your home and workspaces thoroughly.'
        ]
      };

    case 'satisfactory':
    case 'moderate':
      return {
        headline: 'Moderate air — acceptable for most, watch if sensitive',
        activities: {
          canExerciseOutdoors: true,
          exerciseText: 'Safe for normal outdoor exercise; reduce if feeling short of breath.',
          maskRequired: false,
          maskText: 'Optional; recommended in heavy traffic.',
          openWindows: true,
          windowsText: 'Ventilate during midday or after breeze clears.',
          airPurifierNeeded: false,
          purifierText: 'Only recommended for sensitive individuals.'
        },
        keyAdvice: [
          'Most people can continue routine outdoor activities.',
          'Sensitive groups (asthma, heart condition) should keep rescue inhalers handy.'
        ]
      };

    case 'unhealthy-sensitive':
    case 'poor':
      return {
        headline: 'Poor air — reduce outdoor exertion, wear a mask',
        activities: {
          canExerciseOutdoors: false,
          exerciseText: 'Shift vigorous workouts indoors or postpone to cleaner hours.',
          maskRequired: true,
          maskText: 'Wear an N95 or well-fitting mask when commuting outdoors.',
          openWindows: false,
          windowsText: 'Keep windows and doors closed.',
          airPurifierNeeded: true,
          purifierText: 'Run HEPA air purifiers indoors on low/medium.'
        },
        keyAdvice: [
          'Limit children and elderly outdoor playtime.',
          'Wear an N95 mask if walking near busy roads.',
          'Keep living spaces closed to retain filtered air.'
        ]
      };

    case 'very-poor':
    case 'very-unhealthy':
      return {
        headline: 'Very poor air — avoid outdoor exertion, mask up',
        activities: {
          canExerciseOutdoors: false,
          exerciseText: 'Strictly avoid running or outdoor sports.',
          maskRequired: true,
          maskText: 'High filtration N95/FFP2 mask required outside.',
          openWindows: false,
          windowsText: 'Keep all windows tightly shut.',
          airPurifierNeeded: true,
          purifierText: 'Keep air purifiers running continuously.'
        },
        keyAdvice: [
          'Vulnerable persons should stay strictly indoors.',
          'Wear an N95 mask for any unavoidable commute.',
          'Seal window draughts and turn on HEPA filtration.'
        ]
      };

    case 'severe':
    case 'hazardous':
    default:
      return {
        headline: 'Hazardous air emergency — stay indoors',
        activities: {
          canExerciseOutdoors: false,
          exerciseText: 'Zero outdoor exertion. Stay completely indoors.',
          maskRequired: true,
          maskText: 'N95/FFP2 mask mandatory if you must step outside.',
          openWindows: false,
          windowsText: 'Strictly seal windows, doors, and balcony vents.',
          airPurifierNeeded: true,
          purifierText: 'Run purifiers on maximum boost mode.'
        },
        keyAdvice: [
          'Remain indoors in a clean room with continuous HEPA air filtration.',
          'Wear a tightly-sealed N95 mask during unavoidable transit.',
          'Monitor health signs; seek medical care if experiencing chest tightness or wheezing.'
        ]
      };
  }
}
