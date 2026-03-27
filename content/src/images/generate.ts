/**
 * Nano Banana (Gemini image generation) script for Fill-3D content
 *
 * Usage:
 *   GEMINI_API_KEY=your_key npx ts-node src/images/generate.ts
 *
 * Generates marketing images for Fill-3D social media and website.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const PROMPTS: Record<string, string> = {
  hero: "A sleek purple-lit 3D printer producing a detailed figurine, professional product photography, dark background, brand color #5E33D9, ultra-realistic, 8K",
  social_reel:
    "Time-lapse style 3D printing process, layer by layer, purple neon glow, cinematic, TikTok/Reels vertical format",
  materials:
    "Grid of 6 colorful 3D printed objects showing different materials: PLA, PETG, ABS, resin — studio lighting, white background, product photography",
  calculator_ui:
    "Minimal flat-design illustration of a 3D print cost calculator UI on a laptop, purple accent color, modern fintech aesthetic",
};

async function generateImage(
  client: GoogleGenerativeAI,
  promptKey: string,
  prompt: string,
  outputDir: string
): Promise<void> {
  console.log(`Generating: ${promptKey}...`);

  const model = client.getGenerativeModel({ model: "gemini-2.5-flash-image" });

  const result = await model.generateContent([
    {
      text: prompt,
    },
  ]);

  const response = result.response;
  const parts = response.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      const ext = part.inlineData.mimeType.split("/")[1];
      const filePath = path.join(outputDir, `${promptKey}.${ext}`);
      fs.writeFileSync(filePath, buffer);
      console.log(`  Saved: ${filePath}`);
    }
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is required.");
    console.error("Get your key at: https://aistudio.google.com/app/apikey");
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), "generated-images");
  fs.mkdirSync(outputDir, { recursive: true });

  const client = new GoogleGenerativeAI(apiKey);

  const target = process.argv[2];

  if (target && PROMPTS[target]) {
    await generateImage(client, target, PROMPTS[target], outputDir);
  } else {
    for (const [key, prompt] of Object.entries(PROMPTS)) {
      await generateImage(client, key, prompt, outputDir);
    }
  }

  console.log("\nDone! Images saved to:", outputDir);
}

main().catch(console.error);
