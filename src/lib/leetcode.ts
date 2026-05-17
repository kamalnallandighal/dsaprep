export function parseLeetCodeUrl(
  url: string
): { slug: string; titleGuess: string } | null {
  const match = url.match(
    /^https?:\/\/(?:www\.)?leetcode\.com\/problems\/([a-z0-9-]+)\/?/i
  );
  if (!match) return null;
  const slug = match[1].toLowerCase();
  const titleGuess = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { slug, titleGuess };
}
