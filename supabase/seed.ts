import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const NC150_URL =
  'https://github.com/krmanik/Anki-NeetCode/raw/refs/heads/main/neetcode-150-list.json';

const TOPIC_ORDER: Record<string, number> = {
  'Arrays & Hashing': 1,
  'Two Pointers': 2,
  'Sliding Window': 3,
  Stack: 4,
  'Binary Search': 5,
  'Linked List': 6,
  Trees: 7,
  'Heap / Priority Queue': 8,
  Backtracking: 9,
  Tries: 10,
  Graphs: 11,
  'Advanced Graphs': 12,
  '1-D DP': 13,
  '2-D DP': 14,
  Greedy: 15,
  Intervals: 16,
  'Math & Geometry': 17,
  'Bit Manipulation': 18,
};

function slugFromUrl(url: string): string | null {
  const match = url.match(/\/problems\/([a-z0-9-]+)\/?/i);
  return match ? match[1].toLowerCase() : null;
}

async function main() {
  console.log('Fetching NeetCode 150 list...');
  const res = await fetch(NC150_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const data = (await res.json()) as Record<
    string,
    Record<string, { nurl?: string; url: string; difficulty: string }>
  >;

  const rows: {
    slug: string;
    title: string;
    leetcode_url: string;
    neetcode_url: string | null;
    topic: string;
    topic_order: number;
    difficulty: string;
    source: string;
  }[] = [];

  for (const [topic, problems] of Object.entries(data)) {
    const order = TOPIC_ORDER[topic];
    if (!order) {
      console.warn(`Unknown topic: ${topic}`);
      continue;
    }
    for (const [title, info] of Object.entries(problems)) {
      const slug = slugFromUrl(info.url);
      if (!slug) {
        console.warn(`Could not parse slug from: ${info.url}`);
        continue;
      }
      rows.push({
        slug,
        title,
        leetcode_url: info.url,
        neetcode_url: info.nurl ?? null,
        topic,
        topic_order: order,
        difficulty: info.difficulty,
        source: 'neetcode150',
      });
    }
  }

  console.log(`Upserting ${rows.length} problems...`);
  const { error } = await supabase
    .from('problems')
    .upsert(rows, { onConflict: 'slug' });

  if (error) {
    console.error('Upsert error:', error);
    process.exit(1);
  }

  console.log(`Done. ${rows.length} problems seeded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
