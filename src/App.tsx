import { useState } from "react";
import { Button } from "./components/ui/button";
import { Layers, Plus, LogOut, User, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { FigmaIcon } from "./components/figma/FigmaIcon";
import UnifiedSearchBar from "./components/UnifiedSearchBar";
import { EmptyState } from "./components/EmptyState";
import { GmailAuthModal } from "./components/GmailAuthModal";
import { PrototypeGrid } from "./components/PrototypeGrid";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import UnifiedFigmaImportDialog from "./components/UnifiedFigmaImportDialog";
import AddPrototypeDialog from "./components/AddPrototypeDialog";
import FullscreenPrototypeModal, { PrototypeData, Comment } from "./components/FullscreenPrototypeModal";
import { ReactionType } from "./components/PrototypeReactions";

type Experience = "all" | "discover" | "onboard" | "shop" | "core-os" | "applications" | "growth" | "support";
type SortOption = "latest" | "views" | "alphabetical" | "most-loved" | "trending";

const getExperienceLabel = (experience: Experience) => {
  switch (experience) {
    case "all": return "All";
    case "discover": return "Discover";
    case "onboard": return "Onboard";
    case "shop": return "Shop";
    case "core-os": return "Core OS";
    case "applications": return "Applications";
    case "growth": return "Growth";
    case "support": return "Support";
    default: return experience;
  }
};

const getSortLabel = (sortOption: SortOption) => {
  switch (sortOption) {
    case "latest": return "Latest";
    case "views": return "Views";
    case "alphabetical": return "Alphabetical";
    case "most-loved": return "Most loved";
    case "trending": return "Trending";
    default: return sortOption;
  }
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<Experience>("all");
  const [selectedPersona, setSelectedPersona] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGmailAuthModal, setShowGmailAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [figmaToken, setFigmaToken] = useState("");
  const [filteredPrototypeCount, setFilteredPrototypeCount] = useState(6);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    initials: string;
    avatar?: string;
  } | null>(null);
  const [selectedPrototype, setSelectedPrototype] = useState<PrototypeData | null>(null);
  const [showPrototypeModal, setShowPrototypeModal] = useState(false);

  // Gmail authentication handlers
  const handleGmailAuthClick = () => {
    setShowGmailAuthModal(true);
  };

  // Handle successful authentication
  const handleAuthSuccess = (userInfo: { name: string; email: string; avatar?: string }) => {
    setIsAuthenticated(true);
    setCurrentUser({
      ...userInfo,
      initials: userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()
    });
    setShowGmailAuthModal(false);
  };

  // Import and Add handlers
  const handleImportPrototype = (prototype: any) => {
    console.log('Imported prototype:', prototype);
    // TODO: Add to prototype list or handle as needed
  };

  const handleAddPrototype = (prototype: any) => {
    console.log('Added prototype:', prototype);
    // TODO: Add to prototype list or handle as needed
  };

  const handleTokenSet = (token: string) => {
    setFigmaToken(token);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedExperience("all");
    setSelectedPersona("all");
    setSortBy("latest");
  };

  const handleFilteredCountChange = (count: number) => {
    setFilteredPrototypeCount(count);
  };

  const handlePrototypeClick = (prototype: any) => {
    // Convert the prototype format to match PrototypeData
    const prototypeData: PrototypeData = {
      ...prototype,
      comments: [
        {
          id: '1',
          author: {
            name: 'John Smith',
            initials: 'JS'
          },
          content: 'Great work on the user flow! The navigation feels very intuitive.',
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          author: {
            name: 'Sarah Chen',
            initials: 'SC'
          },
          content: 'I love the color scheme and how it aligns with our brand guidelines.',
          timestamp: '4 hours ago'
        }
      ]
    };
    setSelectedPrototype(prototypeData);
    setShowPrototypeModal(true);
  };

  const handlePrototypeReaction = (reactionType: ReactionType) => {
    if (!selectedPrototype) return;
    
    // Update reactions for the selected prototype
    const currentReaction = selectedPrototype.reactions[reactionType];
    const newUserReacted = !currentReaction.userReacted;
    const newCount = newUserReacted 
      ? currentReaction.count + 1 
      : Math.max(0, currentReaction.count - 1);
    
    setSelectedPrototype({
      ...selectedPrototype,
      reactions: {
        ...selectedPrototype.reactions,
        [reactionType]: {
          ...currentReaction,
          userReacted: newUserReacted,
          count: newCount
        }
      }
    });
  };

  const handleAddComment = (content: string) => {
    if (!selectedPrototype || !currentUser) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        name: currentUser.name,
        initials: currentUser.initials,
        avatar: currentUser.avatar
      },
      content,
      timestamp: 'just now'
    };
    
    setSelectedPrototype({
      ...selectedPrototype,
      comments: [...selectedPrototype.comments, newComment],
      commentCount: selectedPrototype.commentCount + 1
    });
  };

  return (
    <>
      {/* Gmail Authentication Modal */}
      <GmailAuthModal 
        open={showGmailAuthModal} 
        onOpenChange={setShowGmailAuthModal}
        onSuccess={handleAuthSuccess}
      />

      {/* Import and Add Modals */}
      <UnifiedFigmaImportDialog
        onImport={handleImportPrototype}
        onTokenSet={handleTokenSet}
        hasToken={!!figmaToken}
        isOpen={showImportModal}
        onOpenChange={setShowImportModal}
      />
      <AddPrototypeDialog
        onAdd={handleAddPrototype}
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
      />

      {/* Fullscreen Prototype Modal */}
      <FullscreenPrototypeModal
        prototype={selectedPrototype}
        isOpen={showPrototypeModal}
        onClose={() => setShowPrototypeModal(false)}
        onReactionToggle={handlePrototypeReaction}
        onAddComment={handleAddComment}
      />

      {/* Show Empty State for unauthenticated users */}
      {!isAuthenticated ? (
        <EmptyState 
          onGmailAuthClick={handleGmailAuthClick}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-screen bg-[#1e1e1e]"
        >
          {/* Top Bar */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#2c2c2c] border-b border-[#3e3e3e] px-4 sm:px-6 py-3 sm:py-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center">
                  <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                </div>
                <h1 className="font-medium text-base sm:text-lg text-white">
                  Fleet Design Showcase
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Import & Add Buttons */}
                <Button 
                  className="bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90 hidden"
                  onClick={() => setShowImportModal(true)}
                >
                  <FigmaIcon className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button 
                  className="bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90 px-[12px] py-[8px]"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>

                {/* User Avatar Menu */}
                <Popover open={showUserMenu} onOpenChange={setShowUserMenu}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full p-0 hover:bg-gray-700"
                      title={currentUser?.name}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                        <AvatarFallback className="bg-[#0d99ff] text-white text-sm">
                          {currentUser?.initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-64 p-0 bg-[#2c2c2c] border-[#3e3e3e]" 
                    align="end"
                    sideOffset={8}
                  >
                    <div className="p-4 border-b border-[#3e3e3e]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                          <AvatarFallback className="bg-[#0d99ff] text-white">
                            {currentUser?.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {currentUser?.name}
                          </p>
                          <p className="text-white/60 text-sm truncate">
                            {currentUser?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsAuthenticated(false);
                          setCurrentUser(null);
                          console.log('User logged out');
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </motion.header>

          {/* Hero Section with Centered Search */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#1e1e1e] py-8 sm:py-12 lg:py-16"
          >
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4"
              >
                Explore the Future of Fleet
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base sm:text-lg lg:text-xl text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto"
              >
                Explore, share and get feedback on the latest design
                prototypes from our Design Teams
              </motion.p>

              {/* Unified Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <UnifiedSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedPersona={selectedPersona}
                  onPersonaChange={setSelectedPersona}
                />
              </motion.div>

              {/* Experience Journey Tabs */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex justify-center mt-6"
              >
                <div className="relative inline-flex items-center bg-[#2c2c2c] rounded-full p-1 border border-[#3e3e3e] gap-0.5 overflow-x-auto scrollbar-hide">
                  {(
                    ["all", "discover", "onboard", "shop", "core-os", "applications", "growth", "support"] as Experience[]
                  ).map((experience, index) => (
                    <motion.div
                      key={experience}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                      className="relative"
                    >
                      {selectedExperience === experience && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-white rounded-full shadow-sm"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedExperience(experience)}
                        className={`relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors duration-150 ${
                          selectedExperience === experience
                            ? "text-black"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {getExperienceLabel(experience)}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Prototypes Grid Placeholder */}
          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="px-4 sm:px-6 pb-12 sm:pb-16"
          >
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">
                      {selectedExperience !== "all" ? getExperienceLabel(selectedExperience) : "All"} Prototypes
                    </h2>
                    <p className="text-sm sm:text-base text-white/60">
                      {filteredPrototypeCount} prototype{filteredPrototypeCount !== 1 ? 's' : ''}
                      {selectedPersona !== "all" 
                        ? ` for ${selectedPersona}`
                        : ""}
                    </p>
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60 hidden sm:block">Sort by:</span>
                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                      <SelectTrigger className="w-[140px] bg-[#2c2c2c] border-[#3e3e3e] text-white hover:bg-[#3e3e3e] focus:ring-[#0d99ff] focus:ring-1 focus:border-[#0d99ff]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c2c2c] border-[#3e3e3e] text-white">
                        <SelectItem value="latest" className="focus:bg-[#3e3e3e] focus:text-white">Latest</SelectItem>
                        <SelectItem value="views" className="focus:bg-[#3e3e3e] focus:text-white">Views</SelectItem>
                        <SelectItem value="alphabetical" className="focus:bg-[#3e3e3e] focus:text-white">Alphabetical</SelectItem>
                        <SelectItem value="most-loved" className="focus:bg-[#3e3e3e] focus:text-white">Most loved</SelectItem>
                        <SelectItem value="trending" className="focus:bg-[#3e3e3e] focus:text-white">Trending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Prototypes Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <PrototypeGrid 
                  searchQuery={searchQuery}
                  selectedExperience={selectedExperience}
                  selectedPersona={selectedPersona}
                  sortBy={sortBy}
                  onFilteredCountChange={handleFilteredCountChange}
                  onPrototypeClick={handlePrototypeClick}
                />
              </motion.div>
            </div>
          </motion.main>
        </motion.div>
      )}
    </>
  );
}