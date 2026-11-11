/** Joins class names and skips falsy values: cn('a', cond && 'b') */
export function cn(...classes) {
  return classes.flat().filter(Boolean).join(' ');
}
