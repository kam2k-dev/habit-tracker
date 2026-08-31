import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

/**
 * Membuat Firebase Custom Token murni menggunakan crypto Node.js & Google OAuth REST API
 * (Bebas dari masalah konflik modul CommonJS/ESM jose/jwks-rsa di Vercel Serverless)
 */
function createCustomTokenDirect(uid: string, serviceAccount: any, claims: Record<string, any> = {}): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600, // berlaku 1 jam
    uid: uid,
    claims: claims,
  };

  const base64UrlEncode = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;

  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  sign.end();

  const signature = sign
    .sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signature}`;
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

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Firebase credentials missing' });
  }

  let serviceAccount: any;
  try {
    let cleaned = typeof serviceAccountKey === 'string' ? serviceAccountKey.trim() : serviceAccountKey;
    if (typeof cleaned === 'string' && cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.slice(1, -1);
    }
    serviceAccount = typeof cleaned === 'string' ? JSON.parse(cleaned) : cleaned;
  } catch (parseErr) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseErr);
    return res.status(500).json({ error: 'Invalid Firebase credentials format' });
  }

  const { isValid, user } = verifyTelegramInitData(initData, botToken);
  if (!isValid || !user || !user.id) {
    return res.status(401).json({ error: 'Invalid or expired Telegram initData' });
  }

  const telegramUid = `telegram:${user.id}`;
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Telegram User';

  try {
    // Generate Custom Token murni dengan RSA-SHA256 bawaan Node.js
    const customToken = createCustomTokenDirect(telegramUid, serviceAccount, {
      telegram: true,
      telegramId: String(user.id),
      username: user.username || null,
      displayName,
      photoURL: user.photo_url || null,
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
