// Experience Categories
export enum Experience {
    All = "all",
    Discover = "discover",
    Onboard = "onboard",
    Shop = "shop",
    CoreOS = "core-os",
    Applications = "applications",
    Growth = "growth",
    Support = "support"
}

// Persona Types
export enum Persona {
    All = "all",
    AssetManager = "Asset Manager",
    ComplianceManager = "Compliance Manager",
    Dispatcher = "Dispatcher",
    Driver = "Driver",
    FleetManager = "Fleet Manager",
    ITAdministrator = "IT Administrator",
    MaintenanceManager = "Maintenance Manager",
    OwnerOperator = "Owner/Operator",
    SafetyManager = "Safety Manager",
    SustainabilityManager = "Sustainability Manager",
    Technician = "Technician"
}

// Experience Labels for UI Display
export const EXPERIENCE_LABELS: Record<Experience, string> = {
    [Experience.All]: "All",
    [Experience.Discover]: "Discover",
    [Experience.Onboard]: "Onboard",
    [Experience.Shop]: "Shop",
    [Experience.CoreOS]: "Core OS",
    [Experience.Applications]: "Applications",
    [Experience.Growth]: "Growth",
    [Experience.Support]: "Support"
};

// Persona Labels (same as enum values for display)
export const PERSONA_LABELS: Record<Persona, string> = {
    [Persona.All]: "All Personas",
    [Persona.AssetManager]: "Asset Manager",
    [Persona.ComplianceManager]: "Compliance Manager",
    [Persona.Dispatcher]: "Dispatcher",
    [Persona.Driver]: "Driver",
    [Persona.FleetManager]: "Fleet Manager",
    [Persona.ITAdministrator]: "IT Administrator",
    [Persona.MaintenanceManager]: "Maintenance Manager",
    [Persona.OwnerOperator]: "Owner/Operator",
    [Persona.SafetyManager]: "Safety Manager",
    [Persona.SustainabilityManager]: "Sustainability Manager",
    [Persona.Technician]: "Technician"
};

// Helper arrays for iteration
export const EXPERIENCES = Object.values(Experience);
export const PERSONAS = Object.values(Persona);

// Sort options for prototypes
export enum SortOption {
    Latest = "latest",
    Views = "views",
    Alphabetical = "alphabetical",
    MostLoved = "most-loved",
    Trending = "trending"
}

export const SORT_LABELS: Record<SortOption, string> = {
    [SortOption.Latest]: "Latest",
    [SortOption.Views]: "Views",
    [SortOption.Alphabetical]: "Alphabetical",
    [SortOption.MostLoved]: "Most loved",
    [SortOption.Trending]: "Trending"
};
