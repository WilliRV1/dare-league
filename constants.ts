import { PricingStage, PricingTier } from './types';

// Event Date: July 18-20, 2026
export const EVENT_START_DATE = new Date(2026, 6, 18, 8, 0, 0);
export const REGISTRATION_OPEN_DATE = new Date(2026, 1, 15); // Feb 15

export const MAX_SLOTS_PER_CATEGORY = 32;

export const PRICING_TIERS: PricingTier[] = [
  {
    id: PricingStage.EARLY,
    name: "ETAPA 1",
    price: 170000,
    formattedPrice: "$170.000",
    startDate: new Date(2026, 1, 15), // Feb 15
    endDate: new Date(2026, 3, 15, 23, 59, 59), // Apr 15
    features: ["KIT OFICIAL COMPLETO", "ACCESO BRACKET 1V1", "SEGURO DE ATLETA"]
  },
  {
    id: PricingStage.REGULAR,
    name: "ETAPA 2",
    price: 195000,
    formattedPrice: "$195.000",
    startDate: new Date(2026, 3, 16), // Apr 16
    endDate: new Date(2026, 5, 30, 23, 59, 59), // June 30
    features: ["KIT OFICIAL COMPLETO", "ACCESO BRACKET 1V1", "SEGURO DE ATLETA"]
  },
  {
    id: PricingStage.LATE,
    name: "ETAPA 3",
    price: 210000,
    formattedPrice: "$210.000",
    startDate: new Date(2026, 6, 1), // July 1
    endDate: new Date(2026, 7, 10, 23, 59, 59), // Aug 10
    features: ["KIT OFICIAL COMPLETO", "ACCESO BRACKET 1V1", "SEGURO DE ATLETA"]
  }
];

export const CATEGORIES = [
  {
    id: 'PRINCIPIANTE',
    title: 'PRINCIPIANTE',
    description: 'Entrenas hace menos de 2 años o usas banda en Pull-ups. Deja de solo "ir a clase" y empieza a competir de verdad. Tu puerta de entrada al mundo competitivo.',
    standards: [
      { exercise: 'Pull Ups', male: 'Banda', female: 'Banda' },
      { exercise: 'Snatch', male: '75 lb', female: '45 lb' },
      { exercise: 'Clean & Jerk', male: '95 lb', female: '55 lb' },
      { exercise: 'Deadlift', male: '115 lb', female: '85 lb' },
      { exercise: 'Thrusters', male: '75 lb', female: '45 lb' },
      { exercise: 'T2B', male: 'K2E', female: 'K2E' },
      { exercise: 'Dumbbells', male: '12.5 kg', female: '7.5 kg' }
    ]
  },
  {
    id: 'INTERMEDIO',
    title: 'INTERMEDIO',
    description: 'Dominas Snatch y Clean & Jerk sin asistencia. Pull-ups estrictos y T2B fluidos. El punto exacto donde la técnica separa al aficionado del atleta.',
    standards: [
      { exercise: 'Pull Ups', male: 'Si', female: 'Banda' },
      { exercise: 'Snatch', male: '95 lb', female: '55 lb' },
      { exercise: 'Clean & Jerk', male: '115 lb', female: '65 lb' },
      { exercise: 'Deadlift', male: '135 lb', female: '105 lb' },
      { exercise: 'Thrusters', male: '95 lb', female: '55 lb' },
      { exercise: 'T2B', male: 'Si', female: 'Si' },
      { exercise: 'Dumbbells', male: '15 kg', female: '10 kg' }
    ]
  }
];