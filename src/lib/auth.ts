import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dainik_manyavar_super_secret_jwt_key_2026';

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 10);
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;

    // Simple session validation (token format: userId:timestamp)
    const [userId] = token.split(':');
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, active: true },
    });

    if (!user || !user.active) return null;
    return user;
  } catch (err) {
    return null;
  }
}

export async function getPortalUserSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portal_token')?.value;
    if (!token) return null;

    const [userId] = token.split(':');
    if (!userId) return null;

    const user = await db.portalUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        mobileNumber: true,
        email: true,
        city: true,
        state: true,
        profileImage: true,
        status: true,
        newsletterSubscribed: true,
        whatsappPermission: true,
        registrationDate: true,
      },
    });

    if (!user || user.status === 'BLOCKED') return null;
    return user;
  } catch (err) {
    return null;
  }
}
