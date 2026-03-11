export interface FormData {
  yourName: string;
  yourBirthdate: string;
  partnerName: string;
  partnerBirthdate: string;
  relationshipDuration: RelationshipDuration;
  email: string;
}

export type RelationshipDuration =
  | 'less-than-1'
  | '1-to-3'
  | '3-to-5'
  | '5-to-10'
  | 'more-than-10';

export interface NumerologyResult {
  yourDestinyNumber: number;
  partnerDestinyNumber: number;
  yourSoulNumber: number;
  partnerSoulNumber: number;
  yourPersonalityNumber: number;
  partnerPersonalityNumber: number;
  compatibilityPercentage: number;
  personalCycle: number;
  infidelityProbability: number;
  fidelityNumber: number;
}

export interface Testimonial {
  name: string;
  age: number;
  rating: number;
  text: string;
  avatar: string;
}

export interface ProcessingStep {
  label: string;
  completed: boolean;
  value?: number;
}
