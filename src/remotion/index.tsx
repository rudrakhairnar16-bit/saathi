// Saathi Demo Video - Remotion Entry Point
import { Composition, registerRoot } from "remotion";
import { ElderHomeScene } from "./scenes/ElderHomeScene";
import { MedicinesScene } from "./scenes/MedicinesScene";
import { WhySkippedScene } from "./scenes/WhySkippedScene";
import { CaregiverDashboardScene } from "./scenes/CaregiverDashboardScene";
import { DoctorNoteScene } from "./scenes/DoctorNoteScene";
import { FastingPlannerScene } from "./scenes/FastingPlannerScene";

const FPS = 30;
const DURATION_IN_FRAMES = 90 * FPS; // 90 seconds

// Scene timing (in frames)
const SCENES = [
  { name: "ElderHome", component: ElderHomeScene, startFrame: 0, duration: 12 * FPS },        // 0-12s
  { name: "Medicines", component: MedicinesScene, startFrame: 12 * FPS, duration: 15 * FPS }, // 12-27s
  { name: "WhySkipped", component: WhySkippedScene, startFrame: 27 * FPS, duration: 15 * FPS }, // 27-42s
  { name: "CaregiverDashboard", component: CaregiverDashboardScene, startFrame: 42 * FPS, duration: 18 * FPS }, // 42-60s
  { name: "DoctorNote", component: DoctorNoteScene, startFrame: 60 * FPS, duration: 15 * FPS }, // 60-75s
  { name: "FastingPlanner", component: FastingPlannerScene, startFrame: 75 * FPS, duration: 15 * FPS }, // 75-90s
] as const;

const Root: React.FC = () => {
  return (
    <>
      {SCENES.map(({ name, component: Component, startFrame, duration }) => (
        <Composition
          key={name}
          id={`SaathiDemo-${name}`}
          component={Component}
          durationInFrames={duration}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={{
            startFrame,
            totalDuration: DURATION_IN_FRAMES,
          }}
        />
      ))}
    </>
  );
};

registerRoot(Root);