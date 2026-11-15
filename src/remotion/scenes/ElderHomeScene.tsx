import { useCurrentFrame, interpolate, spring } from "remotion";
import { AbsoluteFill } from "remotion";

interface ElderHomeSceneProps {
  startFrame: number;
  totalDuration: number;
}

export const ElderHomeScene: React.FC<ElderHomeSceneProps> = ({ startFrame, totalDuration }) => {
  const frame = useCurrentFrame();
  const sceneFrame = frame - startFrame;
  const duration = 12 * 30; // 12 seconds at 30fps

  // Animations
  const titleOpacity = spring({
    fps: 30,
    frame: sceneFrame,
    config: { damping: 20, stiffness: 150 },
  });
  const subtitleOpacity = spring({
    fps: 30,
    frame: sceneFrame - 20,
    config: { damping: 20, stiffness: 150 },
  });
  const cardSlide = spring({
    fps: 30,
    frame: sceneFrame - 40,
    config: { damping: 18, stiffness: 120 },
  });

  const showScene = sceneFrame >= 0 && sceneFrame < duration;

  if (!showScene) {
    return null;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#FEF7ED", overflow: "hidden" }}>
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 20%, #FED7AA22 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, #FDBA7422 0%, transparent 50%)`,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          right: "10%",
          textAlign: "center",
          opacity: interpolate(titleOpacity, [0, 1], [0, 1]),
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: "700",
            color: "#7C2D12",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.1,
            textShadow: "0 2px 4px rgba(124, 45, 18, 0.1)",
            margin: 0,
          }}
        >
          Saathi साथी
        </h1>
        <p
          style={{
            fontSize: 28,
            fontWeight: "400",
            color: "#9A3412",
            fontFamily: "Inter, system-ui, sans-serif",
            marginTop: 8,
            opacity: interpolate(subtitleOpacity, [0, 1], [0, 1]),
          }}
        >
          Your Elder Care Companion | आपका बुजुर्ग देखभाल साथी
        </p>
      </div>

      {/* Feature Cards */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "10%",
          right: "10%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 32,
          transform: `translateY(${interpolate(cardSlide, [0, 1], [80, 0])}px)`,
          opacity: interpolate(cardSlide, [0, 1], [0, 1]),
        }}
      >
        {/* Medicine Card */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 10px 40px rgba(124, 45, 18, 0.12)",
            border: "1px solid #FED7AA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 40 }}>💊</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: "600", color: "#7C2D12", marginBottom: 8, margin: "0 0 8 0" }}>
            Medicines
          </h2>
          <p style={{ fontSize: 18, color: "#9A3412", textAlign: "center", lineHeight: 1.5, margin: 0 }}>
            Track doses with<br />voice reminders
          </p>
          <p style={{ fontSize: 14, color: "#D97706", marginTop: 12, fontWeight: "500", margin: "12 0 0 0" }}>
            दवा ट्रैकिंग
          </p>
        </div>

        {/* Why Skipped Card */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 10px 40px rgba(124, 45, 18, 0.12)",
            border: "1px solid #FED7AA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 40 }}>🎤</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: "600", color: "#7C2D12", marginBottom: 8, margin: "0 0 8 0" }}>
            Why Skipped
          </h2>
          <p style={{ fontSize: 18, color: "#9A3412", textAlign: "center", lineHeight: 1.5, margin: 0 }}>
            Voice notes for<br />missed doses
          </p>
          <p style={{ fontSize: 14, color: "#D97706", marginTop: 12, fontWeight: "500", margin: "12 0 0 0" }}>
            छोड़ी दवा की वजह
          </p>
        </div>

        {/* Caregiver Card */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 10px 40px rgba(124, 45, 18, 0.12)",
            border: "1px solid #FED7AA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 40 }}>👨‍⚕️</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: "600", color: "#7C2D12", marginBottom: 8, margin: "0 0 8 0" }}>
            Caregiver Dashboard
          </h2>
          <p style={{ fontSize: 18, color: "#9A3412", textAlign: "center", lineHeight: 1.5, margin: 0 }}>
            Real-time adherence<br />monitoring
          </p>
          <p style={{ fontSize: 14, color: "#D97706", marginTop: 12, fontWeight: "500", margin: "12 0 0 0" }}>
            देखभाल डैशबोर्ड
          </p>
        </div>
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "10%",
          right: "10%",
          textAlign: "center",
          opacity: interpolate(subtitleOpacity, [0, 1], [0, 1]),
        }}
      >
        <p style={{ fontSize: 20, color: "#9A3412", fontWeight: "500", margin: 0 }}>
          Simplifying elder care, one dose at a time
        </p>
      </div>
    </AbsoluteFill>
  );
};