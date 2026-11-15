import { useCurrentFrame, interpolate, spring } from "remotion";
import { AbsoluteFill } from "remotion";

interface CaregiverDashboardSceneProps {
  startFrame: number;
  totalDuration: number;
}

export const CaregiverDashboardScene: React.FC<CaregiverDashboardSceneProps> = ({ startFrame, totalDuration }) => {
  const frame = useCurrentFrame();
  const sceneFrame = frame - startFrame;
  const duration = 18 * 30; // 18 seconds at 30fps

  // Animations
  const headerSlide = spring({
    fps: 30,
    frame: sceneFrame,
    config: { damping: 20, stiffness: 150 },
  });
  const statsSlide = spring({
    fps: 30,
    frame: sceneFrame - 30,
    config: { damping: 18, stiffness: 120 },
  });
  const chartAnimation = spring({
    fps: 30,
    frame: sceneFrame - 80,
    config: { damping: 15, stiffness: 100 },
  });
  const listSlide = spring({
    fps: 30,
    frame: sceneFrame - 120,
    config: { damping: 18, stiffness: 120 },
  });

  const showScene = sceneFrame >= 0 && sceneFrame < duration;

  if (!showScene) {
    return null;
  }

  const adherenceData = [
    { day: "Mon", taken: 4, total: 4 },
    { day: "Tue", taken: 3, total: 4 },
    { day: "Wed", taken: 4, total: 4 },
    { day: "Thu", taken: 2, total: 4 },
    { day: "Fri", taken: 4, total: 4 },
    { day: "Sat", taken: 3, total: 4 },
    { day: "Sun", taken: 4, total: 4 },
  ];

  const recentActivity = [
    { time: "2 min ago", action: "Took Metformin 500mg", status: "taken", icon: "✅" },
    { time: "15 min ago", action: "Missed Atorvastatin 10mg", status: "missed", icon: "⚠️", reason: "Felt dizzy" },
    { time: "1 hour ago", action: "Took Amlodipine 5mg", status: "taken", icon: "✅" },
    { time: "3 hours ago", action: "Took Vitamin D3", status: "taken", icon: "✅" },
    { time: "Yesterday 8 PM", action: "Missed Metformin 500mg", status: "missed", icon: "⚠️", reason: "Forgot" },
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
          justifyContent: "space-between",
          paddingLeft: 40,
          paddingRight: 40,
          transform: `translateY(${interpolate(headerSlide, [0, 1], [-100, 0])}px)`,
          opacity: interpolate(headerSlide, [0, 1], [0, 1]),
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: "700", color: "#7C2D12", margin: 0 }}>
          Caregiver Dashboard | देखभाल डैशबोर्ड
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#ECFDF5", padding: "8 16", borderRadius: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#10B981" }} />
            <span style={{ fontSize: 16, color: "#065F46", fontWeight: "600" }}>Live</span>
          </div>
          <span style={{ fontSize: 16, color: "#9A3412" }}>Ramesh Sharma, 78</span>
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
        {/* Left Panel - Stats & Chart */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Stats Cards */}
          <div
            style={{
              display: "flex",
              gap: 20,
              transform: `translateY(${interpolate(statsSlide, [0, 1], [40, 0])}px)`,
              opacity: interpolate(statsSlide, [0, 1], [0, 1]),
            }}
          >
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
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: 16, color: "#9A3412", fontWeight: "500", marginBottom: 8, margin: "0 0 8 0" }}>
                Weekly Adherence
              </p>
              <h2 style={{ fontSize: 48, fontWeight: "700", color: "#7C2D12", margin: 0 }}>89%</h2>
              <p style={{ fontSize: 14, color: "#10B981", marginTop: 4, fontWeight: "600", margin: "4 0 0 0" }}>
                ↑ 5% from last week
              </p>
            </div>

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
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: 16, color: "#9A3412", fontWeight: "500", marginBottom: 8, margin: "0 0 8 0" }}>
                Doses This Week
              </p>
              <h2 style={{ fontSize: 48, fontWeight: "700", color: "#7C2D12", margin: 0 }}>24/28</h2>
              <p style={{ fontSize: 14, color: "#F59E0B", marginTop: 4, fontWeight: "600", margin: "4 0 0 0" }}>
                4 Missed
              </p>
            </div>

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
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: 16, color: "#9A3412", fontWeight: "500", marginBottom: 8, margin: "0 0 8 0" }}>
                Active Alerts
              </p>
              <h2 style={{ fontSize: 48, fontWeight: "700", color: "#DC2626", margin: 0 }}>2</h2>
              <p style={{ fontSize: 14, color: "#9A3412", marginTop: 4, fontWeight: "600", margin: "4 0 0 0" }}>
                Requires attention
              </p>
            </div>
          </div>

          {/* Adherence Chart */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(124, 45, 18, 0.08)",
              border: "1px solid #FED7AA",
              flex: 1,
              transform: `translateY(${interpolate(chartAnimation, [0, 1], [40, 0])}px)`,
              opacity: interpolate(chartAnimation, [0, 1], [0, 1]),
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: "600", color: "#7C2D12", marginBottom: 24, margin: "0 0 24 0" }}>
              7-Day Adherence Trend
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: 200,
                paddingTop: 20,
              }}
            >
              {adherenceData.map((day, index) => {
                const percentage = (day.taken / day.total) * 100;
                const barHeight = percentage * 1.6;
                return (
                  <div
                    key={day.day}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: `${interpolate(chartAnimation, [0, 1], [0, barHeight])}px`,
                        backgroundColor: percentage >= 75 ? "#10B981" : percentage >= 50 ? "#F59E0B" : "#EF4444",
                        borderRadius: "8 8 0 0",
                        transition: `height 0.5s ease-out ${index * 100}ms`,
                        minHeight: 4,
                      }}
                    />
                    <p style={{ fontSize: 14, fontWeight: "600", color: "#7C2D12", marginTop: 12, margin: "12 0 4 0" }}>
                      {day.day}
                    </p>
                    <p style={{ fontSize: 12, color: "#9A3412", margin: "4 0 0 0" }}>
                      {day.taken}/{day.total}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#10B981" }} />
                <span style={{ fontSize: 14, color: "#9A3412" }}>≥ 75% Good</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#F59E0B" }} />
                <span style={{ fontSize: 14, color: "#9A3412" }}>50-74% Fair</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "#EF4444" }} />
                <span style={{ fontSize: 14, color: "#9A3412" }}>{"< 50% Poor"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Activity Feed */}
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
            transform: `translateY(${interpolate(listSlide, [0, 1], [40, 0])}px)`,
            opacity: interpolate(listSlide, [0, 1], [0, 1]),
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: "600", color: "#7C2D12", marginBottom: 20, margin: "0 0 20 0" }}>
            Recent Activity
          </h2>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {recentActivity.map((activity, index) => (
              <div
                key={activity.time}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 16,
                  backgroundColor: activity.status === "taken" ? "#ECFDF5" : "#FEF2F2",
                  borderRadius: 12,
                  border: `1px solid ${activity.status === "taken" ? "#BBF7D0" : "#FECACA"}`,
                  transform: `translateX(${interpolate(listSlide, [0, 1], [-30 * (index + 1), 0])}px)`,
                  opacity: interpolate(listSlide, [0, 1], [0, 1]),
                  transition: `all 0.3s ease ${index * 100}ms`,
                }}
              >
                <span style={{ fontSize: 24, marginTop: 4 }}>{activity.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: 16, fontWeight: "600", color: "#7C2D12", margin: 0 }}>
                      {activity.action}
                    </h3>
                    <span style={{ fontSize: 12, color: "#9A3412" }}>
                      {activity.time}
                    </span>
                  </div>
                  {activity.reason && (
                    <p style={{ fontSize: 13, color: "#F59E0B", marginTop: 4, fontStyle: "italic", margin: "4 0 0 0" }}>
                      Reason: {activity.reason}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    padding: "4 10",
                    borderRadius: 12,
                    backgroundColor: activity.status === "taken" ? "#D1FAE5" : "#FEE2E2",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: activity.status === "taken" ? "#065F46" : "#991B1B",
                      textTransform: "uppercase",
                    }}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <div
              style={{
                flex: 1,
                padding: "14 24",
                backgroundColor: "#7C2D12",
                borderRadius: 12,
                textAlign: "center",
                color: "white",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Call Elder
            </div>
            <div
              style={{
                flex: 1,
                padding: "14 24",
                backgroundColor: "#FEF3C7",
                borderRadius: 12,
                textAlign: "center",
                color: "#9A3412",
                fontWeight: "600",
                fontSize: 16,
                border: "1px solid #FED7AA",
              }}
            >
              Send Reminder
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
          Real-time monitoring • Instant alerts • One-tap communication
        </p>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </AbsoluteFill>
  );
};