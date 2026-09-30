// AI Assistant utilities
export const AI_BOT_ID = '00000000-0000-0000-0000-000000000001'
export const AI_BOT_NAME = 'Floggers AI Assistant'
export const AI_BOT_AVATAR = 'https://ik.imagekit.io/floggers/floggers-assistant-avatar.webp'

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
