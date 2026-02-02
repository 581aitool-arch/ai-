
export enum FoodStyle {
  ELEGANT_DARK = 'ELEGANT_DARK',
  FRESH_BRIGHT = 'FRESH_BRIGHT',
  JAPANESE_ZEN = 'JAPANESE_ZEN',
  RUSTIC_VINTAGE = 'RUSTIC_VINTAGE',
  MINIMALIST_MODERN = 'MINIMALIST_MODERN',
}

export interface StyleOption {
  id: FoodStyle;
  name: string;
  description: string;
  preview: string;
  prompt: string;
}

export interface ProcessingImage {
  id: string;
  originalUrl: string;
  base64: string;
  optimizedUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}
