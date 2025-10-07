import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { 
  X, 
  MessageCircle, 
  Send, 
  ExternalLink, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw
} from "lucide-react";

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  x?: number;
  y?: number;
}

export interface PrototypeViewerData {
  id: string;
  title: string;
  embedUrl: string;
  fileKey?: string;
  comments: Comment[];
  videoLink?: string;
  problemSummary?: string;
}

interface FullPagePrototypeViewerProps {
  prototype: PrototypeViewerData | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
}

export default function FullPagePrototypeViewer({ 
  prototype, 
  isOpen, 
  onClose, 
  onAddComment 
}: FullPagePrototypeViewerProps) {
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{x: number, y: number} | null>(null);
  
  // Video overlay state
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Show video overlay automatically if there's a video link and problem summary
    if (prototype?.videoLink && prototype?.problemSummary && isOpen) {
      setShowVideoOverlay(true);
    }
  }, [prototype, isOpen]);

  if (!prototype) return null;

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

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const extractVideoId = (url: string) => {
    // Extract video ID from various video platforms
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }
    if (url.includes('loom.com')) {
      const match = url.match(/loom\.com\/share\/([^&\n?#]+)/);
      return match ? `https://www.loom.com/embed/${match[1]}` : null;
    }
    // For other video URLs, return as is
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full max-w-none p-0 gap-0"
        style={{ width: '100vw', height: '100vh' }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <SheetHeader>
                  <SheetTitle className="text-left">{prototype.title}</SheetTitle>
                </SheetHeader>
                <Badge variant="outline">Prototype</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {prototype.videoLink && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowVideoOverlay(!showVideoOverlay)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {showVideoOverlay ? 'Hide' : 'Show'} Video
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={openInFigma}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Figma
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Comments ({prototype.comments.length})
              </Button>
            </div>
          </div>

          {/* Problem Summary */}
          {prototype.problemSummary && (
            <div className="px-6 py-4 bg-muted/30 border-b">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Problem:</span> {prototype.problemSummary}
              </p>
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 relative bg-gray-100">
            {/* Prototype iframe */}
            <div className="absolute inset-0" onClick={handleFrameClick}>
              <iframe
                src={prototype.embedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                title={prototype.title}
              />
              
              {/* Comment markers */}
              {prototype.comments.map((comment) => (
                comment.x !== undefined && comment.y !== undefined && (
                  <div
                    key={comment.id}
                    className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform z-10"
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
                  className="absolute w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse z-10"
                  style={{ left: commentPosition.x, top: commentPosition.y }}
                >
                  +
                </div>
              )}
            </div>

            {/* Video overlay - bottom right */}
            {showVideoOverlay && prototype.videoLink && (
              <div 
                className={`absolute bottom-6 right-6 z-50 transition-all duration-300 ${
                  isVideoExpanded 
                    ? 'w-96 h-64' 
                    : 'w-72 h-48'
                } bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-white/20`}
              >
                {/* Video iframe */}
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
                    className="h-6 w-6 p-0 bg-black/60 hover:bg-black/80 border-white/20"
                    onClick={restartVideo}
                  >
                    <RotateCcw className="h-3 w-3 text-white" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="h-6 w-6 p-0 bg-black/60 hover:bg-black/80 border-white/20"
                    onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                  >
                    {isVideoExpanded ? (
                      <Minimize2 className="h-3 w-3 text-white" />
                    ) : (
                      <Maximize2 className="h-3 w-3 text-white" />
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="h-6 w-6 p-0 bg-black/60 hover:bg-black/80 border-white/20"
                    onClick={() => setShowVideoOverlay(false)}
                  >
                    <X className="h-3 w-3 text-white" />
                  </Button>
                </div>

                {/* Video title overlay */}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white/90 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                    Design explanation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments sidebar sheet */}
        {showComments && (
          <Sheet open={showComments} onOpenChange={setShowComments}>
            <SheetContent side="right" className="w-96 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <SheetHeader>
                    <SheetTitle>Comments</SheetTitle>
                  </SheetHeader>
                  
                  {/* New comment form */}
                  <div className="space-y-3 mt-4">
                    <Textarea
                      placeholder={commentPosition ? "Add a comment at the marked position..." : "Add a general comment..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      {commentPosition && (
                        <span className="text-xs text-muted-foreground">
                          Position: {Math.round(commentPosition.x)}, {Math.round(commentPosition.y)}
                        </span>
                      )}
                      <div className="flex gap-2 ml-auto">
                        {commentPosition && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCommentPosition(null)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {prototype.comments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No comments yet</p>
                      <p className="text-xs">Click on the prototype to add a comment</p>
                    </div>
                  ) : (
                    prototype.comments.map((comment) => (
                      <Card key={comment.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {comment.author.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.timestamp}
                            </span>
                            {comment.x !== undefined && comment.y !== undefined && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                #{prototype.comments.indexOf(comment) + 1}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm">{comment.content}</p>
                          {comment.x !== undefined && comment.y !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Position: {Math.round(comment.x)}, {Math.round(comment.y)}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </SheetContent>
    </Sheet>
  );
}