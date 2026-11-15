import { useCurrentFrame, interpolate, spring } from "remotion";
import { AbsoluteFill } from "remotion";

interface WhySkippedSceneProps {
  startFrame: number;
  totalDuration: number;
}

export const WhySkippedScene: React.FC<WhySkippedSceneProps> = ({ startFrame, totalDuration }) => {
  const frame = useCurrentFrame();
  const sceneFrame = frame - startFrame;
  const duration = 15 * 30; // 15 seconds at 30fps

  // Animations
  const headerSlide = spring({
    fps: 30,
    frame: sceneFrame,
    config: { damping: 20, stiffness: 150 },
  });
  const cardSlide = spring({
    fps: 30,
    frame: sceneFrame - 30,
    config: { damping: 18, stiffness: 120 },
  });
  const waveformAnimation = spring({
    fps: 30,
    frame: sceneFrame - 60,
    config: { damping: 10, stiffness: 200 },
  });
  const transcriptReveal = spring({
    fps: 30,
    frame: sceneFrame - 120,
    config: { damping: 20, stiffness: 100 },
  });

  const showScene = sceneFrame >= 0 && sceneFrame < duration;

  if (!showScene) {
    return null;
  }

  const skippedReasons = [
    {
      medicine: "Atorvastatin 10mg",
      hindi: "एटोरवास्टेटिन",
      reason: "Felt dizzy after taking",
      hindiReason: "लेने के बाद चक्कर आया",
      timestamp: "Today 8:05 PM",
      audioLevel: [0.3, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6],
    },
    {
      medicine: "Vitamin D3",
      hindi: "विटामिन D3",
      reason: "Forgot - was at temple",
      hindiReason: "भूल गए - मंदिर में थे",
      timestamp: "Today 8:10 PM",
      audioLevel: [0.2, 0.5, 0.7, 0.4, 0.6, 0.3, 0.5, 0.4],
    },
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
          backgroundImage: `radial-gradient(circle at 15% 15%, #FED7AA22 0%, transparent 50%),
                           radial-gradient(circle at 85% 85%, #FDBA7422 0%, transparent 50%)`,
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
          Why Skipped? | दवा क्यों छोड़ी?
        </h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#F59E0B",
              animation: "pulse 1.5s infinite",
            }}
          />
          <span style={{ fontSize: 16, color: "#9A3412", fontWeight: "500" }}>
            Voice Recording Active
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 60,
          right: 60,
          bottom: 100,
          display: "flex",
          flexDirection: "row",
          gap: 40,
          transform: `translateY(${interpolate(cardSlide, [0, 1], [60, 0])}px)`,
          opacity: interpolate(cardSlide, [0, 1], [0, 1]),
        }}
      >
        {/* Left Panel - Skipped Medicines */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: "600", color: "#7C2D12", marginBottom: 16, margin: "0 0 16 0" }}>
            Missed Doses Today
          </h2>

          {skippedReasons.map((item, index) => (
            <div
              key={item.medicine}
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 4px 20px rgba(124, 45, 18, 0.08)",
                border: "1px solid #FED7AA",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: "600", color: "#7C2D12", margin: "0 0 2 0" }}>
                    {item.medicine}
                  </h3>
                  <p style={{ fontSize: 16, color: "#9A3412", margin: "2 0 0 0" }}>
                    {item.hindi}
                  </p>
                </div>
                <span style={{ fontSize: 14, color: "#D97706", fontWeight: "500" }}>
                  {item.timestamp}
                </span>
              </div>

              {/* Audio Waveform Visualization */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 4,
                  height: 50,
                  marginBottom: 12,
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                {item.audioLevel.map((level, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      maxWidth: 12,
                      height: `${level * 50}px`,
                      backgroundColor: `rgba(245, 158, 11, ${0.4 + level * 0.6})`,
                      borderRadius: 6,
                      transform: `scaleY(${interpolate(waveformAnimation, [0, 1], [0.1, 1])})`,
                      transition: `transform 0.${100 + i * 20}ms ease-out`,
                    }}
                  />
                ))}
              </div>

              {/* Transcript Reveal */}
              <div
                style={{
                  backgroundColor: "#FFF7ED",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid #FED7AA",
                  opacity: interpolate(transcriptReveal, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(transcriptReveal, [0, 1], [20, 0])}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🎤</span>
                  <h4 style={{ fontSize: 16, fontWeight: "600", color: "#7C2D12", margin: 0 }}>
                    Voice Note Transcript
                  </h4>
                </div>
                <p style={{ fontSize: 16, color: "#9A3412", lineHeight: 1.5, margin: "0 0 8 0" }}>
                  "{item.reason}"
                </p>
                <p style={{ fontSize: 14, color: "#D97706", fontStyle: "italic", margin: 0 }}>
                  "{item.hindiReason}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel - Voice Recording UI */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: 24, fontWeight: "600", color: "#7C2D12", marginBottom: 20, margin: "0 0 20 0" }}>
            Record Reason | कारण रिकॉर्ड करें
          </h2>

          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 40,
              boxShadow: "0 10px 40px rgba(124, 45, 18, 0.12)",
              border: "1px solid #FED7AA",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Large Record Button */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 32,
                boxShadow: "0 8px 30px rgba(220, 38, 38, 0.4)",
                animation: "recordPulse 1.5s infinite",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "white",
                  animation: "recordInner 1.5s infinite",
                }}
              />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: "600", color: "#7C2D12", textAlign: "center", marginBottom: 12, margin: "0 0 12 0" }}>
              Tap to Record Voice Note
            </h3>
            <p style={{ fontSize: 18, color: "#9A3412", textAlign: "center", marginBottom: 8, margin: "0 0 8 0" }}>
              "दवा क्यों नहीं ली?" बोलें
            </p>

            {/* Recording Indicator */}
            <div
              style={{
                marginTop: 32,
                padding: "16 32",
                backgroundColor: "#FEF3C7",
                borderRadius: 30,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#F59E0B",
                  animation: "blink 1s infinite",
                }}
              />
              <span style={{ fontSize: 16, fontWeight: "500", color: "#9A3412" }}>
                Recording... 0:05
              </span>
            </div>

            {/* Language Toggle */}
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <div
                style={{
                  padding: "10 24",
                  backgroundColor: "#7C2D12",
                  borderRadius: 20,
                  color: "white",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                English
              </div>
              <div
                style={{
                  padding: "10 24",
                  backgroundColor: "#FEF3C7",
                  borderRadius: 20,
                  color: "#9A3412",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                हिंदी
              </div>
            </div>
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
          Voice-first input for low-literacy elders • Auto-transcription & translation
        </p>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        @keyframes recordPulse {
          0%, 100% { box-shadow: 0 8px 30px rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 8px 40px rgba(220, 38, 38, 0.6); }
        }
        @keyframes recordInner {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.85); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </AbsoluteFill>
  );
};