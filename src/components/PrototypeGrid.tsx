import React, { useState } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircle, ExternalLink, Eye } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { EmptyPrototypeList } from "./EmptyPrototypeList";
import PrototypeReactions, { ReactionType, PrototypeReactions as PrototypeReactionsType } from "./PrototypeReactions";

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
    experience: string | string[];
    persona: string[];
    reactions: PrototypeReactionsType;
    commentCount: number;
    viewCount: number;
    createdAt: string;
    createdAtDate: Date;
    recentViews: number;
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
    prototypes?: Prototype[];
    onPrototypesChange?: (prototypes: Prototype[] | ((prev: Prototype[]) => Prototype[])) => void;
    onReactionToggle?: (prototypeId: string, reactionType: ReactionType) => void;
    isAuthenticated?: boolean;
}

export function PrototypeGrid({
    searchQuery,
    selectedExperience,
    selectedPersona,
    sortBy,
    onFilteredCountChange,
    onPrototypeClick,
    prototypes: externalPrototypes,
    onPrototypesChange,
    onReactionToggle,
    isAuthenticated = false
}: PrototypeGridProps) {
    const [internalPrototypes, setInternalPrototypes] = useState<Prototype[]>([]);

    const prototypes = externalPrototypes || internalPrototypes;
    const setPrototypes = onPrototypesChange || setInternalPrototypes;

    const handleReactionToggle = (prototypeId: string, reactionType: ReactionType) => {
        // If external handler is provided, use it (for context integration)
        if (onReactionToggle) {
            onReactionToggle(prototypeId, reactionType);
            return;
        }

        // Otherwise, use local state (fallback)
        setPrototypes((prevPrototypes: Prototype[]) =>
            prevPrototypes.map((prototype: Prototype) => {
                if (prototype.id !== prototypeId) return prototype;

                const currentReaction = prototype.reactions[reactionType];
                const newUserReacted = !currentReaction.userReacted;
                const newCount = newUserReacted ? currentReaction.count + 1 : Math.max(0, currentReaction.count - 1);

                return {
                    ...prototype,
                    reactions: {
                        ...prototype.reactions,
                        [reactionType]: {
                            ...currentReaction,
                            type: reactionType,
                            userReacted: newUserReacted,
                            count: newCount
                        }
                    }
                };
            })
        );
    };

    const filteredPrototypes = prototypes.filter((prototype: Prototype) => {
        const matchesSearch =
            searchQuery === "" ||
            prototype.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prototype.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prototype.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        // Handle both string and array formats for experience
        const matchesExperience =
            selectedExperience === "all" ||
            (Array.isArray(prototype.experience) ? prototype.experience.includes(selectedExperience) : prototype.experience === selectedExperience);

        const matchesPersona =
            selectedPersona === "all" || prototype.persona.some((p: string) => p.toLowerCase().includes(selectedPersona.toLowerCase()));

        return matchesSearch && matchesExperience && matchesPersona;
    });

    const sortedPrototypes = [...filteredPrototypes].sort((a, b) => {
        switch (sortBy) {
            case "latest":
                return b.createdAtDate.getTime() - a.createdAtDate.getTime();
            case "views":
                return b.viewCount - a.viewCount;
            case "alphabetical":
                return a.title.localeCompare(b.title);
            case "most-loved":
                const aLoveScore = a.reactions.heart.count + a.reactions.like.count + a.reactions.idea.count;
                const bLoveScore = b.reactions.heart.count + b.reactions.like.count + b.reactions.idea.count;
                return bLoveScore - aLoveScore;
            case "trending":
                return b.recentViews - a.recentViews;
            default:
                return 0;
        }
    });

    React.useEffect(() => {
        onFilteredCountChange(sortedPrototypes.length);
    }, [sortedPrototypes.length, onFilteredCountChange]);

    if (sortedPrototypes.length === 0) {
        const hasFilters = searchQuery !== "" || selectedExperience !== "all" || selectedPersona !== "all";
        return <EmptyPrototypeList hasFilters={hasFilters} />;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedPrototypes.map((prototype, index) => {
                console.log("Prototype:", prototype);
                return (
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
                            <div className="relative aspect-video bg-[#1e1e1e] overflow-hidden">
                                <ImageWithFallback
                                    src={prototype.thumbnail}
                                    alt={prototype.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />

                                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                    {(Array.isArray(prototype.experience) ? prototype.experience : [prototype.experience]).map((exp, idx) => (
                                        <Badge key={idx} className="bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90 text-xs">
                                            {exp.replace("-", " ").toUpperCase()}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-white/80" />
                                    <span className="text-xs text-white/80">{prototype.viewCount}</span>
                                </div>

                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Button size="sm" className="bg-white text-black hover:bg-white/90">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Prototype
                                    </Button>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white mb-1 truncate">{prototype.title}</h3>
                                        <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">{prototype.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-4">
                                    {prototype.tags.slice(0, 3).map((tag: string) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="bg-white/10 text-white/70 hover:bg-white/20 text-xs px-2 py-0.5"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src={prototype.author.avatar} />
                                            <AvatarFallback className="bg-[#0d99ff] text-white text-xs">{prototype.author.initials}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-white text-sm">{prototype.author.name}</p>
                                            <p className="text-white/50 text-xs">{prototype.createdAt}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-4">
                                    {prototype.persona.slice(0, 2).map((persona: string) => (
                                        <Badge key={persona} className="bg-[#0d99ff]/20 text-[#0d99ff] hover:bg-[#0d99ff]/30 text-xs px-2 py-0.5">
                                            {persona}
                                        </Badge>
                                    ))}
                                    {prototype.persona.length > 2 && (
                                        <Badge className="bg-white/10 text-white/50 text-xs px-2 py-0.5">+{prototype.persona.length - 2}</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-[#3e3e3e]">
                                    <PrototypeReactions
                                        reactions={prototype.reactions}
                                        onReact={
                                            isAuthenticated
                                                ? (reactionType: ReactionType) => handleReactionToggle(prototype.id, reactionType)
                                                : undefined
                                        }
                                    />

                                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-white/60 hover:text-white hover:bg-white/10">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span className="text-xs">{prototype.commentCount}</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}

export type { Prototype };
