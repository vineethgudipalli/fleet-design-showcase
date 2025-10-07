import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageCircle, ExternalLink, Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EmptyPrototypeList } from './EmptyPrototypeList';
import PrototypeReactions, { ReactionType, PrototypeReactions as PrototypeReactionsType } from './PrototypeReactions';

interface Prototype {
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
  createdAtDate: Date;
  recentViews: number; // Views in last 48 hours for trending calculation
  tags: string[];
}

type SortOption = "latest" | "views" | "alphabetical" | "most-loved" | "trending";

interface PrototypeGridProps {
  searchQuery: string;
  selectedExperience: string;
  selectedPersona: string;
  sortBy: SortOption;
  onFilteredCountChange: (count: number) => void;
  onPrototypeClick: (prototype: Prototype) => void;
}

// Initial mock data for prototypes
const initialMockPrototypes: Prototype[] = [
  {
    id: '1',
    title: 'Fleet Dashboard Redesign',
    description: 'Modern dashboard interface for fleet managers to monitor vehicle status, routes, and driver performance in real-time.',
    author: {
      name: 'Sarah Chen',
      initials: 'SC'
    },
    thumbnail: 'https://images.unsplash.com/photo-1639060015191-9d83063eab2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGVldCUyMGRhc2hib2FyZCUyMGludGVyZmFjZXxlbnwxfHx8fDE3NTk0MzY4ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: 'core-os',
    persona: ['Fleet Manager', 'Dispatcher'],
    reactions: {
      heart: { type: 'heart', count: 24, userReacted: false },
      like: { type: 'like', count: 18, userReacted: false },
      idea: { type: 'idea', count: 7, userReacted: false }
    },
    commentCount: 12,
    viewCount: 156,
    recentViews: 89, // High recent activity
    createdAt: '2 days ago',
    createdAtDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ['Dashboard', 'Real-time', 'Analytics']
  },
  {
    id: '2',
    title: 'Driver Mobile App',
    description: 'Intuitive mobile interface for drivers to manage deliveries, communicate with dispatch, and track their performance.',
    author: {
      name: 'Marcus Rodriguez',
      initials: 'MR'
    },
    thumbnail: 'https://images.unsplash.com/photo-1658953229625-aad99d7603b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU5NDE1NTg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: 'applications',
    persona: ['Driver', 'Dispatcher'],
    reactions: {
      heart: { type: 'heart', count: 31, userReacted: false },
      like: { type: 'like', count: 25, userReacted: false },
      idea: { type: 'idea', count: 12, userReacted: false }
    },
    commentCount: 18,
    viewCount: 203,
    recentViews: 45,
    createdAt: '4 days ago',
    createdAtDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    tags: ['Mobile', 'Communication', 'Delivery']
  },
  {
    id: '3',
    title: 'Maintenance Scheduling System',
    description: 'Comprehensive maintenance planning interface that helps manage vehicle servicing, parts inventory, and technician schedules.',
    author: {
      name: 'Emily Watson',
      initials: 'EW'
    },
    thumbnail: 'https://images.unsplash.com/photo-1727413434026-0f8314c037d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWludGVuYW5jZSUyMHN5c3RlbXxlbnwxfHx8fDE3NTk0MzY4OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: 'core-os',
    persona: ['Maintenance Manager', 'Technician'],
    reactions: {
      heart: { type: 'heart', count: 19, userReacted: false },
      like: { type: 'like', count: 14, userReacted: false },
      idea: { type: 'idea', count: 9, userReacted: false }
    },
    commentCount: 8,
    viewCount: 127,
    recentViews: 12,
    createdAt: '1 week ago',
    createdAtDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    tags: ['Maintenance', 'Scheduling', 'Inventory']
  },
  {
    id: '4',
    title: 'Route Optimization Tool',
    description: 'AI-powered route planning interface that optimizes delivery routes for fuel efficiency and time management.',
    author: {
      name: 'David Kim',
      initials: 'DK'
    },
    thumbnail: 'https://images.unsplash.com/photo-1698361363770-a38463b80c33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3V0ZSUyMG9wdGltaXphdGlvbnxlbnwxfHx8fDE3NTk0MzY4OTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: 'growth',
    persona: ['Fleet Manager', 'Dispatcher'],
    reactions: {
      heart: { type: 'heart', count: 42, userReacted: false },
      like: { type: 'like', count: 35, userReacted: false },
      idea: { type: 'idea', count: 15, userReacted: false }
    },
    commentCount: 22,
    viewCount: 289,
    recentViews: 67,
    createdAt: '1 week ago',
    createdAtDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    tags: ['AI', 'Optimization', 'Routes']
  },
  {
    id: '5',
    title: 'Safety Compliance Dashboard',
    description: 'Safety monitoring interface that tracks driver behavior, compliance metrics, and incident reporting workflows.',
    author: {
      name: 'Jennifer Lee',
      initials: 'JL'
    },
    thumbnail: 'https://images.unsplash.com/photo-1758228655476-6b51e2303a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWZldHklMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzU5NDM2OTAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: 'core-os',
    persona: ['Safety Manager', 'Fleet Manager'],
    reactions: {
      heart: { type: 'heart', count: 28, userReacted: false },
      like: { type: 'like', count: 21, userReacted: false },
      idea: { type: 'idea', count: 6, userReacted: false }
    },
    commentCount: 15,
    viewCount: 178,
    recentViews: 23,
    createdAt: '2 weeks ago',
    createdAtDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    tags: ['Safety', 'Compliance', 'Monitoring']
  },
  {
    id: '6',
    title: 'Fleet Onboarding Experience',
    description: 'Streamlined onboarding flow for new fleet operators covering setup, training, and initial vehicle assignment.',
    author: {
      name: 'Alex Thompson',
      initials: 'AT'
    },
    thumbnail: 'https://images.unsplash.com/photo-1691158429414-32803f0be66f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmJvYXJkaW5nJTIwZmxvd3xlbnwxfHx8fDE3NTk0MzY5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: 'onboard',
    persona: ['Owner/Operator', 'Fleet Manager'],
    reactions: {
      heart: { type: 'heart', count: 16, userReacted: false },
      like: { type: 'like', count: 12, userReacted: false },
      idea: { type: 'idea', count: 8, userReacted: false }
    },
    commentCount: 9,
    viewCount: 98,
    recentViews: 5,
    createdAt: '2 weeks ago',
    createdAtDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    tags: ['Onboarding', 'Training', 'Setup']
  }
];

