"use client"

export function AIRobot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      {/* 身体 */}
      <rect x="30" y="45" width="60" height="55" rx="12" fill="currentColor" className="text-primary" />
      
      {/* 头部 */}
      <rect x="25" y="15" width="70" height="45" rx="16" fill="currentColor" className="text-primary" />
      
      {/* 天线 */}
      <circle cx="60" cy="8" r="6" fill="currentColor" className="text-accent" />
      <rect x="58" y="8" width="4" height="12" fill="currentColor" className="text-accent" />
      
      {/* 眼睛 */}
      <circle cx="45" cy="35" r="8" fill="white" />
      <circle cx="75" cy="35" r="8" fill="white" />
      <circle cx="47" cy="35" r="4" fill="currentColor" className="text-foreground" />
      <circle cx="77" cy="35" r="4" fill="currentColor" className="text-foreground" />
      
      {/* 嘴巴 */}
      <path d="M50 48 Q60 55 70 48" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      
      {/* 按钮 */}
      <circle cx="50" cy="72" r="5" fill="currentColor" className="text-accent" />
      <circle cx="70" cy="72" r="5" fill="currentColor" className="text-chart-3" />
      
      {/* 手臂 */}
      <rect x="15" y="55" width="12" height="30" rx="6" fill="currentColor" className="text-primary" />
      <rect x="93" y="55" width="12" height="30" rx="6" fill="currentColor" className="text-primary" />
      
      {/* 脚 */}
      <rect x="38" y="100" width="16" height="12" rx="4" fill="currentColor" className="text-primary" />
      <rect x="66" y="100" width="16" height="12" rx="4" fill="currentColor" className="text-primary" />
    </svg>
  )
}

export function BookIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none">
      {/* 书本主体 */}
      <path d="M10 15 L40 8 L70 15 L70 65 L40 72 L10 65 Z" fill="currentColor" className="text-chart-3" />
      {/* 书脊 */}
      <path d="M40 8 L40 72" stroke="currentColor" className="text-foreground/20" strokeWidth="2" />
      {/* 页面线条 */}
      <path d="M15 25 L35 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 35 L35 32" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 45 L35 42" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M45 22 L65 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M45 32 L65 35" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M45 42 L65 45" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* 书签 */}
      <path d="M55 8 L55 25 L60 20 L65 25 L65 8" fill="currentColor" className="text-destructive" />
    </svg>
  )
}

export function WordBubble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" className={className} fill="none">
      <rect x="5" y="5" width="70" height="40" rx="12" fill="currentColor" className="text-accent" />
      <polygon points="20,45 35,45 25,58" fill="currentColor" className="text-accent" />
      <text x="40" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">ABC</text>
    </svg>
  )
}

export function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
    </svg>
  )
}

export function ConnectionLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 50" className={className} fill="none">
      <path 
        d="M0 25 Q50 0 100 25 T200 25" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round"
        strokeDasharray="8 8"
        className="text-primary"
      />
      <circle cx="0" cy="25" r="6" fill="currentColor" className="text-accent" />
      <circle cx="200" cy="25" r="6" fill="currentColor" className="text-chart-3" />
    </svg>
  )
}

export function MagicWand({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none">
      <rect x="35" y="5" width="8" height="45" rx="2" transform="rotate(45 35 5)" fill="currentColor" className="text-chart-3" />
      <polygon points="5,5 10,15 0,15" fill="currentColor" transform="rotate(45 5 10)" className="text-primary" />
      {/* 星星 */}
      <circle cx="15" cy="10" r="2" fill="currentColor" className="text-accent animate-sparkle" />
      <circle cx="8" cy="20" r="1.5" fill="currentColor" className="text-primary animate-sparkle delay-200" />
      <circle cx="20" cy="18" r="1.5" fill="currentColor" className="text-chart-3 animate-sparkle delay-400" />
    </svg>
  )
}
