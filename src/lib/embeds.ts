export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/
  );
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  return null;
}

export function getSpotifyEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/
  );
  if (match && match[1] && match[2]) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  }
  return null;
}

export function getMapEmbedUrl(address: string): string {
  if (!address) return "";
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    address
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
}
