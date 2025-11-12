import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ReactionType } from "../components/PrototypeReactions";

export interface Prototype {
    id: string;
    title: string;
    description: string;
    author: {
        name: string;
        initials: string;
        avatar?: string;
    };
    thumbnail: string;
    experience: string | string[]; // Support both single and multiple experiences
    persona: string[];
    reactions: {
        heart: { type: ReactionType; count: number; userReacted: boolean };
        like: { type: ReactionType; count: number; userReacted: boolean };
        idea: { type: ReactionType; count: number; userReacted: boolean };
    };
    commentCount: number;
    viewCount: number;
    createdAt: string;
    createdAtDate: Date;
    recentViews: number;
    tags: string[];
    embedUrl?: string;
    fileKey?: string;
    link?: string;
    comments?: Array<{
        id: string;
        author: { name: string; initials: string; avatar?: string };
        content: string;
        timestamp: string;
    }>;
}

interface PrototypeContextType {
    prototypes: Prototype[];
    addPrototype: (prototype: Omit<Prototype, "id" | "reactions" | "commentCount" | "viewCount" | "recentViews">) => void;
    updatePrototype: (id: string, updates: Partial<Prototype>) => void;
    deletePrototype: (id: string) => void;
    toggleReaction: (prototypeId: string, reactionType: ReactionType) => void;
    addComment: (prototypeId: string, comment: { author: { name: string; initials: string; avatar?: string }; content: string }) => void;
    incrementViews: (prototypeId: string) => void;
}

const PrototypeContext = createContext<PrototypeContextType | undefined>(undefined);

const STORAGE_KEY = "fleet_prototypes";

// Load prototypes from localStorage
const loadPrototypesFromStorage = (): Prototype[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert createdAtDate back to Date object
            return parsed.map((p: any) => ({
                ...p,
                createdAtDate: new Date(p.createdAtDate)
            }));
        }
    } catch (error) {
        // Silent fail
    }
    return [];
};

// Save prototypes to localStorage
const savePrototypesToStorage = (prototypes: Prototype[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prototypes));
    } catch (error) {
        // Silent fail
    }
};

export function PrototypeProvider({ children }: { children: ReactNode }) {
    const [prototypes, setPrototypes] = useState<Prototype[]>(loadPrototypesFromStorage());

    // Save to localStorage whenever prototypes change
    useEffect(() => {
        savePrototypesToStorage(prototypes);
    }, [prototypes]);

    const addPrototype = (prototypeData: Omit<Prototype, "id" | "reactions" | "commentCount" | "viewCount" | "recentViews">) => {
        const newPrototype: Prototype = {
            ...prototypeData,
            id: Date.now().toString(),
            reactions: {
                heart: { type: "heart", count: 0, userReacted: false },
                like: { type: "like", count: 0, userReacted: false },
                idea: { type: "idea", count: 0, userReacted: false }
            },
            commentCount: 0,
            viewCount: 0,
            recentViews: 0
        };

        setPrototypes(prev => [newPrototype, ...prev]);
    };

    const updatePrototype = (id: string, updates: Partial<Prototype>) => {
        setPrototypes(prev => prev.map(prototype => (prototype.id === id ? { ...prototype, ...updates } : prototype)));
    };

    const deletePrototype = (id: string) => {
        setPrototypes(prev => prev.filter(prototype => prototype.id !== id));
    };

    const toggleReaction = (prototypeId: string, reactionType: ReactionType) => {
        setPrototypes(prev =>
            prev.map(prototype => {
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
                            userReacted: newUserReacted,
                            count: newCount
                        }
                    }
                };
            })
        );
    };

    const addComment = (prototypeId: string, comment: { author: { name: string; initials: string; avatar?: string }; content: string }) => {
        setPrototypes(prev =>
            prev.map(prototype => {
                if (prototype.id !== prototypeId) return prototype;

                const newComment = {
                    id: Date.now().toString(),
                    ...comment,
                    timestamp: "just now"
                };

                return {
                    ...prototype,
                    comments: [...(prototype.comments || []), newComment],
                    commentCount: prototype.commentCount + 1
                };
            })
        );
    };

    const incrementViews = (prototypeId: string) => {
        setPrototypes(prev =>
            prev.map(prototype =>
                prototype.id === prototypeId
                    ? {
                          ...prototype,
                          viewCount: prototype.viewCount + 1,
                          recentViews: prototype.recentViews + 1
                      }
                    : prototype
            )
        );
    };

    return (
        <PrototypeContext.Provider
            value={{
                prototypes,
                addPrototype,
                updatePrototype,
                deletePrototype,
                toggleReaction,
                addComment,
                incrementViews
            }}
        >
            {children}
        </PrototypeContext.Provider>
    );
}

export function usePrototypes() {
    const context = useContext(PrototypeContext);
    if (context === undefined) {
        throw new Error("usePrototypes must be used within a PrototypeProvider");
    }
    return context;
}
