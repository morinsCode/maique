export function isSoundCloudUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?soundcloud\.com\/.+/.test(url);
}
