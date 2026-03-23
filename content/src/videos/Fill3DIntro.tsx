import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BRAND_PURPLE = "#5E33D9";
const BRAND_LIGHT = "#F4F0FF";

export const Fill3DIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const textOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [30, 60], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BRAND_PURPLE} 0%, #3a1fa8 100%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            background: BRAND_LIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontSize: 60, color: BRAND_PURPLE, fontWeight: 900 }}>
            F
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{ opacity: textOpacity, textAlign: "center" }}>
        <h1
          style={{
            color: BRAND_LIGHT,
            fontSize: 72,
            fontWeight: 900,
            margin: 0,
            letterSpacing: -2,
          }}
        >
          Fill-3D
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 28,
            margin: "12px 0 0",
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          Professional 3D Print Services
        </p>
      </div>
    </AbsoluteFill>
  );
};
