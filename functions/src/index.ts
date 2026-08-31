import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Validates Telegram initData according to Telegram Mini Apps specifications.
 * Uses HMAC-SHA-256 with the secret key derived from bot token and "WebAppData".
 */
function verifyTelegramInitData(initDataStr: string, botToken: string): { isValid: boolean; user?: any } {
  try {
    const urlParams = new URLSearchParams(initDataStr);
    const hash = urlParams.get("hash");
    if (!hash) return { isValid: false };

    urlParams.delete("hash");

    // Sort parameters alphabetically in format key=<value> with newline delimiter
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys
      .map((k) => `${k}=${urlParams.get(k)}`)
      .join("\n");

    // Secret key = HMAC-SHA-256(botToken, "WebAppData")
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Calculated hash = hex(HMAC-SHA-256(dataCheckString, secretKey))
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(calculatedHash, "hex"),
      Buffer.from(hash, "hex")
    );

    if (!isMatch) return { isValid: false };

    // Check expiration: auth_date should not be older than 24 hours (86400s)
    const authDateStr = urlParams.get("auth_date");
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10);
      const now = Math.floor(Date.now() / 1000);
      if (now - authDate > 86400) {
        return { isValid: false };
      }
    }

    const userRaw = urlParams.get("user");
    const user = userRaw ? JSON.parse(userRaw) : undefined;

    return { isValid: true, user };
  } catch (err) {
    console.error("Error verifying initData:", err);
    return { isValid: false };
  }
}

export const telegramAuth = onRequest(
  {
    cors: true,
    secrets: ["TELEGRAM_BOT_TOKEN"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { initData } = req.body || {};
    if (!initData || typeof initData !== "string") {
      res.status(400).json({ error: "Missing initData parameter" });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN secret is not set in environment");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    const { isValid, user } = verifyTelegramInitData(initData, botToken);
    if (!isValid || !user || !user.id) {
      res.status(401).json({ error: "Invalid or expired Telegram initData" });
      return;
    }

    const telegramUid = `telegram:${user.id}`;
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Telegram User";

    try {
      // Upsert Firebase User
      try {
        await admin.auth().getUser(telegramUid);
        await admin.auth().updateUser(telegramUid, {
          displayName,
          photoURL: user.photo_url || undefined,
        });
      } catch (authErr: any) {
        if (authErr.code === "auth/user-not-found") {
          await admin.auth().createUser({
            uid: telegramUid,
            displayName,
            photoURL: user.photo_url || undefined,
          });
        } else {
          throw authErr;
        }
      }

      // Generate Custom Token with custom claims
      const customToken = await admin.auth().createCustomToken(telegramUid, {
        telegram: true,
        telegramId: String(user.id),
        username: user.username || null,
      });

      res.status(200).json({
        customToken,
        user: {
          id: user.id,
          username: user.username,
          displayName,
          photoURL: user.photo_url || null,
        },
      });
    } catch (err: any) {
      console.error("Failed to create Firebase custom token:", err);
      res.status(500).json({ error: "Failed to generate authentication token" });
    }
  }
);