export function PrototypeGrid({ 
  searchQuery, 
  selectedExperience, 
  selectedPersona, 
  sortBy,
  onFilteredCountChange,
  onPrototypeClick
}: PrototypeGridProps) {
  // State to manage prototype reactions
  const [prototypes, setPrototypes] = useState<Prototype[]>(initialMockPrototypes);

  // Handle reaction toggle
  const handleReactionToggle = (prototypeId: string, reactionType: ReactionType) => {
    setPrototypes(prevPrototypes => 
      prevPrototypes.map(prototype => {
        if (prototype.id !== prototypeId) return prototype;
        
        const currentReaction = prototype.reactions[reactionType];
        const newUserReacted = !currentReaction.userReacted;
        const newCount = newUserReacted 
          ? currentReaction.count + 1 
          : Math.max(0, currentReaction.count - 1);
        
        return {
          ...prototype,
          reactions: {
            ...prototype.reactions,
            [reactionType]: {
              ...currentReaction,
              userReacted: newUserReacted,
              count: newCount
            }
          }
        };
      })
    );
  };

  // Filter prototypes based on search and filters
  const filteredPrototypes = prototypes.filter(prototype => {
    const matchesSearch = searchQuery === '' || 
      prototype.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prototype.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prototype.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesExperience = selectedExperience === 'all' || prototype.experience === selectedExperience;
    
    const matchesPersona = selectedPersona === 'all' || 
      prototype.persona.some(p => p.toLowerCase().includes(selectedPersona.toLowerCase()));
    
    return matchesSearch && matchesExperience && matchesPersona;
  });

  // Sort prototypes based on selected sort option
  const sortedPrototypes = [...filteredPrototypes].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return b.createdAtDate.getTime() - a.createdAtDate.getTime();
      
      case 'views':
        return b.viewCount - a.viewCount;
      
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      
      case 'most-loved':
        const aLoveScore = a.reactions.heart.count + a.reactions.like.count + a.reactions.idea.count;
        const bLoveScore = b.reactions.heart.count + b.reactions.like.count + b.reactions.idea.count;
        return bLoveScore - aLoveScore;
      
      case 'trending':
        return b.recentViews - a.recentViews;
      
      default:
        return 0;
    }
  });

  // Report filtered count to parent
  React.useEffect(() => {
    onFilteredCountChange(sortedPrototypes.length);
  }, [sortedPrototypes.length, onFilteredCountChange]);

  // Check if we should show empty state
  if (sortedPrototypes.length === 0) {
    const hasFilters = searchQuery !== '' || selectedExperience !== 'all' || selectedPersona !== 'all';
    return (
      <EmptyPrototypeList
        hasFilters={hasFilters}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedPrototypes.map((prototype, index) => (
        <motion.div
          key={prototype.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card 
            className="bg-[#2c2c2c] border-[#3e3e3e] hover:border-[#4e4e4e] transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => onPrototypeClick(prototype)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-[#1e1e1e] overflow-hidden">
              <ImageWithFallback
                src={prototype.thumbnail}
                alt={prototype.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Experience Badge */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90 text-xs">
                  {prototype.experience.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
              
              {/* View Count */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <Eye className="w-3 h-3 text-white/80" />
                <span className="text-xs text-white/80">{prototype.viewCount}</span>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button size="sm" className="bg-white text-black hover:bg-white/90">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Prototype
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white mb-1 truncate">{prototype.title}</h3>
                  <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                    {prototype.description}
                  </p>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {prototype.tags.slice(0, 3).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="bg-white/10 text-white/70 hover:bg-white/20 text-xs px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Author */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={prototype.author.avatar} />
                    <AvatarFallback className="bg-[#0d99ff] text-white text-xs">
                      {prototype.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm">{prototype.author.name}</p>
                    <p className="text-white/50 text-xs">{prototype.createdAt}</p>
                  </div>
                </div>
              </div>
              
              {/* Persona Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {prototype.persona.slice(0, 2).map(persona => (
                  <Badge 
                    key={persona} 
                    className="bg-[#0d99ff]/20 text-[#0d99ff] hover:bg-[#0d99ff]/30 text-xs px-2 py-0.5"
                  >
                    {persona}
                  </Badge>
                ))}
                {prototype.persona.length > 2 && (
                  <Badge className="bg-white/10 text-white/50 text-xs px-2 py-0.5">
                    +{prototype.persona.length - 2}
                  </Badge>
                )}
              </div>
              
              {/* Reactions & Comments */}
              <div className="flex items-center justify-between pt-3 border-t border-[#3e3e3e]">
                <PrototypeReactions
                  reactions={prototype.reactions}
                  onReact={(reactionType) => handleReactionToggle(prototype.id, reactionType)}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 gap-1 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="text-xs">{prototype.commentCount}</span>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}