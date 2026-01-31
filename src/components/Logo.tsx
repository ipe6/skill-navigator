interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/favicon.png" 
        alt="AgentForge" 
        className="w-6 h-6 lg:w-7 lg:h-7 rounded-sm"
      />
      {showText && (
        <span className="font-semibold text-sm lg:text-base tracking-tight text-foreground">
          AgentForge
        </span>
      )}
    </div>
  );
}
