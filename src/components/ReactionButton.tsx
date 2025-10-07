import { Button } from "./ui/button";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

export interface ReactionButtonProps {
  id: string;
  icon: LucideIcon;
  icon3D: LucideIcon;
  count: number;
  userReacted: boolean;
  size?: "sm" | "lg";
  selectedColor?: string;
  selectedBgColor?: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export default function ReactionButton({
  id,
  icon: Icon,
  icon3D: Icon3D,
  count,
  userReacted,
  size = "lg",
  selectedColor = "text-red-400",
  selectedBgColor = "bg-red-500/20",
  onClick,
  className = ""
}: ReactionButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size === "lg" ? "default" : "sm"}
      onClick={onClick}
      className={`${size === "lg" ? "h-10 px-4 gap-2" : "h-7 px-2 gap-1"} transition-all border ${
        userReacted
          ? `${selectedColor} ${selectedBgColor} border-white/20 shadow-lg`
          : "text-white/60 hover:text-white hover:bg-white/10 border-transparent"
      } ${className}`}
      style={userReacted ? {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
      } : {}}
    >
      <motion.div
        key={`${id}-${userReacted}`}
        initial={false}
        animate={
          userReacted 
            ? { 
                scale: [1, 1.3, 0.9, 1.1, 1],
                rotate: [0, -5, 5, -3, 0]
              } 
            : { scale: 1, rotate: 0 }
        }
        transition={{ 
          duration: 0.6,
          ease: "easeOut",
          times: [0, 0.2, 0.4, 0.7, 1]
        }}
      >
        {userReacted ? (
          <Icon3D className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
        ) : (
          <Icon className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
        )}
      </motion.div>
      <span className={size === "lg" ? "text-sm" : "text-xs"}>{count}</span>
    </Button>
  );
}