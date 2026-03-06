export function MemphisShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Large mint circle - top left */}
      <div
        className="absolute rounded-full opacity-60"
        style={{
          width: 180,
          height: 180,
          top: -40,
          left: -40,
          background: "oklch(0.88 0.07 160)",
        }}
      />
      {/* Yellow rectangle - top right */}
      <div
        className="absolute opacity-50"
        style={{
          width: 90,
          height: 55,
          top: 60,
          right: 80,
          background: "oklch(0.93 0.12 90)",
          transform: "rotate(15deg)",
        }}
      />
      {/* Lilac triangle - mid left */}
      <svg
        className="absolute opacity-50"
        style={{ top: "30%", left: 20 }}
        width="80"
        height="70"
        viewBox="0 0 80 70"
      >
        <polygon points="40,0 80,70 0,70" fill="oklch(0.85 0.08 300)" />
      </svg>
      {/* Small black dots cluster */}
      <svg
        className="absolute opacity-70"
        style={{ top: "20%", right: "15%" }}
        width="60"
        height="60"
        viewBox="0 0 60 60"
      >
        <circle cx="10" cy="10" r="5" fill="oklch(0.12 0 0)" />
        <circle cx="30" cy="10" r="5" fill="oklch(0.12 0 0)" />
        <circle cx="50" cy="10" r="5" fill="oklch(0.12 0 0)" />
        <circle cx="10" cy="30" r="5" fill="oklch(0.12 0 0)" />
        <circle cx="30" cy="30" r="5" fill="oklch(0.12 0 0)" />
        <circle cx="50" cy="30" r="5" fill="oklch(0.12 0 0)" />
        <circle cx="10" cy="50" r="5" fill="oklch(0.12 0 0)" />
        <circle cx="30" cy="50" r="5" fill="oklch(0.12 0 0)" />
        <circle cx="50" cy="50" r="5" fill="oklch(0.12 0 0)" />
      </svg>
      {/* Mint small circle - bottom left */}
      <div
        className="absolute rounded-full opacity-50"
        style={{
          width: 80,
          height: 80,
          bottom: "20%",
          left: "8%",
          background: "oklch(0.88 0.07 160)",
        }}
      />
      {/* Lilac diamond - bottom right */}
      <svg
        className="absolute opacity-40"
        style={{ bottom: "15%", right: "10%" }}
        width="70"
        height="70"
        viewBox="0 0 70 70"
      >
        <polygon points="35,0 70,35 35,70 0,35" fill="oklch(0.85 0.08 300)" />
      </svg>
      {/* Yellow circle - mid right */}
      <div
        className="absolute rounded-full opacity-40"
        style={{
          width: 120,
          height: 120,
          top: "55%",
          right: -30,
          background: "oklch(0.93 0.12 90)",
        }}
      />
      {/* Black zigzag lines */}
      <svg
        className="absolute opacity-30"
        style={{ bottom: "35%", left: "40%" }}
        width="80"
        height="30"
        viewBox="0 0 80 30"
      >
        <polyline
          points="0,15 10,0 20,15 30,0 40,15 50,0 60,15 70,0 80,15"
          fill="none"
          stroke="oklch(0.12 0 0)"
          strokeWidth="3"
        />
      </svg>
      {/* Small black diamonds */}
      <svg
        className="absolute opacity-60"
        style={{ top: "45%", left: "25%" }}
        width="20"
        height="20"
        viewBox="0 0 20 20"
      >
        <polygon points="10,0 20,10 10,20 0,10" fill="oklch(0.12 0 0)" />
      </svg>
      <svg
        className="absolute opacity-60"
        style={{ top: "65%", right: "30%" }}
        width="16"
        height="16"
        viewBox="0 0 16 16"
      >
        <polygon points="8,0 16,8 8,16 0,8" fill="oklch(0.12 0 0)" />
      </svg>
      {/* Peach large circle - center bottom */}
      <div
        className="absolute rounded-full opacity-30"
        style={{
          width: 200,
          height: 200,
          bottom: -60,
          left: "35%",
          background: "oklch(0.88 0.09 35)",
        }}
      />
    </div>
  );
}
