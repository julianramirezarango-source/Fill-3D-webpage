/**
 * TikTok video upload using Content Posting API v2.
 * Reads token from .tiktok-token.json (created by auth.ts).
 *
 * Usage:
 *   npx ts-node src/tiktok/upload.ts --video out/showcase.mp4 --caption "Your caption #fill3d #3dprinting"
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import axios from "axios";

const TOKEN_FILE = path.join(__dirname, "../../.tiktok-token.json");

function loadToken(): { access_token: string; open_id: string; expires_at: number } {
  if (!fs.existsSync(TOKEN_FILE)) {
    throw new Error(
      "No token found. Run: npx ts-node src/tiktok/auth.ts"
    );
  }
  const token = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  if (Date.now() > token.expires_at) {
    throw new Error("Token expired. Run: npx ts-node src/tiktok/auth.ts");
  }
  return token;
}

async function initUpload(
  accessToken: string,
  fileSize: number
): Promise<{ upload_url: string; publish_id: string }> {
  const res = await axios.post(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      post_info: {
        title: "",           // set below after init
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: fileSize,
        chunk_size: fileSize,
        total_chunk_count: 1,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );

  if (res.data.error?.code !== "ok") {
    throw new Error(`Init error: ${JSON.stringify(res.data.error)}`);
  }

  return {
    upload_url: res.data.data.upload_url,
    publish_id: res.data.data.publish_id,
  };
}

async function uploadChunk(
  uploadUrl: string,
  videoBuffer: Buffer
): Promise<void> {
  await axios.put(uploadUrl, videoBuffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Range": `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
      "Content-Length": videoBuffer.length,
    },
    maxBodyLength: Infinity,
  });
}

async function publishVideo(
  accessToken: string,
  publishId: string,
  caption: string
): Promise<void> {
  const res = await axios.post(
    "https://open.tiktokapis.com/v2/post/publish/status/update/",
    {
      publish_id: publishId,
      post_info: {
        title: caption,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );

  if (res.data.error?.code !== "ok") {
    throw new Error(`Publish error: ${JSON.stringify(res.data.error)}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const videoIdx = args.indexOf("--video");
  const captionIdx = args.indexOf("--caption");

  const videoPath = videoIdx >= 0 ? args[videoIdx + 1] : "out/showcase.mp4";
  const caption =
    captionIdx >= 0
      ? args[captionIdx + 1]
      : "Professional 3D printing services 🖨️ Get your quote instantly! #fill3d #3dprinting #3dprint #prototyping #engineering";

  const fullVideoPath = path.resolve(process.cwd(), videoPath);

  if (!fs.existsSync(fullVideoPath)) {
    throw new Error(`Video not found: ${fullVideoPath}\nRun: npm run render:showcase`);
  }

  const token = loadToken();
  const videoBuffer = fs.readFileSync(fullVideoPath);

  console.log(`Uploading: ${path.basename(fullVideoPath)} (${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB)`);

  const { upload_url, publish_id } = await initUpload(token.access_token, videoBuffer.length);
  console.log("Upload initialized, publish_id:", publish_id);

  await uploadChunk(upload_url, videoBuffer);
  console.log("Video uploaded.");

  await publishVideo(token.access_token, publish_id, caption);
  console.log("\nPosted to TikTok!");
  console.log("Caption:", caption);
}

main().catch(console.error);
