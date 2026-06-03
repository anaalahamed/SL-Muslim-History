// Single source of truth for reaction emojis.
// Ordered: condolence/prayer reactions first, then social reactions.
// Import from here in: API route, ReactionBar, admin reactions page.

export const REACTIONS = [
  '🙏', // Folded Hands — prayer / condolence
  '🤲', // Open Hands / Dua Hands
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

export type ReactionEmoji = typeof REACTIONS[number]

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
