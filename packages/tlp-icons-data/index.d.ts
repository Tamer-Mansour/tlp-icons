// Types for tlp-icons-data (the full tlp-icons dataset as JSON).
// Usage: import data from 'tlp-icons-data' with { type: 'json' };   (bundlers: import data from 'tlp-icons-data')

/** [part, anim, dur (design ms), delay (design ms), origin?] */
export type MotionStep = [part: string, anim: string, dur: number, delay: number, origin?: string];

export interface IconRecord {
  category: string;
  /** 'lucide' | 'tabler' | 'tlp' */
  source: string;
  tags: string[];
  /** inner SVG markup for a 24x24 viewBox, stroke = currentColor */
  svg: string;
  m: MotionStep[];
  /** 1 = directional (mirror with flip="rtl") */
  r?: 1;
}

export interface CategoryInfo {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
}

export interface SourceInfo {
  title: string;
  license: string;
  homepage: string;
  repository: string;
  npm: string;
  version: string;
}

export interface TlpIconsData {
  name: 'tlp-icons';
  version: string;
  /** default runtime speed factor (design ms x speed = real ms) */
  speed: number;
  sources: Record<string, SourceInfo>;
  categories: CategoryInfo[];
  /** alias -> canonical icon name */
  aliases: Record<string, string>;
  icons: Record<string, IconRecord>;
}

declare const data: TlpIconsData;
export default data;
