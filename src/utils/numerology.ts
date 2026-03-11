import type { FormData, NumerologyResult } from '../types';

function reduceToSingleDigit(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((sum, d) => sum + parseInt(d), 0);
  }
  return num;
}

function calculateDestinyNumber(birthdate: string): number {
  const digits = birthdate.replace(/\D/g, '');
  const sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
  return reduceToSingleDigit(sum);
}

const VOWELS: Record<string, number> = {
  a: 1, e: 5, i: 9, o: 6, u: 3,
};

function calculateSoulNumber(name: string): number {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const sum = normalized
    .split('')
    .filter((c) => VOWELS[c] !== undefined)
    .reduce((acc, c) => acc + VOWELS[c], 0);
  return reduceToSingleDigit(sum);
}

function letterValue(char: string): number {
  const code = char.charCodeAt(0) - 96; // a=1, b=2, ... z=26
  return code > 0 && code <= 26 ? code : 0;
}

function calculatePersonalityNumber(name: string): number {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const sum = normalized
    .split('')
    .filter((c) => c >= 'a' && c <= 'z' && VOWELS[c] === undefined)
    .reduce((acc, c) => acc + letterValue(c), 0);
  return reduceToSingleDigit(sum);
}

function calculateCompatibility(destiny1: number, destiny2: number): number {
  const d1 = destiny1 > 9 ? reduceToSingleDigit(destiny1) : destiny1;
  const d2 = destiny2 > 9 ? reduceToSingleDigit(destiny2) : destiny2;
  const diff = Math.abs(d1 - d2);

  if (diff <= 2) return 32 + Math.random() * 16;
  if (diff <= 5) return 22 + Math.random() * 14;
  return 12 + Math.random() * 14;
}

function calculatePersonalCycle(birthdate: string): number {
  const date = new Date(birthdate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const sum = day + month + currentYear;
  return reduceToSingleDigit(sum);
}

function durationToYears(duration: string): number {
  switch (duration) {
    case 'less-than-1': return 0.5;
    case '1-to-3': return 2;
    case '3-to-5': return 4;
    case '5-to-10': return 7;
    case 'more-than-10': return 12;
    default: return 2;
  }
}

export function calculateNumerology(data: FormData): NumerologyResult {
  const yourDestinyNumber = calculateDestinyNumber(data.yourBirthdate);
  const partnerDestinyNumber = calculateDestinyNumber(data.partnerBirthdate);
  const yourSoulNumber = calculateSoulNumber(data.yourName);
  const partnerSoulNumber = calculateSoulNumber(data.partnerName);
  const yourPersonalityNumber = calculatePersonalityNumber(data.yourName);
  const partnerPersonalityNumber = calculatePersonalityNumber(data.partnerName);
  const compatibilityPercentage = calculateCompatibility(yourDestinyNumber, partnerDestinyNumber);
  const personalCycle = calculatePersonalCycle(data.partnerBirthdate);

  const fidelityNumber = reduceToSingleDigit(partnerDestinyNumber + partnerSoulNumber);

  let probability = 82;

  if (compatibilityPercentage < 40) probability += 6;
  else if (compatibilityPercentage < 60) probability += 3;

  if ([2, 5, 7].includes(fidelityNumber)) probability += 4;
  if ([5, 8].includes(personalCycle)) probability += 3;

  const years = durationToYears(data.relationshipDuration);
  if (years > 10) probability += 2;
  if (years < 1) probability += 3;

  const variation = (Math.random() - 0.5) * 6;
  probability = Math.round(Math.max(78, Math.min(96, probability + variation)));

  return {
    yourDestinyNumber,
    partnerDestinyNumber,
    yourSoulNumber,
    partnerSoulNumber,
    yourPersonalityNumber,
    partnerPersonalityNumber,
    compatibilityPercentage: Math.round(compatibilityPercentage),
    personalCycle,
    infidelityProbability: probability,
    fidelityNumber,
  };
}
