export type MotionStep = [part: string, anim: string, dur: number, delay: number, origin?: string];
export interface IconData { svg: string; m: MotionStep[]; r?: 1 }
export interface Category { id: string; title: string; icon: string; color: string; count: number }
export declare const icons: Record<string, IconData>;
export declare const categories: Category[];
export declare const aliases: Record<string, string>;
export declare function getIcon(name: string): IconData | null;
export declare function getSvg(name: string, opts?: { size?: number; stroke?: number; duotone?: boolean; animated?: boolean }): string | null;
export declare function toSvgString(icon: IconData, opts?: { size?: number; stroke?: number; duotone?: boolean; animated?: boolean }): string;
export declare function timings(icon: IconData, speed?: number): { steps: { part: string; anim: string; t: number; dl: number; origin?: string }[]; total: number };
