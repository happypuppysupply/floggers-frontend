// AI Assistant utilities - Brand Identity
export const AI_BOT_ID = '00000000-0000-0000-0000-000000000001'
export const AI_BOT_NAME = 'Floggers Assistant'
// YOUR LOGO - The hooded figure with flogger
// IMPORTANT: Upload your logo image to /public/logo.png
export const AI_BOT_AVATAR = '/logo.png'

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
