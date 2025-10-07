import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Zap, User, Compass, UserPlus, ShoppingBag, Settings, Headphones } from "lucide-react";

type Experience = "discover" | "onboard" | "shop" | "core-os" | "applications" | "growth" | "support";
type Persona = "Fleet Manager" | "Compliance Manager" | "Dispatcher" | "Safety Manager" | "Maintenance Manager" | "Asset Manager" | "IT Administrator" | "Owner/Operator" | "Driver" | "Technician";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedExperience: string;
  onExperienceChange: (experience: string) => void;
  selectedPersona: string;
  onPersonaChange: (persona: string) => void;
}

const experiences: Experience[] = [
  "discover",
  "onboard", 
  "shop",
  "core",
  "specialist",
  "support"
];

const personas: Persona[] = [
  "Fleet Manager",
  "Compliance Manager", 
  "Dispatcher",
  "Safety Manager",
  "Maintenance Manager",
  "Asset Manager",
  "IT Administrator", 
  "Owner/Operator",
  "Driver",
  "Technician"
];

const getExperienceIcon = (experience: Experience) => {
  switch (experience) {
    case "discover": return <Compass className="h-4 w-4" />;
    case "onboard": return <UserPlus className="h-4 w-4" />;
    case "shop": return <ShoppingBag className="h-4 w-4" />;
    case "core": return <Zap className="h-4 w-4" />;
    case "specialist": return <Settings className="h-4 w-4" />;
    case "support": return <Headphones className="h-4 w-4" />;
    default: return null;
  }
};

const getExperienceLabel = (experience: Experience) => {
  switch (experience) {
    case "discover": return "Discover";
    case "onboard": return "Onboard";
    case "shop": return "Shop";
    case "core": return "Core";
    case "specialist": return "Specialist";
    case "support": return "Support";
    default: return experience;
  }
};

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedExperience,
  onExperienceChange,
  selectedPersona,
  onPersonaChange
}: SearchAndFiltersProps) {
  return (
    <div className="max-w-5xl mx-auto mb-8">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
          <Input
            placeholder="Search prototypes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-14 text-lg bg-[#2c2c2c] border-[#3e3e3e] text-white placeholder:text-white/50 focus:border-blue-500 rounded-full"
          />
        </div>
        
        {/* Experience Filter */}
        <div className="flex items-center gap-2 bg-[#2c2c2c] rounded-full px-4 h-14 border border-[#3e3e3e]">
          <Zap className="h-5 w-5 text-white/50" />
          <Select value={selectedExperience} onValueChange={onExperienceChange}>
            <SelectTrigger className="w-40 bg-transparent border-none text-white h-auto p-0 gap-2">
              <SelectValue placeholder="Experiences" />
            </SelectTrigger>
            <SelectContent className="bg-[#2c2c2c] border-[#3e3e3e] text-white">
              <SelectItem value="all" className="text-white hover:bg-white/10">
                All Experiences
              </SelectItem>
              {experiences.map((experience) => (
                <SelectItem key={experience} value={experience} className="text-white hover:bg-white/10">
                  <div className="flex items-center gap-2">
                    {getExperienceIcon(experience)}
                    {getExperienceLabel(experience)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Persona Filter */}
        <div className="flex items-center gap-2 bg-[#2c2c2c] rounded-full px-4 h-14 border border-[#3e3e3e]">
          <User className="h-5 w-5 text-white/50" />
          <Select value={selectedPersona} onValueChange={onPersonaChange}>
            <SelectTrigger className="w-40 bg-transparent border-none text-white h-auto p-0 gap-2">
              <SelectValue placeholder="Personas" />
            </SelectTrigger>
            <SelectContent className="bg-[#2c2c2c] border-[#3e3e3e] text-white">
              <SelectItem value="all" className="text-white hover:bg-white/10">
                All Personas
              </SelectItem>
              {personas.map((persona) => (
                <SelectItem key={persona} value={persona} className="text-white hover:bg-white/10">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {persona}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}