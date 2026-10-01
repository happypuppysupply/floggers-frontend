// AI Assistant utilities
export const AI_BOT_ID = '00000000-0000-0000-0000-000000000001'
export const AI_BOT_NAME = 'Floggers AI Assistant'
// Using a reliable fallback avatar - a simple emoji-based SVG
export const AI_BOT_AVATAR = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%232d1f2f" width="100" height="100"/><text x="50" y="60" font-size="50" text-anchor="middle" fill="%23e05a8a">🤖</text></svg>'

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
