// Reaction emoji orders.
// JANAZA_REACTIONS — condolence/prayer first, for Janaza News content.
// DEFAULT_REACTIONS — social-media order, for articles, special news, and everything else.
// Same 11 emojis in both arrays; only the display order differs.
// The database, API, and counts are shared — nothing else changes.

export const JANAZA_REACTIONS = [
  '🙏', // Folded Hands — prayer / condolence
  '🤲', // Open Hands / Dua
  '🙌', // Raising Hands
  '🕯', // Candle — remembrance
  '❤️', // Heart
  '👍', // Thumbs Up
  '🥰', // Smiling with Hearts
  '😍', // Heart Eyes
  '💯', // Hundred Points
  '👏', // Clapping Hands
  '😡', // Angry Face
] as const

export const DEFAULT_REACTIONS = [
  '👍', // Thumbs Up
  '❤️', // Heart
  '🥰', // Smiling with Hearts
  '😍', // Heart Eyes
  '💯', // Hundred Points
  '👏', // Clapping Hands
  '🙏', // Folded Hands
  '🤲', // Open Hands / Dua
  '🙌', // Raising Hands
  '🕯', // Candle
  '😡', // Angry Face
] as const

// REACTIONS is the full set used by the API allowlist and admin page.
// It does not imply any display order — use JANAZA_REACTIONS or DEFAULT_REACTIONS for that.
export const REACTIONS = DEFAULT_REACTIONS

export type ReactionEmoji = typeof DEFAULT_REACTIONS[number]

export const REACTION_LABELS: Record<string, string> = {
  '🙏': 'Folded Hands',
  '🤲': 'Dua Hands',
  '🙌': 'Raising Hands',
  '🕯': 'Candle',
  '❤️': 'Heart',
  '👍': 'Thumbs Up',
  '🥰': 'Smiling with Hearts',
  '😍': 'Heart Eyes',
  '💯': 'Hundred Points',
  '👏': 'Clapping Hands',
  '😡': 'Angry Face',
}
