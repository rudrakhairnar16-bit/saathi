import { useCurrentFrame, interpolate, spring } from "remotion";
import { AbsoluteFill } from "remotion";

interface MedicinesSceneProps {
  startFrame: number;
  totalDuration: number;
}

export const MedicinesScene: React.FC<MedicinesSceneProps> = ({ startFrame, totalDuration }) => {
  const frame = useCurrentFrame();
  const sceneFrame = frame - startFrame;
  const duration = 15 * 30; // 15 seconds at 30fps

  // Animations
  const headerSlide = spring({
    fps: 30,
    frame: sceneFrame,
    config: { damping: 20, stiffness: 150 },
  });
  const listSlide = spring({
    fps: 30,
    frame: sceneFrame - 30,
    config: { damping: 18, stiffness: 120 },
  });
  const pillAnimation = spring({
    fps: 30,
    frame: sceneFrame - 60,
    config: { damping: 15, stiffness: 100 },
  });
  const checkmarkAnimation = spring({
    fps: 30,
    frame: sceneFrame - 120,
    config: { damping: 12, stiffness: 180 },
  });

  const showScene = sceneFrame >= 0 && sceneFrame < duration;

  if (!showScene) {
    return null;
  }

  const medicines = [
    { name: "Metformin 500mg", time: "08:00 AM", taken: true, hindi: "मेटफॉर्मिन" },
    { name: "Amlodipine 5mg", time: "08:00 AM", taken: true, hindi: "एम्लोडिपाइन" },
    { name: "Atorvastatin 10mg", time: "08:00 PM", taken: false, hindi: "एटोरवास्टेटिन" },
    { name: "Vitamin D3", time: "08:00 PM", taken: false, hindi: "विटामिन D3" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#FEF7ED", overflow: "hidden" }}>
      {/* Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 10% 10%, #FED7AA22 0%, transparent 50%),
                           radial-gradient(circle at 90% 90%, #FDBA7422 0%, transparent 50%)`,
        }}
      />

      {/* Top Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #FED7AA",
          display: "flex",
          alignItems: "center",
          paddingLeft: 40,
          paddingRight: 40,
          transform: `translateY(${interpolate(headerSlide, [0, 1], [-100, 0])}px)`,
          opacity: interpolate(headerSlide, [0, 1], [0, 1]),
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: "700", color: "#7C2D12", margin: 0 }}>
          Medicines | दवाएं
        </h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#FEF3C7", padding: "8 16", borderRadius: 20 }}>
            <span style={{ fontSize: 18, color: "#7C2D12", fontWeight: "600" }}>2/4 Taken</span>
          </div>
        </div>
      </div>

      {/* Medicine List */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 60,
          right: 60,
          bottom: 100,
          overflowY: "auto",
          transform: `translateY(${interpolate(listSlide, [0, 1], [60, 0])}px)`,
          opacity: interpolate(listSlide, [0, 1], [0, 1]),
        }}
      >
        {medicines.map((med, index) => (
          <div
            key={med.name}
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              boxShadow: "0 4px 20px rgba(124, 45, 18, 0.08)",
              border: `1px solid ${med.taken ? "#BBF7D0" : "#FED7AA"}`,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `translateX(${interpolate(listSlide, [0, 1], [-50 * (index + 1), 0])}px)`,
              opacity: interpolate(listSlide, [0, 1], [0, 1]),
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Pill Icon with Animation */}
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 16,
                  backgroundColor: med.taken ? "#ECFDF5" : "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transform: `scale(${interpolate(pillAnimation, [0, 1], [0.8, 1])})`,
                }}
              >
                <span style={{ fontSize: 32 }}>💊</span>
                {med.taken && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#10B981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${interpolate(checkmarkAnimation, [0, 1], [0, 1])})`,
                    }}
                  >
                    <span style={{ fontSize: 14, color: "white" }}>✓</span>
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: 22, fontWeight: "600", color: "#7C2D12", margin: "0 0 4 0" }}>
                  {med.name}
                </h3>
                <p style={{ fontSize: 16, color: "#9A3412", margin: "4 0 0 0" }}>
                  {med.hindi}
                </p>
                <p style={{ fontSize: 16, color: "#D97706", margin: "4 0 0 0", fontWeight: "500" }}>
                  ⏰ {med.time}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div
              style={{
                padding: "8 16",
                borderRadius: 20,
                backgroundColor: med.taken ? "#ECFDF5" : "#FEF3C7",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: med.taken ? "#065F46" : "#9A3412",
                }}
              >
                {med.taken ? "Taken ✓" : "Pending"}
              </span>
            </div>
          </div>
        ))}

        {/* Voice Reminder Indicator */}
        <div
          style={{
            marginTop: 24,
            padding: 24,
            backgroundColor: "#FFF7ED",
            borderRadius: 16,
            border: "2px dashed #FDBA74",
            display: "flex",
            alignItems: "center",
            gap: 16,
            transform: `translateY(${interpolate(listSlide, [0, 1], [40, 0])}px)`,
            opacity: interpolate(listSlide, [0, 1], [0, 1]),
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#FED7AA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s infinite",
            }}
          >
            <span style={{ fontSize: 28 }}>🔊</span>
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: "600", color: "#7C2D12", margin: "0 0 4 0" }}>
              Voice Reminder Active
            </h3>
            <p style={{ fontSize: 16, color: "#9A3412", margin: 0 }}>
              "दवा लेने का समय हो गया है" - Automated Hindi/English TTS
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Caption */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 60,
          right: 60,
          textAlign: "center",
          opacity: interpolate(headerSlide, [0, 1], [0, 1]),
        }}
      >
        <p style={{ fontSize: 18, color: "#9A3412", margin: 0 }}>
          Elder-friendly UI with large touch targets & voice guidance
        </p>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </AbsoluteFill>
  );
};