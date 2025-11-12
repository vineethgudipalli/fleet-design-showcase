import { useMemo } from "react";
import { Prototype } from "../contexts/PrototypeContext";
import { Experience, Persona, SortOption } from "../types";

interface UsePrototypeFilterOptions {
    prototypes: Prototype[];
    searchQuery: string;
    experience: Experience;
    persona: Persona | string;
    sortBy: SortOption;
}

export function usePrototypeFilter({ prototypes, searchQuery, experience, persona, sortBy }: UsePrototypeFilterOptions) {
    const filteredAndSortedPrototypes = useMemo(() => {
        let filtered = [...prototypes];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                p =>
                    p.title.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.author.name.toLowerCase().includes(query) ||
                    p.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply experience filter
        if (experience !== Experience.All) {
            filtered = filtered.filter(p => (Array.isArray(p.experience) ? p.experience.includes(experience) : p.experience === experience));
        }

        // Apply persona filter
        if (persona !== Persona.All && persona !== "all") {
            filtered = filtered.filter(p => p.persona.includes(persona));
        }

        // Apply sorting
        switch (sortBy) {
            case SortOption.Latest:
                filtered.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());
                break;
            case SortOption.Views:
                filtered.sort((a, b) => b.viewCount - a.viewCount);
                break;
            case SortOption.Alphabetical:
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case SortOption.MostLoved:
                filtered.sort((a, b) => {
                    const aLoves = a.reactions.heart.count + a.reactions.like.count;
                    const bLoves = b.reactions.heart.count + b.reactions.like.count;
                    return bLoves - aLoves;
                });
                break;
            case SortOption.Trending:
                filtered.sort((a, b) => b.recentViews - a.recentViews);
                break;
        }

        return filtered;
    }, [prototypes, searchQuery, experience, persona, sortBy]);

    return filteredAndSortedPrototypes;
}
