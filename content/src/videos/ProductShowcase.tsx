import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BRAND_PURPLE = "#5E33D9";

type Props = {
  title: string;
  subtitle: string;
};

export const ProductShowcase: React.FC<Props> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerY = interpolate(frame, [0, 30], [-100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const footerOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#0A0A0F",
        fontFamily: "sans-serif",
        padding: 60,
        flexDirection: "column",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {/* Header */}
      <div style={{ transform: `translateY(${headerY}px)` }}>
        <p style={{ color: BRAND_PURPLE, fontSize: 28, margin: 0, fontWeight: 700 }}>
          {subtitle}
        </p>
        <h1
          style={{
            color: "#FFFFFF",
            fontSize: 80,
            fontWeight: 900,
            margin: "8px 0 0",
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Feature cards */}
      <div
        style={{
          transform: `scale(${cardScale})`,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {[
          { icon: "📐", label: "Upload STL/3MF Files" },
          { icon: "⚡", label: "Instant Price Calculator" },
          { icon: "🚀", label: "Fast Turnaround" },
        ].map(({ icon, label }) => (
          <div
            key={label}
            style={{
              background: "rgba(94,51,217,0.15)",
              border: `2px solid ${BRAND_PURPLE}`,
              borderRadius: 20,
              padding: "28px 40px",
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <span style={{ fontSize: 52 }}>{icon}</span>
            <span style={{ color: "#FFFFFF", fontSize: 38, fontWeight: 600 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ opacity: footerOpacity }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 28, margin: 0 }}>
          fill-3d.com
        </p>
      </div>
    </AbsoluteFill>
  );
};
