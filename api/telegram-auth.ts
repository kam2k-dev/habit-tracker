import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as crypto from 'crypto';

// Inisialisasi Firebase Admin App secara modular & aman untuk ESM / Node runtime
function getAdminAuth() {
  if (!getApps().length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

    if (serviceAccountKey) {
      try {
        const parsedKey = typeof serviceAccountKey === 'string'
          ? JSON.parse(serviceAccountKey)
          : serviceAccountKey;
        initializeApp({
          credential: cert(parsedKey),
        });
      } catch (err) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err);
        initializeApp({ projectId });
      }
    } else {
      initializeApp({ projectId });
    }
  }

  return getAuth();
}

/**
 * Validasi cryptographic Telegram initData
 */
function verifyTelegramInitData(initDataStr: string, botToken: string): { isValid: boolean; user?: any } {
  try {
    const urlParams = new URLSearchParams(initDataStr);
    const hash = urlParams.get('hash');
    if (!hash) return { isValid: false };

    urlParams.delete('hash');

    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys
      .map((k) => `${k}=${urlParams.get(k)}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );

    if (!isMatch) return { isValid: false };

    const authDateStr = urlParams.get('auth_date');
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10);
      const now = Math.floor(Date.now() / 1000);
      if (now - authDate > 86400) {
        return { isValid: false };
      }
    }

    const userRaw = urlParams.get('user');
    const user = userRaw ? JSON.parse(userRaw) : undefined;

    return { isValid: true, user };
  } catch (err) {
    console.error('Error verifying initData:', err);
    return { isValid: false };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { initData } = req.body || {};
  if (!initData || typeof initData !== 'string') {
    return res.status(400).json({ error: 'Missing initData parameter' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { isValid, user } = verifyTelegramInitData(initData, botToken);
  if (!isValid || !user || !user.id) {
    return res.status(401).json({ error: 'Invalid or expired Telegram initData' });
  }

  const telegramUid = `telegram:${user.id}`;
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Telegram User';

  try {
    const adminAuth = getAdminAuth();

    try {
      await adminAuth.getUser(telegramUid);
      await adminAuth.updateUser(telegramUid, {
        displayName,
        photoURL: user.photo_url || undefined,
      });
    } catch (authErr: any) {
      if (authErr.code === 'auth/user-not-found') {
        await adminAuth.createUser({
          uid: telegramUid,
          displayName,
          photoURL: user.photo_url || undefined,
        });
      } else {
        throw authErr;
      }
    }

    const customToken = await adminAuth.createCustomToken(telegramUid, {
      telegram: true,
      telegramId: String(user.id),
      username: user.username || null,
    });

    return res.status(200).json({
      customToken,
      user: {
        id: user.id,
        username: user.username,
        displayName,
        photoURL: user.photo_url || null,
      },
    });
  } catch (err: any) {
    console.error('Failed to create Firebase custom token in Vercel:', err);
    return res.status(500).json({ error: 'Failed to generate authentication token' });
  }
}
