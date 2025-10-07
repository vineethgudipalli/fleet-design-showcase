import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { 
  ExternalLink, 
  Play, 
  Star, 
  Download,
  Calendar,
  Eye,
  Figma
} from "lucide-react";
import { Prototype } from "./PrototypeCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PrototypeModalProps {
  prototype: Prototype | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function PrototypeModal({ 
  prototype, 
  isOpen, 
  onClose, 
  onToggleFavorite 
}: PrototypeModalProps) {
  if (!prototype) return null;

  const handleFavoriteClick = () => {
    onToggleFavorite(prototype.id);
  };

  const getTypeIcon = () => {
    switch (prototype.type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'interactive':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl mb-2">{prototype.title}</DialogTitle>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="gap-1">
                  {getTypeIcon()}
                  {prototype.type}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {prototype.views} views
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {prototype.createdAt}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavoriteClick}
              >
                <Star 
                  className={`h-4 w-4 mr-2 ${
                    prototype.isFavorite 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : ''
                  }`} 
                />
                {prototype.isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            {prototype.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center bg-black/10">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Video Preview</p>
                  <p className="text-sm text-muted-foreground">Click to play embedded video</p>
                </div>
              </div>
            ) : prototype.type === 'interactive' ? (
              <div className="w-full h-full flex items-center justify-center bg-accent/20">
                <div className="text-center">
                  <ExternalLink className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Interactive Prototype</p>
                  <p className="text-sm text-muted-foreground">Click button below to open in new tab</p>
                </div>
              </div>
            ) : (
              <ImageWithFallback
                src={prototype.thumbnail}
                alt={prototype.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {prototype.prototypeLink && (
              <Button className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Prototype
              </Button>
            )}
            {prototype.figmaLink && (
              <Button variant="outline" className="flex-1">
                <Figma className="h-4 w-4 mr-2" />
                View in Figma
              </Button>
            )}
          </div>

          <Separator />

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {prototype.description}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {prototype.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Created by</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {prototype.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{prototype.author.name}</p>
                    <p className="text-sm text-muted-foreground">Designer</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="capitalize">{prototype.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span>{prototype.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{prototype.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}