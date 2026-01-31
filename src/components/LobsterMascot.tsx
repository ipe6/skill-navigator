import { motion } from "framer-motion";

export function LobsterMascot({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        {/* Glow effect */}
        <defs>
          <radialGradient id="lobsterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(14, 100%, 50%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(14, 100%, 50%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(14, 100%, 55%)" />
            <stop offset="100%" stopColor="hsl(0, 85%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Background glow */}
        <circle cx="60" cy="60" r="55" fill="url(#lobsterGlow)" />
        
        {/* Body */}
        <ellipse cx="60" cy="65" rx="28" ry="32" fill="url(#bodyGradient)" />
        
        {/* Head */}
        <ellipse cx="60" cy="40" rx="22" ry="20" fill="url(#bodyGradient)" />
        
        {/* Eyes */}
        <circle cx="50" cy="38" r="8" fill="white" />
        <circle cx="70" cy="38" r="8" fill="white" />
        <circle cx="51" cy="39" r="4" fill="#1a1a2e" />
        <circle cx="71" cy="39" r="4" fill="#1a1a2e" />
        <circle cx="52" cy="38" r="1.5" fill="white" />
        <circle cx="72" cy="38" r="1.5" fill="white" />
        
        {/* Antennae */}
        <motion.path
          d="M45 25 Q40 10 35 5"
          stroke="hsl(14, 100%, 50%)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{ d: ["M45 25 Q40 10 35 5", "M45 25 Q38 12 33 7", "M45 25 Q40 10 35 5"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M75 25 Q80 10 85 5"
          stroke="hsl(14, 100%, 50%)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{ d: ["M75 25 Q80 10 85 5", "M75 25 Q82 12 87 7", "M75 25 Q80 10 85 5"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        
        {/* Claws */}
        <motion.g
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "25px 60px" }}
        >
          <ellipse cx="20" cy="55" rx="12" ry="8" fill="url(#bodyGradient)" />
          <path d="M8 55 L5 50 M8 55 L5 60" stroke="hsl(14, 100%, 50%)" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
        
        <motion.g
          animate={{ rotate: [0, -5, 0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          style={{ transformOrigin: "95px 60px" }}
        >
          <ellipse cx="100" cy="55" rx="12" ry="8" fill="url(#bodyGradient)" />
          <path d="M112 55 L115 50 M112 55 L115 60" stroke="hsl(14, 100%, 50%)" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
        
        {/* Smile */}
        <path
          d="M50 48 Q60 56 70 48"
          stroke="#1a1a2e"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Tail segments */}
        <ellipse cx="60" cy="88" rx="18" ry="8" fill="hsl(0, 85%, 42%)" />
        <ellipse cx="60" cy="98" rx="14" ry="6" fill="hsl(0, 85%, 40%)" />
        <ellipse cx="60" cy="106" rx="10" ry="4" fill="hsl(0, 85%, 38%)" />
      </svg>
    </motion.div>
  );
}
