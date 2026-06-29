'use server';

import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function getNotifications(limit = 20) {
  try {
    const session = await getSession();
    if (!session) return [];
    return prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, title: true, message: true, type: true, isRead: true, createdAt: true },
    });
  } catch { return []; }
}

export async function getUnreadCount() {
  try {
    const session = await getSession();
    if (!session) return 0;
    return prisma.notification.count({ where: { userId: session.id, isRead: false } });
  } catch { return 0; }
}

export async function markAsRead(notificationId: string) {
  try {
    const session = await getSession();
    if (!session) return;
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: session.id },
      data: { isRead: true },
    });
  } catch { /* ignore */ }
}

export async function markAllAsRead() {
  try {
    const session = await getSession();
    if (!session) return;
    await prisma.notification.updateMany({
      where: { userId: session.id, isRead: false },
      data: { isRead: true },
    });
  } catch { /* ignore */ }
}
