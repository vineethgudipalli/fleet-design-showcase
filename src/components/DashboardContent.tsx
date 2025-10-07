import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import PrototypeCard, { Prototype } from "./PrototypeCard";
import PrototypeModal from "./PrototypeModal";
import { Filter, GridIcon, List, Plus } from "lucide-react";

// Mock data
const mockPrototypes: Prototype[] = [
  {
    id: "1",
    title: "E-commerce Mobile App",
    description: "Modern mobile shopping experience with intuitive navigation and smooth checkout flow. Features product discovery, wishlist, and AR try-on.",
    type: "interactive",
    thumbnail: "https://images.unsplash.com/photo-1678667720699-5c0fc04ac166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjBwcm90b3R5cGV8ZW58MXx8fHwxNzU4OTA1MzYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    author: { name: "Sarah Chen" },
    createdAt: "2 days ago",
    views: 156,
    isFavorite: true,
    tags: ["Mobile", "E-commerce", "React Native", "Figma"],
    figmaLink: "https://figma.com/proto/123",
    prototypeLink: "https://prototype.example.com/123"
  },
  {
    id: "2",
    title: "Dashboard Analytics UI",
    description: "Clean and modern dashboard interface for data visualization with interactive charts and real-time updates.",
    type: "static",
    thumbnail: "https://images.unsplash.com/photo-1575388902449-6bca946ad549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBkZXNpZ24lMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzU4ODg1MjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    author: { name: "Alex Kumar" },
    createdAt: "5 days ago",
    views: 89,
    isFavorite: false,
    tags: ["Dashboard", "Analytics", "Web", "Charts"],
    figmaLink: "https://figma.com/proto/456"
  },
  {
    id: "3",
    title: "Banking App Walkthrough",
    description: "Complete user onboarding flow for a mobile banking application with security features and biometric authentication.",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1756576357697-13dfc5fff61c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBpbnRlcmZhY2UlMjBkZXNpZ258ZW58MXx8fHwxNzU4OTk3MTE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    author: { name: "Maya Patel" },
    createdAt: "1 week ago",
    views: 234,
    isFavorite: true,
    tags: ["Mobile", "Banking", "Security", "Video"],
    figmaLink: "https://figma.com/proto/789"
  },
  {
    id: "4",
    title: "SaaS Landing Page",
    description: "High-converting landing page design for B2B software with clear value proposition and social proof elements.",
    type: "interactive",
    thumbnail: "https://images.unsplash.com/photo-1585229259079-05ab82f93c7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjBwcm90b3R5cGV8ZW58MXx8fHwxNzU4OTA1MzYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    author: { name: "David Lee" },
    createdAt: "1 week ago",
    views: 67,
    isFavorite: false,
    tags: ["Landing Page", "SaaS", "Conversion", "Web"],
    prototypeLink: "https://prototype.example.com/456"
  },
  {
    id: "5",
    title: "Task Management App",
    description: "Collaborative project management tool with team features, timeline views, and progress tracking.",
    type: "interactive",
    thumbnail: "https://images.unsplash.com/photo-1622117515670-fcb02499491f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1aSUyMHV4JTIwZGVzaWduJTIwd2lyZWZyYW1lfGVufDF8fHx8MTc1ODkyOTY2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    author: { name: "Emma Wilson" },
    createdAt: "2 weeks ago",
    views: 145,
    isFavorite: false,
    tags: ["Productivity", "Collaboration", "Web App", "React"],
    figmaLink: "https://figma.com/proto/101112",
    prototypeLink: "https://prototype.example.com/789"
  },
  {
    id: "6",
    title: "Social Media Concept",
    description: "Fresh take on social networking with focus on meaningful connections and content discovery.",
    type: "static",
    thumbnail: "https://images.unsplash.com/photo-1521391406205-4a6af174a4c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcHAlMjBkZXNpZ24lMjBza2V0Y2h8ZW58MXx8fHwxNzU4OTk3MTE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    author: { name: "Jordan Taylor" },
    createdAt: "3 weeks ago",
    views: 203,
    isFavorite: true,
    tags: ["Social", "Mobile", "Concept", "UI/UX"],
    figmaLink: "https://figma.com/proto/131415"
  }
];

interface DashboardContentProps {
  activeSection: string;
}

export default function DashboardContent({ activeSection }: DashboardContentProps) {
  const [prototypes, setPrototypes] = useState<Prototype[]>(mockPrototypes);
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrototypeView = (prototype: Prototype) => {
    setSelectedPrototype(prototype);
    setIsModalOpen(true);
    // Increment view count
    setPrototypes(prev => 
      prev.map(p => 
        p.id === prototype.id ? { ...p, views: p.views + 1 } : p
      )
    );
  };

  const handleToggleFavorite = (id: string) => {
    setPrototypes(prev => 
      prev.map(p => 
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  const filteredPrototypes = prototypes.filter(prototype => {
    const matchesSearch = prototype.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prototype.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prototype.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || prototype.type === filterType;
    
    const matchesSection = (() => {
      switch (activeSection) {
        case 'favorites':
          return prototype.isFavorite;
        case 'videos':
          return prototype.type === 'video';
        case 'interactive':
          return prototype.type === 'interactive';
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType && matchesSection;
  });

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'favorites':
        return 'Favorite Prototypes';
      case 'videos':
        return 'Video Prototypes';
      case 'interactive':
        return 'Interactive Prototypes';
      case 'team':
        return 'Team Prototypes';
      case 'archived':
        return 'Archived Prototypes';
      default:
        return 'All Prototypes';
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-medium">{getSectionTitle()}</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Prototype
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search prototypes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input-background"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="static">Static</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">
            {filteredPrototypes.length} prototypes
          </span>
          {searchQuery && (
            <Badge variant="outline">
              Search: "{searchQuery}"
            </Badge>
          )}
          {filterType !== 'all' && (
            <Badge variant="outline">
              Type: {filterType}
            </Badge>
          )}
        </div>
      </div>

      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {filteredPrototypes.map((prototype) => (
          <PrototypeCard
            key={prototype.id}
            prototype={prototype}
            onView={handlePrototypeView}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      {filteredPrototypes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">No prototypes found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      <PrototypeModal
        prototype={selectedPrototype}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}