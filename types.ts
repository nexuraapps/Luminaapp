
export enum Language {
  EN = 'en',
  PT = 'pt',
  ES = 'es'
}

export type FitMode = 'cover' | 'contain' | 'fill';

export interface Wallpaper {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  tags: string[];
  isLocal?: boolean;
}

export interface Settings {
  language: Language;
  muted: boolean;
  fitMode: FitMode;
  activeWallpaperId: string | null;
}
