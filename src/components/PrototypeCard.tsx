import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  ExternalLink, 
  Play, 
  Star, 
  MoreHorizontal,
  Calendar,
  Eye
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Prototype {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'interactive' | 'static';
  thumbnail: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  views: number;
  isFavorite: boolean;
  tags: string[];
  figmaLink?: string;
  prototypeLink?: string;
}

interface PrototypeCardProps {
  prototype: Prototype;
  onView: (prototype: Prototype) => void;
  onToggleFavorite: (id: string) => void;
}

export default function PrototypeCard({ 
  prototype, 
  onView, 
  onToggleFavorite 
}: PrototypeCardProps) {
  const handleCardClick = () => {
    onView(prototype);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const getTypeBadgeVariant = () => {
    switch (prototype.type) {
      case 'video':
        return 'default';
      case 'interactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-accent-foreground/20">
      <CardHeader className="p-0">
        <div className="relative" onClick={handleCardClick}>
          <div className="aspect-video rounded-t-lg overflow-hidden bg-muted">
            <ImageWithFallback
              src={prototype.thumbnail}
              alt={prototype.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant={getTypeBadgeVariant()} className="gap-1">
              {getTypeIcon()}
              {prototype.type}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
              onClick={handleFavoriteClick}
            >
              <Star 
                className={`h-4 w-4 ${
                  prototype.isFavorite 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-muted-foreground'
                }`} 
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4" onClick={handleCardClick}>
        <h3 className="font-medium mb-2 line-clamp-1">{prototype.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {prototype.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {prototype.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {prototype.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{prototype.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {prototype.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {prototype.author.name}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {prototype.views}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {prototype.createdAt}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}