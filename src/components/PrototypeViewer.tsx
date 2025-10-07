import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, MessageCircle, Send, ExternalLink, Maximize2 } from "lucide-react";

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
}

interface PrototypeViewerProps {
  prototype: PrototypeViewerData | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
}

export default function PrototypeViewer({ 
  prototype, 
  isOpen, 
  onClose, 
  onAddComment 
}: PrototypeViewerProps) {
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [commentPosition, setCommentPosition] = useState<{x: number, y: number} | null>(null);

  if (!prototype) return null;

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    onAddComment({
      author: "You", // In a real app, this would come from auth
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{prototype.title}</DialogTitle>
        </DialogHeader>
        <div className="flex h-[95vh]">
          {/* Main viewer */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold">{prototype.title}</h2>
                <Badge variant="outline">Prototype</Badge>
              </div>
              
              <div className="flex items-center gap-2">
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
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Prototype iframe */}
            <div className="flex-1 relative bg-gray-100" onClick={handleFrameClick}>
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
                    className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
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
                  className="absolute w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse"
                  style={{ left: commentPosition.x, top: commentPosition.y }}
                >
                  +
                </div>
              )}
            </div>
          </div>

          {/* Comments sidebar */}
          {showComments && (
            <div className="w-80 border-l bg-background flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium mb-3">Comments</h3>
                
                {/* New comment form */}
                <div className="space-y-2">
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}