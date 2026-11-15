import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

const OUTPUT_DIR = path.join(process.cwd(), "public");
const ENTRY_POINT = path.join(process.cwd(), "src/remotion/index.tsx");

const sceneNames = [
  "SaathiDemo-ElderHome",
  "SaathiDemo-Medicines",
  "SaathiDemo-WhySkipped",
  "SaathiDemo-CaregiverDashboard",
  "SaathiDemo-DoctorNote",
  "SaathiDemo-FastingPlanner"
];

const sceneFiles = sceneNames.map(name =>
  path.join(OUTPUT_DIR, `demo-${name.toLowerCase().replace('saathidemo-', '')}.mp4`)
);

console.log("🎬 Starting Saathi Demo Video Render via CLI");
console.log("=".repeat(50));

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

for (let i = 0; i < sceneNames.length; i++) {
  const sceneName = sceneNames[i];
  const outputFile = sceneFiles[i];

  console.log(`\n🎥 Rendering Scene ${i + 1}/6: ${sceneName}`);
  console.log(`   Output: ${outputFile}`);

  const result = spawnSync("npx", [
    "remotion", "render",
    ENTRY_POINT,
    sceneName,
    outputFile,
    "--concurrency=8",
    "--image-format=jpeg",
    "--jpeg-quality=90",
    "--codec=h264"
  ], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    console.error(`❌ Scene ${i + 1} failed with exit code ${result.status}`);
    process.exit(1);
  }

  const stats = fs.statSync(outputFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   ✅ Complete - ${sizeMB} MB`);
}

console.log("\n🎉 All scenes rendered!");
console.log("📁 Scene files:");
sceneFiles.forEach(f => console.log(`   ${f}`));

// Note: To combine into single 90s video, use ffmpeg concat
console.log("\n💡 To combine into single video, run:");
console.log(`   ffmpeg -f concat -safe 0 -i <(for f in ${sceneFiles.map(f => `'${f}'`).join(' ')}; do echo "file '$f'"; done) -c copy ${path.join(OUTPUT_DIR, "demo-saathi.mp4")}`);