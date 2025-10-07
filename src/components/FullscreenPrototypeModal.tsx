import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { X, MessageCircle, Send, ExternalLink, Heart, ThumbsUp, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import PrototypeReactions, { ReactionType, PrototypeReactions as PrototypeReactionsType } from './PrototypeReactions';

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  content: string;
  timestamp: string;
}

export interface PrototypeData {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  thumbnail: string;
  experience: string;
  persona: string[];
  reactions: PrototypeReactionsType;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  tags: string[];
  embedUrl?: string;
  comments: Comment[];
}

interface FullscreenPrototypeModalProps {
  prototype: PrototypeData | null;
  isOpen: boolean;
  onClose: () => void;
  onReactionToggle: (reactionType: ReactionType) => void;
  onAddComment: (content: string) => void;
}

export default function FullscreenPrototypeModal({ 
  prototype, 
  isOpen, 
  onClose,
  onReactionToggle,
  onAddComment
}: FullscreenPrototypeModalProps) {
  const [newComment, setNewComment] = useState("");

  if (!prototype) return null;

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment("");
  };

  // Mock embed URL for demo - in real app this would come from the prototype data
  const embedUrl = prototype.embedUrl || 
    `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/proto/demo/${prototype.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-none !max-h-none !w-screen !h-screen !p-0 !gap-0 !bg-[#1e1e1e] !fixed !inset-0 !top-0 !left-0 !transform-none !translate-x-0 !translate-y-0 !rounded-none !border-0">
        <DialogTitle className="sr-only">
          {prototype.title} - Prototype Viewer
        </DialogTitle>
        <DialogDescription className="sr-only">
          View and interact with the {prototype.title} prototype. {prototype.description}
        </DialogDescription>
        
        {/* Close button positioned at top-right */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white hover:bg-[#3e3e3e] bg-[#2c2c2c]/80 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex h-full">
          {/* Main prototype viewer - 3/4 width */}
          <div className="flex-[3] flex flex-col bg-[#1e1e1e]">


            {/* Prototype iframe */}
            <div className="flex-1 bg-[#f5f5f5] relative">
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                title={prototype.title}
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
          </div>

          {/* Details sidebar - 1/4 width */}
          <div className="flex-[1] border-l border-[#3e3e3e] bg-[#2c2c2c] flex flex-col min-w-[300px]">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4 overflow-y-auto">
                {/* Title and Description */}
                <div>
                  <h3 className="text-white text-xl font-semibold mb-2">{prototype.title}</h3>
                  <p className="text-white/70 leading-relaxed">{prototype.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {prototype.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-white/10 text-white/70 hover:bg-white/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={prototype.author.avatar} />
                    <AvatarFallback className="bg-[#0d99ff] text-white">
                      {prototype.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{prototype.author.name}</p>
                    <p className="text-white/50 text-sm">{prototype.createdAt}</p>
                  </div>
                </div>

                {/* Persona Tags */}
                <div className="flex flex-wrap gap-2">
                  {prototype.persona.map(persona => (
                    <Badge 
                      key={persona} 
                      className="bg-[#0d99ff]/20 text-[#0d99ff] hover:bg-[#0d99ff]/30"
                    >
                      {persona}
                    </Badge>
                  ))}
                </div>

                {/* Reactions */}
                <div>
                  <PrototypeReactions
                    reactions={prototype.reactions}
                    onReact={onReactionToggle}
                    size="lg"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-[#3e3e3e] rounded-lg">
                    <p className="text-white font-semibold">{prototype.viewCount}</p>
                    <p className="text-white/50 text-xs">Views</p>
                  </div>
                  <div className="text-center p-2 bg-[#3e3e3e] rounded-lg">
                    <p className="text-white font-semibold">{prototype.commentCount}</p>
                    <p className="text-white/50 text-xs">Comments</p>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h4 className="text-white font-medium mb-3">
                    Comments ({prototype.comments.length})
                  </h4>
                  
                  {/* New comment form */}
                  <div className="space-y-3 mb-6">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-[#3e3e3e] border-[#4e4e4e] text-white placeholder:text-white/50 resize-none"
                      rows={3}
                    />
                    <Button 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="w-full bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-4">
                    {prototype.comments.length === 0 ? (
                      <div className="text-center py-8 text-white/50">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No comments yet</p>
                        <p className="text-sm">Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      prototype.comments.map((comment, index) => (
                        <motion.div 
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-[#3e3e3e] rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={comment.author.avatar} />
                              <AvatarFallback className="bg-[#0d99ff] text-white text-sm">
                                {comment.author.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-medium text-sm">{comment.author.name}</p>
                                <p className="text-white/50 text-xs">{comment.timestamp}</p>
                              </div>
                              <p className="text-white/80 text-sm leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}