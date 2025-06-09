export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter((cls): cls is string => Boolean(cls) && typeof cls === 'string')
    .join(' ');
} 