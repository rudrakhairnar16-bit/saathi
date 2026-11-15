# Saathi Demo Video - Remotion Pipeline

This directory contains a Remotion-based video rendering pipeline for creating a 90-second demo video of the Saathi elder care app.

## 🎬 Video Overview

**Duration:** 90 seconds  
**Resolution:** 1920x1080 (Full HD)  
**Frame Rate:** 30 fps  
**Scenes (6 flows):**
1. **Elder Home** (0-12s) - App landing with feature cards
2. **Medicines** (12-27s) - Medicine tracking with voice reminders
3. **Why Skipped** (27-42s) - Voice notes for missed doses
4. **Caregiver Dashboard** (42-60s) - Real-time adherence monitoring
5. **Doctor Notes** (60-75s) - Bilingual clinical notes
6. **Fasting Planner** (75-90s) - Smart medicine adjustments for religious fasts

**Features:**
- Hindi/English bilingual captions throughout
- Warm, elder-friendly UI design (orange/amber theme)
- Smooth animations with spring physics
- Production-ready MP4 output

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- FFmpeg installed (for video encoding)
- Chrome/Chromium (for Remotion rendering)

```bash
# Install dependencies (already done)
npm install

# Verify Remotion setup
npm run remotion:check
```

### Local Development

**Open Remotion Studio (interactive preview):**
```bash
npm run remotion:studio
```
This opens a browser at `http://localhost:3000` where you can scrub through the timeline, preview frames, and inspect props.

### Rendering

**Local render (CPU):**
```bash
npm run remotion:render
```
Output: `public/demo-saathi.mp4`  
Estimated time: 2-5 minutes on modern hardware

**Cloud render (Remotion Lambda - faster):**
```bash
# Requires AWS credentials configured
npm run remotion:render:lambda
```
Uses Remotion Lambda for parallel cloud rendering (~30-60 seconds)

**Build bundle only:**
```bash
npm run remotion:build
```
Creates `dist/remotion.bundle.js` for deployment

## 📁 Project Structure

```
src/remotion/
├── DemoVideo.tsx           # Main composition entry point
├── scenes/
│   ├── ElderHomeScene.tsx       # Scene 1: App landing
│   ├── MedicinesScene.tsx       # Scene 2: Medicine tracking
│   ├── WhySkippedScene.tsx      # Scene 3: Voice skip reasons
│   ├── CaregiverDashboardScene.tsx  # Scene 4: Caregiver view
│   ├── DoctorNoteScene.tsx      # Scene 5: Doctor notes
│   └── FastingPlannerScene.tsx  # Scene 6: Fasting schedule
scripts/
├── render-demo.ts          # Main render script
remotion.config.ts          # Remotion configuration
RENDER_README.md            # This file
```

## ⚙️ Configuration

### remotion.config.ts
```typescript
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setPixelFormat("yuv420p");
Config.setConcurrency(8);      // Parallel frames
Config.setCrf(23);             // Quality (lower = better)
Config.setAudioCodec("aac");
Config.setAudioBitrate("128k");
Config.setFrameRate(30);
Config.setCodec("h264");
```

### Scene Timing (in DemoVideo.tsx)
```typescript
const SCENES = [
  { name: "ElderHome", startFrame: 0, duration: 12 * 30 },
  { name: "Medicines", startFrame: 12 * 30, duration: 15 * 30 },
  { name: "WhySkipped", startFrame: 27 * 30, duration: 15 * 30 },
  { name: "CaregiverDashboard", startFrame: 42 * 30, duration: 18 * 30 },
  { name: "DoctorNote", startFrame: 60 * 30, duration: 15 * 30 },
  { name: "FastingPlanner", startFrame: 75 * 30, duration: 15 * 30 },
];
```

To adjust timing, modify `startFrame` and `duration` values (in frames @ 30fps).

## 🎨 Customization

### Colors (Saathi Brand)
```css
--primary: #7C2D12;      /* Dark amber */
--secondary: #9A3412;    /* Medium amber */
--accent: #D97706;       /* Gold */
--light: #FEF7ED;        /* Cream background */
--card: #FEF3C7;         /* Light amber cards */
--success: #10B981;      /* Green */
--warning: #F59E0B;      /* Amber */
--error: #EF4444;        /* Red */
```

### Fonts
Uses system fonts: `Inter, system-ui, sans-serif`  
For custom fonts, add to `DemoVideo.tsx` and import in scenes.

### Adding TTS Narration
To add voiceover, modify `render-demo.ts`:
```typescript
await renderMedia({
  // ...existing options
  audioMap: [
    { startFrame: 0, src: "./narration.mp3" },
  ],
});
```

## ☁️ Remotion Lambda Setup (Optional)

For faster cloud rendering:

1. **Deploy Lambda function:**
```bash
npx remotion lambda sites create --region us-east-1
```

2. **Configure AWS credentials:**
```bash
aws configure
# Or set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY env vars
```

3. **Render with Lambda:**
```bash
npm run remotion:render:lambda
```

## 🔧 Troubleshooting

### Common Issues

**"Command not found: remotion"**
```bash
npx remotion studio src/remotion/DemoVideo.tsx
```

**FFmpeg not found:**
```bash
# macOS
brew install ffmpeg

# Windows (chocolatey)
choco install ffmpeg

# Ubuntu
sudo apt install ffmpeg
```

**Out of memory during render:**
Reduce concurrency in `remotion.config.ts`:
```typescript
Config.setConcurrency(4);  // Lower from 8
```

**Font rendering issues:**
Ensure fonts are installed system-wide or use web fonts with `@font-face`.

**TypeScript errors:**
```bash
npm run typecheck
```

## 📊 Output Verification

After rendering, verify the output:
```bash
# Check file exists and size
ls -lh public/demo-saathi.mp4

# Quick info with ffprobe
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=noprint_wrappers=1 public/demo-saathi.mp4
```

Expected output:
- Duration: ~90 seconds
- Size: 15-30 MB (depending on content)
- Codec: H.264 / AAC
- Resolution: 1920x1080

## 🎯 Production URL Reference

The demo showcases flows from the production app:
- **Production URL:** https://1-xi-swart.vercel.app
- **Elder view:** `/elder` → Medicines, Why Skipped
- **Caregiver view:** `/caregiver` → Dashboard
- **Doctor notes & Fasting:** Integrated in both views

## 📝 License & Credits

Built with [Remotion](https://remotion.dev) - React for Video  
Saathi Elder Care App - Internal Demo Pipeline