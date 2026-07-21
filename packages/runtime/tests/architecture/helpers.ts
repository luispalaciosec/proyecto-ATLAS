export function createDeterministicClock(
  start = '2026-07-20T00:00:00.000Z',
): () => string {
  let tick = 0;

  return () => {
    const date = new Date(start);
    date.setMilliseconds(date.getMilliseconds() + tick);
    tick += 1;
    return date.toISOString();
  };
}
