import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  ArrowRight,
  MessageCircle, 
  Send, 
  ExternalLink, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  MoreHorizontal
} from "lucide-react";
import PrototypeReactions, { PrototypeReactions as ReactionsType, ReactionType } from "./PrototypeReactions";

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  x?: number;
  y?: number;
}

export interface PrototypeData {
  id: string;
  title: string;
  embedUrl: string;
  fileKey?: string;
  comments: Comment[];
  videoLink?: string;
  problemSummary?: string;
  author?: string;
  reactions?: ReactionsType;
}

interface PrototypePageProps {
  prototype: PrototypeData;
  onBack: () => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onReact?: (reactionType: ReactionType) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export default function PrototypePage({ 
  prototype, 
  onBack, 
  onAddComment,
  onReact,
  onNavigatePrev,
  onNavigateNext,
  currentIndex,
  totalCount
}: PrototypePageProps) {
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{x: number, y: number} | null>(null);
  
  // Video overlay state
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  useEffect(() => {
    // Show video overlay automatically if there's a video link and problem summary
    if (prototype?.videoLink && prototype?.problemSummary) {
      setShowVideoOverlay(true);
    }
  }, [prototype]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    onAddComment({
      author: "You",
      content: newComment.trim(),
      x: commentPosition?.x,
      y: commentPosition?.y
    });
    
    setNewComment("");
    setCommentPosition(null);
  };

  const handleFrameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCommentPosition({ x, y });
    }
  };

  const openInFigma = () => {
    if (prototype.fileKey) {
      window.open(`https://www.figma.com/file/${prototype.fileKey}`, '_blank');
    }
  };

  const extractVideoId = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }
    if (url.includes('loom.com')) {
      const match = url.match(/loom\.com\/share\/([^&\n?#]+)/);
      return match ? `https://www.loom.com/embed/${match[1]}` : null;
    }
    return url;
  };

  const getEmbedUrl = (url: string) => {
    const embedUrl = extractVideoId(url);
    if (embedUrl?.includes('youtube.com/embed')) {
      return `${embedUrl}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1`;
    }
    if (embedUrl?.includes('loom.com/embed')) {
      return `${embedUrl}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`;
    }
    return embedUrl;
  };

  return (
    <div className="h-screen bg-[#1e1e1e] flex flex-col overflow-hidden">
      {/* Minimal top toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-14 bg-[#1e1e1e] border-b border-[#3e3e3e]/50 flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-white/60 hover:text-white hover:bg-white/5 h-9 px-3"
          title="Back to gallery (Esc)"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
        
        <div className="flex items-center gap-2">
          {/* Reactions - Desktop only */}
          {onReact && (
            <div className="hidden lg:block">
              <PrototypeReactions
                reactions={prototype.reactions || {
                  heart: { type: "heart", count: 0, userReacted: false },
                  like: { type: "like", count: 0, userReacted: false },
                  idea: { type: "idea", count: 0, userReacted: false },
                }}
                onReact={onReact}
              />
            </div>
          )}

          {/* Action buttons */}
          {prototype.videoLink && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowVideoOverlay(!showVideoOverlay)}
              className="text-white/60 hover:text-white hover:bg-white/5 h-9 px-3"
            >
              <Play className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Video</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={openInFigma}
            className="text-white/60 hover:text-white hover:bg-white/5 h-9 px-3"
          >
            <ExternalLink className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Open in Figma</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-white/60 hover:text-white hover:bg-white/5 h-9 px-3 relative"
          >
            <MessageCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Comments</span>
            {prototype.comments.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {prototype.comments.length}
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Main content area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden relative"
      >
        {/* Header section with title and problem card */}
        <div className="flex-shrink-0 bg-[#1e1e1e] border-b border-[#3e3e3e]/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
            {/* Title and author */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-2">
                {prototype.title}
              </h1>
              <div className="flex items-center gap-3 text-white/50">
                {prototype.author && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-[#3e3e3e] text-white/70">
                        {prototype.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{prototype.author}</span>
                  </div>
                )}
                {currentIndex && totalCount && (
                  <>
                    <span>•</span>
                    <span className="text-sm">{currentIndex} of {totalCount}</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Problem statement card */}
            {prototype.problemSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-[#2c2c2c]/95 backdrop-blur-sm border-[#3e3e3e] shadow-xl">
                  <CardContent className="p-4 sm:p-5">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">Problem Statement</h3>
                        <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                          {prototype.problemSummary}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#3e3e3e]">
                        {(prototype as any).experience && (
                          <Badge variant="secondary" className="bg-[#3e3e3e] text-white/80 text-xs">
                            Experience: {(prototype as any).experience}
                          </Badge>
                        )}
                        {(prototype as any).persona && (
                          <Badge variant="secondary" className="bg-[#3e3e3e] text-white/80 text-xs">
                            Persona: {(prototype as any).persona}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Prototype iframe container */}
        <div 
          className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative" 
          onClick={handleFrameClick}
        >
          <div className="w-full h-full max-w-6xl max-h-full bg-white rounded-lg shadow-2xl overflow-hidden relative">
            <iframe
              src={prototype.embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              title={prototype.title}
            />
            
            {/* Comment markers - Hidden on mobile for better UX */}
            <div className="hidden sm:block">
              {prototype.comments.map((comment) => (
                comment.x !== undefined && comment.y !== undefined && (
                  <div
                    key={comment.id}
                    className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform z-10 shadow-lg"
                    style={{ left: comment.x, top: comment.y }}
                    title={`${comment.author}: ${comment.content}`}
                  >
                    {prototype.comments.indexOf(comment) + 1}
                  </div>
                )
              ))}
              
              {/* New comment position indicator */}
              {commentPosition && (
                <div
                  className="absolute w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse z-10 shadow-lg"
                  style={{ left: commentPosition.x, top: commentPosition.y }}
                >
                  +
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side navigation buttons */}
        {onNavigatePrev && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
          >
            <Button
              variant="ghost"
              size="lg"
              onClick={onNavigatePrev}
              className="h-16 w-16 rounded-full bg-[#2c2c2c]/80 backdrop-blur-sm border border-[#3e3e3e] text-white/90 hover:text-white hover:bg-[#3e3e3e]/80 shadow-xl"
              title="Previous prototype (←)"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </motion.div>
        )}

        {onNavigateNext && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
          >
            <Button
              variant="ghost"
              size="lg"
              onClick={onNavigateNext}
              className="h-16 w-16 rounded-full bg-[#2c2c2c]/80 backdrop-blur-sm border border-[#3e3e3e] text-white/90 hover:text-white hover:bg-[#3e3e3e]/80 shadow-xl"
              title="Next prototype (→)"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </motion.div>
        )}

        {/* Video overlay - responsive positioning */}
        <AnimatePresence>
          {showVideoOverlay && prototype.videoLink && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`absolute z-50 bg-black rounded-lg overflow-hidden shadow-2xl border border-white/20 ${
                isVideoExpanded 
                  ? 'bottom-2 right-2 left-2 top-20 sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto sm:w-[480px] sm:h-80' 
                  : 'bottom-2 right-2 w-full h-48 sm:bottom-8 sm:right-8 sm:w-72 sm:h-48 sm:left-auto'
              }`}
            >
            <iframe
              src={getEmbedUrl(prototype.videoLink)}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Design explanation video"
            />
            
            {/* Video controls overlay */}
            <div className="absolute top-2 right-2 flex gap-1">
              <Button 
                size="sm" 
                variant="secondary"
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-black/60 hover:bg-black/80 border-white/20"
                onClick={() => setIsVideoExpanded(!isVideoExpanded)}
              >
                {isVideoExpanded ? (
                  <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                ) : (
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                )}
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-black/60 hover:bg-black/80 border-white/20"
                onClick={() => setShowVideoOverlay(false)}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </Button>
            </div>

            {/* Video title overlay */}
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-xs sm:text-sm text-white/90 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                Design explanation
              </p>
            </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Comments sidebar - responsive */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-full sm:w-80 h-full bg-[#2c2c2c] border-l border-[#3e3e3e] flex flex-col z-40"
            >
            <div className="p-3 sm:p-4 border-b border-[#3e3e3e] flex-shrink-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-white font-medium text-sm sm:text-base">Comments</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowComments(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* New comment form */}
              <div className="space-y-3">
                <div className="text-xs text-white/60 mb-2">
                  💡 Provide constructive feedback to help improve this design
                </div>
                <Textarea
                  placeholder={commentPosition 
                    ? "What works well here? What could be improved? Any usability concerns?" 
                    : "Share your thoughts: What's working? What could be improved? Any suggestions?"
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50 text-sm"
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  {commentPosition && (
                    <span className="text-xs text-white/50 order-2 sm:order-1">
                      Position: {Math.round(commentPosition.x)}, {Math.round(commentPosition.y)}
                    </span>
                  )}
                  <div className="flex gap-2 order-1 sm:order-2 sm:ml-auto">
                    {commentPosition && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCommentPosition(null)}
                        className="border-[#3e3e3e] text-white/70 hover:text-white hover:bg-white/10 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {prototype.comments.length === 0 ? (
                <div className="text-center text-white/50 py-6 sm:py-8">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No feedback yet</p>
                  <p className="text-xs">Click on the prototype to add targeted feedback</p>
                  <p className="text-xs mt-1">or add general comments below</p>
                </div>
              ) : (
                prototype.comments.map((comment) => (
                  <Card key={comment.id} className="bg-[#1e1e1e] border-[#3e3e3e]">
                    <CardHeader className="pb-2 p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                          <AvatarFallback className="text-xs bg-[#3e3e3e] text-white/70">
                            {comment.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs sm:text-sm text-white">{comment.author}</span>
                        <span className="text-xs text-white/50">
                          {comment.timestamp}
                        </span>
                        {comment.x !== undefined && comment.y !== undefined && (
                          <Badge variant="secondary" className="text-xs ml-auto bg-blue-500 text-white hidden sm:inline-flex">
                            #{prototype.comments.indexOf(comment) + 1}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-3">
                      <p className="text-xs sm:text-sm text-white/90">{comment.content}</p>
                      {comment.x !== undefined && comment.y !== undefined && (
                        <p className="text-xs text-white/50 mt-1 hidden sm:block">
                          Position: {Math.round(comment.x)}, {Math.round(comment.y)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}