
export interface SensorData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface GeoLocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
}

export enum SensorType {
  MOTION = 'MOTION',
  VISION = 'VISION',
  AUDIO = 'AUDIO',
  LOCATION = 'LOCATION',
  GAME = 'GAME'
}

export interface AnalysisResult {
  isLoading: boolean;
  text: string;
  timestamp?: number;
}
