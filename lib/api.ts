import mockWeather from '@/data/mockWeather.json';
import mockEvents from '@/data/mockEvents.json';
import mockCrops from '@/data/mockCrops.json';

export interface WeatherData {
  id: number;
  city: string;
  country: string;
  coordinates: { lat: number; lon: number };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    precipitation: number;
    condition: string;
    icon: string;
    uvIndex: number;
  };
  forecast: Array<{
    date: string;
    day: string;
    tempMin: number;
    tempMax: number;
    condition: string;
    icon: string;
    precipitation: number;
    humidity: number;
    windSpeed: number;
  }>;
}

export interface EventType {
  id: number;
  type: string;
  duration: number;
  idealConditions: {
    tempMin: number;
    tempMax: number;
    precipitationMax: number;
    windSpeedMax: number;
    description: string;
  };
}

export interface CropData {
  id: number;
  name: string;
  plantingPeriod: string;
  harvestPeriod: string;
  waterRequirements: string;
  idealConditions: {
    tempMin: number;
    tempMax: number;
    rainfallMin: number;
    rainfallMax: number;
    soilMoisture: string;
  };
  growthStages: Array<{
    stage: string;
    duration: string;
    irrigation: string;
    vulnerabilities: string[];
  }>;
}

export async function getWeather(location: string): Promise<WeatherData | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockWeather.find(item => item.city.toLowerCase() === location.toLowerCase());
}

export async function getAllLocations(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockWeather.map(item => item.city);
}

export async function getEventTypes(): Promise<EventType[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockEvents;
}

export async function getCrops(): Promise<CropData[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockCrops;
}

export async function getCropById(id: number): Promise<CropData | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockCrops.find(crop => crop.id === id);
}

export function analyzeEventSchedule(
  weather: WeatherData,
  eventType: EventType
): Array<{ date: string; score: number; reasons: string[] }> {
  return weather.forecast.map(day => {
    let score = 100;
    const reasons: string[] = [];

    if (day.tempMin < eventType.idealConditions.tempMin || day.tempMax > eventType.idealConditions.tempMax) {
      score -= 20;
      reasons.push('Température non optimale');
    }

    if (day.precipitation > eventType.idealConditions.precipitationMax) {
      score -= 30;
      reasons.push('Risque de pluie élevé');
    }

    if (day.windSpeed > eventType.idealConditions.windSpeedMax) {
      score -= 15;
      reasons.push('Vent trop fort');
    }

    if (score >= 80) {
      reasons.push('Conditions excellentes');
    } else if (score >= 60) {
      reasons.push('Conditions acceptables');
    }

    return {
      date: day.date,
      score: Math.max(0, score),
      reasons
    };
  });
}
