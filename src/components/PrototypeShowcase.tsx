import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ExternalLink, MoreHorizontal, Trash2, Video, Play, MessageCircle, Plus, Compass, UserPlus, ShoppingBag, Zap, Settings, Headphones } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Comment } from "./FullPagePrototypeViewer";
import PrototypeReactions, { PrototypeReactions as ReactionsType, ReactionType } from "./PrototypeReactions";

export interface ShowcasePrototype {
  id: string;
  title: string;
  link: string;
  thumbnail?: string;
  author?: string;
  fileKey?: string;
  embedUrl?: string;
  videoLink?: string;
  problemSummary?: string;
  experience?: "discover" | "onboard" | "shop" | "core-os" | "applications" | "growth" | "support";
  reactions?: ReactionsType;
  persona?: string;
}

interface PrototypeShowcaseProps {
  prototype: ShowcasePrototype;
  onDelete: (id: string) => void;
  onView: (prototype: ShowcasePrototype) => void;
  comments?: Comment[];
  onUpdateVideoLink?: (id: string, videoLink: string) => void;
  onReact?: (id: string, reactionType: ReactionType) => void;
}

const getExperienceIcon = (experience?: string) => {
  switch (experience) {
    case "discover": return <Compass className="h-3 w-3" />;
    case "onboard": return <UserPlus className="h-3 w-3" />;
    case "shop": return <ShoppingBag className="h-3 w-3" />;
    case "core": return <Zap className="h-3 w-3" />;
    case "specialist": return <Settings className="h-3 w-3" />;
    case "support": return <Headphones className="h-3 w-3" />;
    default: return null;
  }
};

const getExperienceLabel = (experience?: string) => {
  switch (experience) {
    case "discover": return "Discover";
    case "onboard": return "Onboard";
    case "shop": return "Shop";
    case "core": return "Core";
    case "specialist": return "Specialist";
    case "support": return "Support";
    default: return null;
  }
};

export default function PrototypeShowcase({ 
  prototype, 
  onDelete, 
  onView, 
  comments = [], 
  onUpdateVideoLink,
  onReact 
}: PrototypeShowcaseProps) {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoLinkInput, setVideoLinkInput] = useState(prototype.videoLink || "");

  const mostRecentComment = comments.length > 0 
    ? comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;
  const handleCardClick = () => {
    onView(prototype);
  };

  const handleVideoLinkSave = () => {
    if (onUpdateVideoLink) {
      onUpdateVideoLink(prototype.id, videoLinkInput);
    }
    setIsVideoDialogOpen(false);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prototype.videoLink) {
      window.open(prototype.videoLink, '_blank');
    }
  };

  const handleReact = (reactionType: ReactionType) => {
    if (onReact) {
      onReact(prototype.id, reactionType);
    }
  };

  const getFallbackThumbnail = () => {
    // Generate a simple gradient background based on title
    const colors = ['from-blue-400 to-purple-500', 'from-green-400 to-blue-500', 'from-pink-400 to-red-500', 'from-yellow-400 to-orange-500'];
    const colorIndex = prototype.title.length % colors.length;
    return colors[colorIndex];
  };

  return (
    <Card className="group border-[#3e3e3e] bg-[#2c2c2c] overflow-hidden relative">
      <motion.div
        whileHover={{ 
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          scale: 1.02,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full"
      >
        <CardContent className="p-0">
        <div className="relative cursor-pointer" onClick={handleCardClick}>
          <div className="aspect-video overflow-hidden bg-[#1e1e1e]">
            {prototype.thumbnail ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full"
              >
                <ImageWithFallback
                  src={prototype.thumbnail}
                  alt={prototype.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getFallbackThumbnail()} flex items-center justify-center`}>
                <div className="text-white text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 rounded-lg bg-white/20 flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium px-2">{prototype.title}</p>
                </div>
              </div>
            )}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2"
          >
            {prototype.videoLink && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-black/60 hover:bg-black/80 text-white border border-white/20"
                  onClick={handleVideoClick}
                >
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </motion.div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-black/60 hover:bg-black/80 text-white border border-white/20"
                  >
                    <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#2c2c2c] border-[#3e3e3e]">
                <DropdownMenuItem onClick={() => window.open(prototype.link, '_blank')} className="text-white hover:bg-[#3e3e3e]">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </DropdownMenuItem>
                <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-white hover:bg-[#3e3e3e]">
                      <Video className="h-4 w-4 mr-2" />
                      {prototype.videoLink ? 'Edit Video' : 'Add Video'}
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent onClick={(e) => e.stopPropagation()} className="bg-[#2c2c2c] border-[#3e3e3e] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-white text-sm sm:text-base">
                        {prototype.videoLink ? 'Edit Video Link' : 'Add Video Link'}
                      </DialogTitle>
                      <DialogDescription className="text-white/70 text-xs sm:text-sm">
                        Add a video link to help explain this prototype to your team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Paste video URL (YouTube, Loom, etc.)"
                        value={videoLinkInput}
                        onChange={(e) => setVideoLinkInput(e.target.value)}
                        className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50 text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsVideoDialogOpen(false)}
                          className="border-[#3e3e3e] text-white/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleVideoLinkSave} className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm">
                          Save Video Link
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(prototype.id);
                  }}
                  className="text-red-400 focus:text-red-400 hover:bg-[#3e3e3e]"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-3 sm:p-4"
        >
          {/* Experience Badge */}
          {prototype.experience && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mb-2 cursor-pointer" 
              onClick={handleCardClick}
            >
              <Badge variant="secondary" className="bg-[#3e3e3e] text-white/80 text-xs border-none">
                {getExperienceIcon(prototype.experience)}
                <span className="ml-1">{getExperienceLabel(prototype.experience)}</span>
              </Badge>
            </motion.div>
          )}
          
          <motion.h3 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="font-medium mb-2 line-clamp-2 text-white text-sm sm:text-base cursor-pointer" 
            onClick={handleCardClick}
          >
            {prototype.title}
          </motion.h3>
          
          {prototype.problemSummary && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="text-xs sm:text-sm text-white/70 mb-3 line-clamp-2 cursor-pointer" 
              onClick={handleCardClick}
            >
              {prototype.problemSummary}
            </motion.p>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={handleCardClick}>
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                <AvatarFallback className="text-xs bg-[#3e3e3e] text-white/70">
                  {prototype.author ? prototype.author.charAt(0) : 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm text-white/60 truncate">
                  {prototype.author || 'Team'}
                </span>
                {prototype.persona && (
                  <span className="text-xs text-white/40 truncate">
                    for {prototype.persona}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {prototype.videoLink && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleVideoClick}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Video className="h-3 w-3" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCardClick}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Reactions */}
          <div className="flex justify-between items-center mb-2">
            <PrototypeReactions
              reactions={prototype.reactions || {
                heart: { type: "heart", count: 0, userReacted: false },
                like: { type: "like", count: 0, userReacted: false },
                idea: { type: "idea", count: 0, userReacted: false },
              }}
              onReact={handleReact}
            />
          </div>

          {mostRecentComment && (
            <div className="border-t border-[#3e3e3e] pt-2 sm:pt-3 mt-2 sm:mt-3 cursor-pointer" onClick={handleCardClick}>
              <div className="flex items-start gap-2">
                <MessageCircle className="h-3 w-3 text-white/50 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-white/70 truncate">
                      {mostRecentComment.author}
                    </span>
                    <span className="text-xs text-white/50 flex-shrink-0">
                      {new Date(mostRecentComment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/60 line-clamp-2">
                    {mostRecentComment.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        </CardContent>
      </motion.div>
    </Card>
  );
}