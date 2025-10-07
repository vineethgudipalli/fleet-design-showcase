import { useState } from "react";
import { Button } from "./ui/button";
import { Heart, ThumbsUp, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactionButton from "./ReactionButton";

export type ReactionType = "heart" | "like" | "idea";

export interface Reaction {
  type: ReactionType;
  count: number;
  userReacted: boolean;
}

export interface PrototypeReactions {
  [key: string]: Reaction;
}

interface PrototypeReactionsProps {
  reactions: PrototypeReactions;
  onReact: (type: ReactionType) => void;
  className?: string;
  size?: "sm" | "lg";
}

// Custom 3D Icons for selected states
const Heart3D = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff6b9d" />
        <stop offset="30%" stopColor="#ff8cc8" />
        <stop offset="70%" stopColor="#ff4081" />
        <stop offset="100%" stopColor="#e91e63" />
      </linearGradient>
      <linearGradient id="heartShine" x1="0%" y1="0%" x2="50%" y2="50%">
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
      </linearGradient>
    </defs>
    <path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      fill="url(#heartGradient)"
      stroke="#c2185b"
      strokeWidth="0.5"
    />
    <path 
      d="M8.5 6.5c1.5-1.5 3.5-1 4.5 0l-1 1c-0.5-0.5-1.5-0.8-2.5 0.2z" 
      fill="url(#heartShine)"
    />
  </svg>
);

const ThumbsUp3D = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="thumbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64b5f6" />
        <stop offset="30%" stopColor="#42a5f5" />
        <stop offset="70%" stopColor="#2196f3" />
        <stop offset="100%" stopColor="#1565c0" />
      </linearGradient>
      <linearGradient id="cuffGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#f8f9fa" />
        <stop offset="100%" stopColor="#e9ecef" />
      </linearGradient>
      <linearGradient id="thumbShine" x1="0%" y1="0%" x2="50%" y2="50%">
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
      </linearGradient>
    </defs>
    {/* Thumb pointing up */}
    <path 
      d="M10.5 2c1.1 0 2 .9 2 2v4h3c1.1 0 2 .9 2 2s-.9 2-2 2h-3v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2z" 
      fill="url(#thumbGradient)"
      stroke="#1565c0"
      strokeWidth="0.5"
    />
    {/* Four fingers folded */}
    <path 
      d="M6 12c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2V12H6z" 
      fill="url(#thumbGradient)"
      stroke="#1565c0"
      strokeWidth="0.5"
    />
    {/* White shirt cuff */}
    <rect 
      x="5" 
      y="19" 
      width="8" 
      height="3" 
      rx="1.5"
      fill="url(#cuffGradient)"
      stroke="#dee2e6"
      strokeWidth="0.5"
    />
    {/* Shine on thumb */}
    <ellipse 
      cx="9.5" 
      cy="5" 
      rx="0.8" 
      ry="1.5"
      fill="url(#thumbShine)"
    />
  </svg>
);

const Lightbulb3D = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <radialGradient id="bulbGradient" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fff59d" />
        <stop offset="50%" stopColor="#ffeb3b" />
        <stop offset="100%" stopColor="#f57f17" />
      </radialGradient>
      <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff8a50" />
        <stop offset="100%" stopColor="#ff5722" />
      </linearGradient>
    </defs>
    {/* Bulb */}
    <path 
      d="M9 21h6v-1a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1zm3-19a7 7 0 0 1 7 7c0 2.8-1.6 5.2-4 6.3V17h-6v-1.7C6.6 14.2 5 11.8 5 9a7 7 0 0 1 7-7z" 
      fill="url(#bulbGradient)"
      stroke="#f57f17"
      strokeWidth="0.5"
    />
    {/* Base */}
    <rect 
      x="9" 
      y="17" 
      width="6" 
      height="2" 
      rx="0.5"
      fill="url(#baseGradient)"
      stroke="#d84315"
      strokeWidth="0.5"
    />
    {/* Shine */}
    <ellipse 
      cx="10.5" 
      cy="7" 
      rx="1.5" 
      ry="2" 
      fill="rgba(255, 255, 255, 0.4)"
    />
  </svg>
);

const reactionConfig = {
  heart: {
    icon: Heart,
    icon3D: Heart3D,
    label: "Heart",
    color: "text-red-500",
    selectedColor: "text-pink-500",
    hoverColor: "hover:text-red-400",
    bgColor: "bg-red-500/10",
    selectedBgColor: "bg-gradient-to-br from-pink-500/20 to-red-500/20",
    hoverBgColor: "hover:bg-red-500/20",
  },
  like: {
    icon: ThumbsUp,
    icon3D: ThumbsUp3D,
    label: "Like",
    color: "text-blue-500",
    selectedColor: "text-blue-600",
    hoverColor: "hover:text-blue-400",
    bgColor: "bg-blue-500/10",
    selectedBgColor: "bg-gradient-to-br from-blue-400/20 to-blue-600/20",
    hoverBgColor: "hover:bg-blue-500/20",
  },
  idea: {
    icon: Lightbulb,
    icon3D: Lightbulb3D,
    label: "Idea",
    color: "text-yellow-500",
    selectedColor: "text-yellow-400",
    hoverColor: "hover:text-yellow-400",
    bgColor: "bg-yellow-500/10",
    selectedBgColor: "bg-gradient-to-br from-yellow-300/20 to-orange-500/20",
    hoverBgColor: "hover:bg-yellow-500/20",
  },
};

export default function PrototypeReactions({ 
  reactions, 
  onReact, 
  className = "",
  size = "sm"
}: PrototypeReactionsProps) {
  const handleReactionClick = (type: ReactionType, e: React.MouseEvent) => {
    e.stopPropagation();
    onReact(type);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* All reaction buttons always visible */}
      {Object.entries(reactionConfig).map(([type, config]) => {
        const reaction = reactions[type as ReactionType];
        const Icon = config.icon;
        
        return (
          <motion.div
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ReactionButton
              id={type}
              icon={Icon}
              icon3D={config.icon3D}
              count={reaction.count}
              userReacted={reaction.userReacted}
              size={size}
              selectedColor={config.selectedColor}
              selectedBgColor={config.selectedBgColor}
              onClick={(e) => handleReactionClick(type as ReactionType, e)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}