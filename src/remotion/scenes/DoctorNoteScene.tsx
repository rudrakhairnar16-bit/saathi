import { useCurrentFrame, interpolate, spring } from "remotion";
import { AbsoluteFill } from "remotion";

interface DoctorNoteSceneProps {
  startFrame: number;
  totalDuration: number;
}

export const DoctorNoteScene: React.FC<DoctorNoteSceneProps> = ({ startFrame, totalDuration }) => {
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
  const typingAnimation = spring({
    fps: 30,
    frame: sceneFrame - 100,
    config: { damping: 20, stiffness: 100 },
  });

  const showScene = sceneFrame >= 0 && sceneFrame < duration;

  if (!showScene) {
    return null;
  }

  const doctorNotes = [
    {
      id: 1,
      doctor: "Dr. Priya Patel, MD",
      specialty: "Cardiology",
      date: "Nov 10, 2024",
      note: "Patient shows good BP control on current regimen. Continue Amlodipine 5mg daily. Monitor for ankle edema. Next follow-up in 3 months.",
      hindi: "रोगी का BP नियंत्रण में है। एम्लोडिपाइन 5mg जारी रखें। पैर में सूजन देखें। 3 महीने में फॉलो-अप।",
      priority: "routine",
    },
    {
      id: 2,
      doctor: "Dr. Rajesh Kumar, MD",
      specialty: "Endocrinology",
      date: "Nov 5, 2024",
      note: "HbA1c improved to 7.2%. Metformin 500mg BID effective. Consider adding GLP-1 if not at target in 3 months. Check renal function.",
      hindi: "HbA1c 7.2% सुधरा है। मेटफॉर्मिन 500mg दिन में दो बार असरदार है। किडनी फंक्शन जांचें।",
      priority: "follow-up",
    },
    {
      id: 3,
      doctor: "Dr. Anita Shah, MD",
      specialty: "Geriatrics",
      date: "Oct 28, 2024",
      note: "Vitamin D deficiency confirmed. Start Vitamin D3 2000 IU daily. Recheck levels in 8 weeks. Fall risk assessment recommended.",
      hindi: "विटामिन D की कमी। रोज 2000 IU D3 लें। 8 हफ्ते में जांचें। गिरने का खतरा जांचें।",
      priority: "new-prescription",
    },
  ];

  const priorityColors = {
    routine: { bg: "#ECFDF5", border: "#BBF7D0", text: "#065F46", label: "Routine" },
    "follow-up": { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412", label: "Follow-up" },
    "new-prescription": { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", label: "New Rx" },
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
          Doctor Notes | डॉक्टर के नोट्स
        </h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "6 12", backgroundColor: "#FEF3C7", borderRadius: 16, fontSize: 14, color: "#9A3412", fontWeight: "500" }}>
              All Notes
            </div>
            <div style={{ padding: "6 12", backgroundColor: "#7C2D12", borderRadius: 16, fontSize: 14, color: "white", fontWeight: "500" }}>
              Action Required
            </div>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 60,
          right: 60,
          bottom: 100,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          transform: `translateY(${interpolate(cardSlide, [0, 1], [60, 0])}px)`,
          opacity: interpolate(cardSlide, [0, 1], [0, 1]),
        }}
      >
        {doctorNotes.map((note, index) => {
          const colors = priorityColors[note.priority];
          return (
            <div
              key={note.id}
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 4px 20px rgba(124, 45, 18, 0.08)",
                border: `1px solid ${colors.border}`,
                transform: `translateX(${interpolate(cardSlide, [0, 1], [-50 * (index + 1), 0])}px)`,
                opacity: interpolate(cardSlide, [0, 1], [0, 1]),
                transition: `all 0.4s ease ${index * 150}ms`,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 20, fontWeight: "600", color: "#7C2D12", margin: 0 }}>
                      {note.doctor}
                    </h3>
                    <div
                      style={{
                        padding: "4 12",
                        backgroundColor: colors.bg,
                        borderRadius: 12,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
                        {note.specialty}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "#9A3412", margin: 0 }}>
                    {note.date}
                  </p>
                </div>
                <div
                  style={{
                    padding: "6 14",
                    backgroundColor: colors.bg,
                    borderRadius: 20,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                    {colors.label}
                  </span>
                </div>
              </div>

              {/* English Note */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <h4 style={{ fontSize: 16, fontWeight: "600", color: "#7C2D12", margin: 0 }}>Clinical Note</h4>
                  <div style={{ width: 40, height: 2, backgroundColor: "#FED7AA", borderRadius: 1 }} />
                </div>
                <p
                  style={{
                    fontSize: 16,
                    color: "#44403C",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    opacity: interpolate(typingAnimation, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(typingAnimation, [0, 1], [10, 0])}px)`,
                    margin: 0,
                  }}
                >
                  {note.note}
                </p>
              </div>

              {/* Hindi Translation */}
              <div
                style={{
                  backgroundColor: "#FFF7ED",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid #FED7AA",
                  opacity: interpolate(typingAnimation, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(typingAnimation, [0, 1], [10, 0])}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <h4 style={{ fontSize: 16, fontWeight: "600", color: "#7C2D12", margin: 0 }}>हिंदी अनुवाद</h4>
                  <div style={{ width: 40, height: 2, backgroundColor: "#FDBA74", borderRadius: 1 }} />
                </div>
                <p style={{ fontSize: 16, color: "#9A3412", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                  {note.hindi}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <div
                  style={{
                    padding: "10 20",
                    backgroundColor: "#7C2D12",
                    borderRadius: 10,
                    color: "white",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Add to Care Plan
                </div>
                <div
                  style={{
                    padding: "10 20",
                    backgroundColor: "white",
                    borderRadius: 10,
                    color: "#7C2D12",
                    fontWeight: "600",
                    fontSize: 14,
                    border: "1px solid #FED7AA",
                  }}
                >
                  Share with Family
                </div>
                <div
                  style={{
                    padding: "10 20",
                    backgroundColor: "white",
                    borderRadius: 10,
                    color: "#9A3412",
                    fontWeight: "600",
                    fontSize: 14,
                    border: "1px solid #FED7AA",
                  }}
                >
                  Set Reminder
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Note Button */}
        <div
          style={{
            padding: 32,
            backgroundColor: "white",
            borderRadius: 16,
            border: "2px dashed #FDBA74",
            textAlign: "center",
            transform: `translateY(${interpolate(cardSlide, [0, 1], [40, 0])}px)`,
            opacity: interpolate(cardSlide, [0, 1], [0, 1]),
          }}
        >
          <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>➕</span>
          <h3 style={{ fontSize: 20, fontWeight: "600", color: "#7C2D12", marginBottom: 8, margin: "0 0 8 0" }}>
            Add Doctor Note
          </h3>
          <p style={{ fontSize: 16, color: "#9A3412", margin: 0 }}>
            Scan prescription • Voice input • Manual entry
          </p>
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
          Bilingual clinical notes • Auto-translation • Care plan integration
        </p>
      </div>
    </AbsoluteFill>
  );
};