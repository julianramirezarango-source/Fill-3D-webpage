/**
 * TikTok OAuth 2.0 — gets an access token via browser flow.
 * Run once: npx ts-node src/tiktok/auth.ts
 * Saves token to .tiktok-token.json (gitignored)
 */

import "dotenv/config";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:8080/callback";
const TOKEN_FILE = path.join(__dirname, "../../.tiktok-token.json");

const SCOPES = [
  "user.info.basic",
  "video.publish",
  "video.upload",
].join(",");

function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: SCOPES,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

async function exchangeCodeForToken(code: string): Promise<void> {
  const res = await axios.post(
    "https://open.tiktokapis.com/v2/oauth/token/",
    new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (res.data.error) {
    throw new Error(`Token error: ${res.data.error_description}`);
  }

  const token = {
    access_token: res.data.access_token,
    refresh_token: res.data.refresh_token,
    expires_at: Date.now() + res.data.expires_in * 1000,
    open_id: res.data.open_id,
  };

  fs.writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2));
  console.log("Token saved to", TOKEN_FILE);
}

async function main() {
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = buildAuthUrl(state);

  console.log("\nOpening browser for TikTok login...");
  console.log("If it does not open automatically, visit:\n");
  console.log(authUrl, "\n");

  // Try to open browser (best effort)
  try {
    const open = (await import("open")).default;
    await open(authUrl);
  } catch {}

  // Local server to catch redirect
  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:8080`);
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");

      if (!code) {
        res.end("Missing code. Close this tab and try again.");
        return;
      }
      if (returnedState !== state) {
        res.end("State mismatch. Possible CSRF. Try again.");
        return;
      }

      res.end("<h2>Authenticated! You can close this tab.</h2>");
      server.close();

      try {
        await exchangeCodeForToken(code);
        resolve();
      } catch (e) {
        reject(e);
      }
    });

    server.listen(8080, () => {
      console.log("Waiting for TikTok redirect on http://localhost:8080 ...");
    });
  });

  console.log("\nAuth complete. You can now run: npm run tiktok:post");
}

main().catch(console.error);
