import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "./components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PrototypeProvider, usePrototypes } from "./contexts/PrototypeContext";
import { usePrototypeFilter } from "./hooks/usePrototypeFilter";
import { Experience, EXPERIENCE_LABELS, EXPERIENCES, SortOption } from "./types";
import { AppHeader } from "./components/AppHeader";
import { FigmaAuthDirect, initiateFigmaAuth } from "./components/FigmaAuthDirect";
import UnifiedSearchBar from "./components/UnifiedSearchBar";
import { PrototypeGrid } from "./components/PrototypeGrid";
import AddPrototypeDialog from "./components/AddPrototypeDialog";
import FullscreenPrototypeModal, { PrototypeData } from "./components/FullscreenPrototypeModal";
import { ReactionType } from "./components/PrototypeReactions";
import { figmaApi } from "./services/figmaApi";
import { toast } from "sonner";

function AppContent() {
    const { user, isAuthenticated, login, logout } = useAuth();
    const { prototypes, addPrototype, toggleReaction, addComment, incrementViews } = usePrototypes();

    // UI State
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPrototype, setSelectedPrototype] = useState<PrototypeData | null>(null); // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [experience, setExperience] = useState<Experience>(Experience.All);
    const [persona, setPersona] = useState("all");
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.Latest);

    // Get filtered and sorted prototypes
    const filteredPrototypes = usePrototypeFilter({
        prototypes,
        searchQuery,
        experience,
        persona,
        sortBy
    });

    // Set Figma API token when user is authenticated
    useEffect(() => {
        const token = localStorage.getItem("figma_access_token");
        if (isAuthenticated && token) {
            console.log("🔑 Setting Figma API token from localStorage");

            // Validate token format
            const tokenPrefix = token.substring(0, 5);
            const isValidAccessToken = tokenPrefix === "figu_"; // OAuth user access token
            const isPersonalToken = tokenPrefix === "figo_"; // Personal access token (deprecated)

            if (isPersonalToken) {
                console.error("❌ Personal access token detected! OAuth required for full file access.");
                toast.error("Authentication Issue", {
                    description: "Personal access tokens have limited permissions. Please log out and sign in again with OAuth.",
                    duration: 8000
                });
                // Clear invalid token
                localStorage.removeItem("figma_access_token");
                return;
            }

            if (!isValidAccessToken) {
                console.error("❌ Invalid token format detected!");
                toast.error("Authentication Issue", {
                    description: "Your authentication token is invalid. Please log out and sign in again.",
                    duration: 8000
                });
                localStorage.removeItem("figma_access_token");
                return;
            }

            // Token format is valid, set it in the API service
            // Note: Token was already validated during OAuth flow in FigmaAuthDirect
            figmaApi.setToken(token);
        }
    }, [isAuthenticated]); // Handlers
    const handleAuthSuccess = (userInfo: { name: string; email: string; avatar?: string; id?: string }) => {
        // Set the Figma API token immediately after successful auth
        const token = localStorage.getItem("figma_access_token");
        if (token) {
            console.log("🔑 Setting Figma API token after auth success");
            figmaApi.setToken(token);
        }
        login(userInfo);
    };

    const handleAuthError = (error: string) => {
        toast.error("Authentication failed", {
            description: error,
            duration: 5000
        });
    };

    const handleLogout = () => {
        // Clear all auth-related localStorage
        localStorage.removeItem("figma_authenticated");
        localStorage.removeItem("figma_user");
        localStorage.removeItem("figma_user_id");
        localStorage.removeItem("figma_access_token");
        localStorage.removeItem("fleet_user");
        // Clear Figma API token
        figmaApi.setToken("");
        // Logout from context
        logout();
    };
    const handleAddPrototype = (prototypeData: any) => {
        // Parse author info - if it's a string from Figma API, create an author object
        let authorInfo;
        if (typeof prototypeData.author === "string") {
            const authorName = prototypeData.author;
            authorInfo = {
                name: authorName,
                initials:
                    authorName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2) || "U",
                avatar: undefined
            };
        } else if (prototypeData.author && typeof prototypeData.author === "object") {
            // Already an author object
            authorInfo = prototypeData.author;
        } else {
            // Fallback to current user
            authorInfo = {
                name: user?.name || "Unknown",
                initials: user?.initials || "U",
                avatar: user?.avatar
            };
        }

        addPrototype({
            title: prototypeData.title,
            description: prototypeData.problemSummary || prototypeData.description || "New prototype",
            author: authorInfo,
            thumbnail: prototypeData.thumbnail || "",
            experience: prototypeData.experiences || prototypeData.experience || ["all"],
            persona: prototypeData.personas || prototypeData.persona || ["Fleet Manager"],
            createdAt: "Just now",
            createdAtDate: new Date(),
            tags: prototypeData.tags || ["Prototype"],
            embedUrl: prototypeData.embedUrl,
            fileKey: prototypeData.fileKey,
            link: prototypeData.link
        });
        setShowAddModal(false);
    };

    const handlePrototypeClick = (prototype: any) => {
        const prototypeData: PrototypeData = {
            ...prototype,
            comments: prototype.comments || []
        };
        setSelectedPrototype(prototypeData);
        incrementViews(prototype.id);
    };

    const handleReaction = (reactionType: ReactionType) => {
        if (!selectedPrototype) return;
        toggleReaction(selectedPrototype.id, reactionType);

        // Update local state for modal
        const currentReaction = selectedPrototype.reactions[reactionType];
        setSelectedPrototype({
            ...selectedPrototype,
            reactions: {
                ...selectedPrototype.reactions,
                [reactionType]: {
                    ...currentReaction,
                    userReacted: !currentReaction.userReacted,
                    count: !currentReaction.userReacted ? currentReaction.count + 1 : Math.max(0, currentReaction.count - 1)
                }
            }
        });
    };

    const handleAddComment = (content: string) => {
        if (!selectedPrototype || !user) return;

        addComment(selectedPrototype.id, {
            author: {
                name: user.name,
                initials: user.initials,
                avatar: user.avatar
            },
            content
        });

        // Update local modal state
        setSelectedPrototype({
            ...selectedPrototype,
            comments: [
                ...selectedPrototype.comments,
                {
                    id: Date.now().toString(),
                    author: { name: user.name, initials: user.initials, avatar: user.avatar },
                    content,
                    timestamp: "just now"
                }
            ],
            commentCount: selectedPrototype.commentCount + 1
        });
    };

    // Get Figma access token from localStorage
    const figmaAccessToken = localStorage.getItem("figma_access_token") || "";

    return (
        <>
            {/* Auth Handler */}
            <FigmaAuthDirect onSuccess={handleAuthSuccess} onError={handleAuthError} />

            {/* Modals */}
            {isAuthenticated && (
                <AddPrototypeDialog onAdd={handleAddPrototype} isOpen={showAddModal} onOpenChange={setShowAddModal} figmaToken={figmaAccessToken} />
            )}
            <FullscreenPrototypeModal
                prototype={selectedPrototype}
                isOpen={!!selectedPrototype}
                onClose={() => setSelectedPrototype(null)}
                onReactionToggle={isAuthenticated ? handleReaction : undefined}
                onAddComment={isAuthenticated ? handleAddComment : undefined}
                isAuthenticated={isAuthenticated}
            />

            {/* Main Layout */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen bg-[#1e1e1e]">
                {/* Header */}
                <AppHeader
                    onAddPrototype={isAuthenticated ? () => setShowAddModal(true) : undefined}
                    onLogout={isAuthenticated ? handleLogout : undefined}
                    onLogin={!isAuthenticated ? initiateFigmaAuth : undefined}
                    isAuthenticated={isAuthenticated}
                />

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-[#1e1e1e] py-8 sm:py-12 lg:py-16"
                >
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Explore the Future of Fleet</h1>
                        <p className="text-base sm:text-lg lg:text-xl text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto">
                            Explore, share and get feedback on the latest design prototypes from our Design Teams
                        </p>

                        {/* Search Bar */}
                        <UnifiedSearchBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedPersona={persona}
                            onPersonaChange={setPersona}
                        />

                        {/* Experience Tabs */}
                        <div className="flex justify-center mt-6">
                            <div className="relative inline-flex items-center bg-[#2c2c2c] rounded-full p-1 border border-[#3e3e3e] gap-0.5 overflow-hidden">
                                {EXPERIENCES.map(exp => (
                                    <div key={exp} className="relative">
                                        {experience === exp && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-white rounded-full shadow-sm"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                        <Button
                                            variant="ghost"
                                            onClick={() => setExperience(exp)}
                                            className={`relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors ${
                                                experience === exp ? "text-black" : "text-white/70 hover:text-white hover:bg-white/10"
                                            }`}
                                        >
                                            {EXPERIENCE_LABELS[exp]}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Prototypes Section */}
                <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="px-4 sm:px-6 pb-12 sm:pb-16"
                >
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                                        {experience !== Experience.All ? EXPERIENCE_LABELS[experience] : "All"} Prototypes
                                    </h2>
                                    <p className="text-sm sm:text-base text-white/60">
                                        {filteredPrototypes.length} prototype{filteredPrototypes.length !== 1 ? "s" : ""}
                                        {persona !== "all" ? ` for ${persona}` : ""}
                                    </p>
                                </div>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-white/60 hidden sm:block">Sort by:</span>
                                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                                        <SelectTrigger className="w-[140px] bg-[#2c2c2c] border-[#3e3e3e] text-white hover:bg-[#3e3e3e]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#2c2c2c] border-[#3e3e3e] text-white">
                                            <SelectItem value={SortOption.Latest}>Latest</SelectItem>
                                            <SelectItem value={SortOption.Views}>Views</SelectItem>
                                            <SelectItem value={SortOption.Alphabetical}>Alphabetical</SelectItem>
                                            <SelectItem value={SortOption.MostLoved}>Most loved</SelectItem>
                                            <SelectItem value={SortOption.Trending}>Trending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <PrototypeGrid
                            searchQuery={searchQuery}
                            selectedExperience={experience}
                            selectedPersona={persona}
                            sortBy={sortBy}
                            onFilteredCountChange={() => {}}
                            onPrototypeClick={handlePrototypeClick}
                            prototypes={filteredPrototypes}
                            onPrototypesChange={() => {}}
                            onReactionToggle={isAuthenticated ? toggleReaction : undefined}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>
                </motion.main>
            </motion.div>
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <PrototypeProvider>
                <AppContent />
            </PrototypeProvider>
        </AuthProvider>
    );
}
