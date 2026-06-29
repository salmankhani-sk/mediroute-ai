'use server';

import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function saveChatMessage(role: string, content: string) {
  try {
    const session = await getSession();
    if (!session) return;
    await prisma.chatMessage.create({
      data: { userId: session.id, role, content },
    });
  } catch { /* silent */ }
}

export async function getChatHistory() {
  try {
    const session = await getSession();
    if (!session) return [];
    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: { role: true, content: true },
    });
    return messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  } catch { return []; }
}
