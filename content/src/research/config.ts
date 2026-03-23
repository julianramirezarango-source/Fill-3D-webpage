/**
 * AutoResearch configuration for Fill-3D content strategy
 *
 * AutoResearch (by Andrej Karpathy) runs autonomous research loops to discover
 * content ideas, competitor analysis, and SEO opportunities for Fill-3D.
 *
 * Usage:
 *   npx autoresearch run --config src/research/config.ts
 */

export const researchConfig = {
  topic: "Fill-3D 3D printing service content strategy",

  goals: [
    "Identify trending topics in 3D printing for social media content",
    "Analyze competitor content strategies in the 3D printing market",
    "Generate blog post ideas for Fill-3D's target audience",
    "Find SEO keywords for 3D print services",
    "Discover use cases to highlight in marketing videos",
  ],

  contentTypes: [
    {
      type: "short_video",
      platform: ["TikTok", "Instagram Reels", "YouTube Shorts"],
      duration: "15-60s",
    },
    {
      type: "long_video",
      platform: ["YouTube"],
      duration: "5-15min",
    },
    {
      type: "image_post",
      platform: ["Instagram", "LinkedIn"],
    },
    {
      type: "blog_post",
      platform: ["Website"],
      wordCount: "800-2000",
    },
  ],

  audience: {
    primary: "Engineers and product designers needing prototypes",
    secondary: "Hobbyists and cosplay creators",
    tertiary: "Small businesses needing custom parts",
  },

  brandVoice: {
    tone: "Professional yet approachable",
    values: ["Quality", "Speed", "Precision", "Innovation"],
    color: "#5E33D9",
  },
};
