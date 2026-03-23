# Fill-3D Content Creation

Tools for creating marketing content for Fill-3D.

## Stack

| Tool | Purpose |
|------|---------|
| **Remotion** | Programmatic video creation with React |
| **Nano Banana** (Gemini 2.5 Flash Image) | AI image generation for marketing assets |
| **AutoResearch** | Autonomous content research & ideation |

## Setup

```bash
cd content
npm install
```

## Videos (Remotion)

Open the Remotion Studio to preview and edit compositions:

```bash
npm run studio
```

Render videos to `out/`:

```bash
npm run render:intro      # 5s brand intro (1920x1080)
npm run render:showcase   # 10s product showcase (1080x1920, vertical)
npm run render:all        # render both
```

### Compositions

- **Fill3DIntro** — Animated logo reveal, 5s, 1920×1080
- **ProductShowcase** — Feature highlight reel, 10s, 1080×1920 (Reels/TikTok)

## Images (Nano Banana)

Requires a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

```bash
export GEMINI_API_KEY=your_key_here

npm run images           # generate all marketing images
npm run images:hero      # generate only the hero image
```

Generated images are saved to `generated-images/`.

### Available prompts

- `hero` — Hero image for website
- `social_reel` — TikTok/Reels cover
- `materials` — Materials showcase grid
- `calculator_ui` — Calculator UI illustration

## Research (AutoResearch)

Run autonomous content research to discover ideas and trends:

```bash
npm run research
```

Configuration in `src/research/config.ts` — customize goals, target audience, and content types.
