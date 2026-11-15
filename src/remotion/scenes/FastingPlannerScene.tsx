import { useCurrentFrame, interpolate, spring } from "remotion";
import { AbsoluteFill } from "remotion";

interface FastingPlannerSceneProps {
  startFrame: number;
  totalDuration: number;
}

export const FastingPlannerScene: React.FC<FastingPlannerSceneProps> = ({ startFrame, totalDuration }) => {
  const frame = useCurrentFrame();
  const sceneFrame = frame - startFrame;
  const duration = 15 * 30; // 15 seconds at 30fps

  // Animations
  const headerSlide = spring({
    fps: 30,
    frame: sceneFrame,
    config: { damping: 20, stiffness: 150 },
  });
  const calendarSlide = spring({
    fps: 30,
    frame: sceneFrame - 30,
    config: { damping: 18, stiffness: 120 },
  });
  const scheduleSlide = spring({
    fps: 30,
    frame: sceneFrame - 80,
    config: { damping: 18, stiffness: 120 },
  });
  const pillAnimation = spring({
    fps: 30,
    frame: sceneFrame - 120,
    config: { damping: 15, stiffness: 100 },
  });

  const showScene = sceneFrame >= 0 && sceneFrame < duration;

  if (!showScene) {
    return null;
  }

  const fastingDays = [
    { date: "Nov 15", name: "Kartik Purnima", type: "full", medicines: ["Metformin - SKIP", "Amlodipine - 8 AM", "Atorvastatin - SKIP", "Vitamin D3 - SKIP"] },
    { date: "Nov 22", name: "Ekadashi", type: "partial", medicines: ["Metformin - 8 AM (with fruit)", "Amlodipine - 8 AM", "Atorvastatin - 8 PM", "Vitamin D3 - 8 PM"] },
    { date: "Dec 6", name: "Pradosh Vrat", type: "partial", medicines: ["Metformin - SKIP", "Amlodipine - 8 AM", "Atorvastatin - 8 PM", "Vitamin D3 - 8 PM"] },
    { date: "Dec 15", name: "Margashirsha Purnima", type: "full", medicines: ["Metformin - SKIP", "Amlodipine - 8 AM", "Atorvastatin - SKIP", "Vitamin D3 - SKIP"] },
  ];

  const todaySchedule = [
    { time: "06:00 AM", medicine: "Water / Hydration", status: "pending", icon: "💧", fastingNote: "Start with 2 glasses water" },
    { time: "08:00 AM", medicine: "Amlodipine 5mg", status: "taken", icon: "💊", fastingNote: "Take with small fruit piece" },
    { time: "08:00 AM", medicine: "Metformin 500mg", status: "skipped", icon: "⏭️", fastingNote: "SKIP - Fasting day" },
    { time: "12:00 PM", medicine: "Light fruit allowed", status: "pending", icon: "🍎", fastingNote: "Apple or pomegranate" },
    { time: "04:00 PM", medicine: "Herbal tea", status: "pending", icon: "🍵", fastingNote: "No sugar, no milk" },
    { time: "08:00 PM", medicine: "Atorvastatin 10mg", status: "skipped", icon: "⏭️", fastingNote: "SKIP - Fasting day" },
    { time: "08:00 PM", medicine: "Vitamin D3", status: "skipped", icon: "⏭️", fastingNote: "SKIP - Fasting day" },
    { time: "09:00 PM", medicine: "Fast ends - Light meal", status: "pending", icon: "🍚", fastingNote: "Khichdi / Dal rice" },
  ];

  const typeColors = {
    full: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", label: "Full Fast", icon: "🚫" },
    partial: { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412", label: "Partial Fast", icon: "🍎" },
  };

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
          justifyContent: "space-between",
          paddingLeft: 40,
          paddingRight: 40,
          transform: `translateY(${interpolate(headerSlide, [0, 1], [-100, 0])}px)`,
          opacity: interpolate(headerSlide, [0, 1], [0, 1]),
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: "700", color: "#7C2D12", margin: 0 }}>
          Fasting Planner | व्रत योजनाकार
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#FEF3C7", padding: "8 16", borderRadius: 20 }}>
            <span style={{ fontSize: 18, color: "#7C2D12", fontWeight: "600" }}>📅 November 2024</span>
          </div>
          <div
            style={{
              padding: "8 16",
              backgroundColor: "#7C2D12",
              borderRadius: 20,
              color: "white",
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            + Add Fast
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 60,
          right: 60,
          bottom: 80,
          display: "flex",
          flexDirection: "row",
          gap: 30,
        }}
      >
        {/* Left Panel - Calendar */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 4px 20px rgba(124, 45, 18, 0.08)",
            border: "1px solid #FED7AA",
            display: "flex",
            flexDirection: "column",
            transform: `translateY(${interpolate(calendarSlide, [0, 1], [40, 0])}px)`,
            opacity: interpolate(calendarSlide, [0, 1], [0, 1]),
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: "600", color: "#7C2D12", marginBottom: 20, margin: "0 0 20 0" }}>
            Upcoming Fasts | आने वाले व्रत
          </h2>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
            {fastingDays.map((fast, index) => {
              const colors = typeColors[fast.type];
              return (
                <div
                  key={fast.date}
                  style={{
                    backgroundColor: colors.bg,
                    borderRadius: 12,
                    padding: 20,
                    border: `2px solid ${colors.border}`,
                    transform: `translateX(${interpolate(calendarSlide, [0, 1], [-40 * (index + 1), 0])}px)`,
                    opacity: interpolate(calendarSlide, [0, 1], [0, 1]),
                    transition: `all 0.4s ease ${index * 150}ms`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 28 }}>{colors.icon}</span>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: "600", color: "#7C2D12", margin: "0 0 2 0" }}>
                          {fast.name}
                        </h3>
                        <p style={{ fontSize: 14, color: "#9A3412", margin: "2 0 0 0" }}>
                          {fast.date}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "6 14",
                        backgroundColor: "white",
                        borderRadius: 20,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                        {colors.label}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: "#78716C", lineHeight: 1.8 }}>
                    {fast.medicines.map((med, i) => (
                      <div key={i} style={{ marginBottom: 4 }}>
                        {med.includes("SKIP") ? (
                          <span style={{ color: "#EF4444", textDecoration: "line-through" }}>{med}</span>
                        ) : (
                          <span style={{ color: "#10B981" }}>{med}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add Fast Button */}
            <div
              style={{
                padding: 24,
                backgroundColor: "white",
                borderRadius: 12,
                border: "2px dashed #FDBA74",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>➕</span>
              <h3 style={{ fontSize: 16, fontWeight: "600", color: "#7C2D12", margin: 0 }}>
                Add Custom Fast
              </h3>
            </div>
          </div>
        </div>

        {/* Right Panel - Today's Schedule */}
        <div
          style={{
            flex: 1.2,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 4px 20px rgba(124, 45, 18, 0.08)",
            border: "1px solid #FED7AA",
            display: "flex",
            flexDirection: "column",
            transform: `translateY(${interpolate(scheduleSlide, [0, 1], [40, 0])}px)`,
            opacity: interpolate(scheduleSlide, [0, 1], [0, 1]),
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: "600", color: "#7C2D12", margin: 0 }}>
              Today's Schedule | आज का कार्यक्रम
            </h2>
            <div
              style={{
                padding: "8 16",
                backgroundColor: "#FFF7ED",
                borderRadius: 20,
                border: "1px solid #FED7AA",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: "600", color: "#9A3412" }}>
                🍎 Partial Fast - Ekadashi
              </span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {todaySchedule.map((item, index) => {
              const isSkipped = item.status === "skipped";
              const isTaken = item.status === "taken";
              return (
                <div
                  key={item.time}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 16,
                    backgroundColor: isSkipped ? "#FEF2F2" : isTaken ? "#ECFDF5" : "#FFF7ED",
                    borderRadius: 12,
                    border: `1px solid ${isSkipped ? "#FECACA" : isTaken ? "#BBF7D0" : "#FED7AA"}`,
                    transform: `translateX(${interpolate(scheduleSlide, [0, 1], [40 * (index + 1), 0])}px)`,
                    opacity: interpolate(scheduleSlide, [0, 1], [0, 1]),
                    transition: `all 0.3s ease ${index * 80}ms`,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: isSkipped ? "#FEE2E2" : isTaken ? "#D1FAE5" : "#FEF3C7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      transform: `scale(${interpolate(pillAnimation, [0, 1], [0.8, 1])})`,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: 16, fontWeight: "600", color: "#7C2D12", margin: 0 }}>
                        {item.medicine}
                      </h3>
                      <span style={{ fontSize: 14, color: "#9A3412", fontWeight: "500" }}>
                        {item.time}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#78716C", marginTop: 4, fontStyle: "italic", margin: "4 0 0 0" }}>
                      {item.fastingNote}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: "6 14",
                      borderRadius: 20,
                      backgroundColor: isSkipped ? "#FEE2E2" : isTaken ? "#D1FAE5" : "#FEF3C7",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: isSkipped ? "#991B1B" : isTaken ? "#065F46" : "#9A3412",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fasting Rules */}
          <div
            style={{
              marginTop: 20,
              padding: 20,
              backgroundColor: "#FEF7ED",
              borderRadius: 12,
              border: "1px solid #FED7AA",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: "600", color: "#7C2D12", marginBottom: 12, margin: "0 0 12 0" }}>
              Fasting Rules for Elders | बुजुर्गों के लिए व्रत नियम
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#9A3412", lineHeight: 1.6 }}>
              <p style={{ margin: 0 }}>• Continue BP/heart medicines always (Amlodipine)</p>
              <p style={{ margin: 0 }}>• Skip diabetes meds on full fast days (Metformin)</p>
              <p style={{ margin: 0 }}>• Take statins with evening meal if eating (Atorvastatin)</p>
              <p style={{ margin: 0 }}>• Hydrate well - 2L water minimum</p>
              <p style={{ margin: 0 }}>• Break fast with light food: khichdi, dal-rice</p>
              <p style={{ margin: 0 }}>• Alert caregiver if dizziness/weakness</p>
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
          Smart medicine adjustments for religious fasts • Auto-skip & reschedule • Caregiver alerts
        </p>
      </div>
    </AbsoluteFill>
  );
};