export function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const totalHundredths = Math.round(ms / 10);
  const hundredths = totalHundredths % 100;
  const totalSeconds = Math.floor(totalHundredths / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  const hh = hundredths.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  if (minutes > 0) {
    return `${minutes}:${ss}.${hh}`;
  }
  return `${seconds}.${hh}`;
}
