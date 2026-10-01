// AI Assistant utilities - Brand Identity
export const AI_BOT_ID = '00000000-0000-0000-0000-000000000001'
export const AI_BOT_NAME = 'Floggers Assistant'
// Premium purple brand avatar
export const AI_BOT_AVATAR = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%236b2d8a" /><stop offset="100%" style="stop-color:%231a0a1f" /></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect fill="url(%23bg)" width="100" height="100" rx="50"/><circle cx="50" cy="40" r="20" fill="%239b4dca" opacity="0.8"/><path d="M35 70 Q50 85 65 70" stroke="%23c05a9e" stroke-width="3" fill="none" stroke-linecap="round"/><text x="50" y="55" font-size="28" text-anchor="middle" fill="%23d4a5e0" font-family="Georgia, serif" font-style="italic">F</text></svg>'

export function isAIUser(userId: string): boolean {
  return userId === AI_BOT_ID
}

export async function sendMessageToAI(message: string, conversationId?: string): Promise<string> {
  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to get AI response')
  }

  const data = await response.json()
  return data.response
}
