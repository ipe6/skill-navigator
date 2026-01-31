interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center">
        {/* Abstract geometric logo mark */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer hexagon shape */}
          <path
            d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
            stroke="hsl(24, 100%, 50%)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Inner connection lines */}
          <path
            d="M16 9L22 12.5V19.5L16 23L10 19.5V12.5L16 9Z"
            fill="hsl(24, 100%, 50%)"
            opacity="0.9"
          />
          {/* Center dot */}
          <circle cx="16" cy="16" r="2" fill="hsl(0, 0%, 4%)" />
        </svg>
      </div>
      {showText && (
        <span className="font-semibold text-sm lg:text-base tracking-tight text-foreground">
          AgentForge
        </span>
      )}
    </div>
  );
}
