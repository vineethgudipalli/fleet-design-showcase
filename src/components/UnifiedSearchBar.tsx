import { useState } from "react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Search, Users, Shield, Radio, AlertTriangle, Wrench, Package, Server, Crown, Car, Leaf, Settings } from "lucide-react";

type Persona = "Fleet Manager" | "Compliance Manager" | "Dispatcher" | "Safety Manager" | "Maintenance Manager" | "Asset Manager" | "IT Administrator" | "Owner/Operator" | "Driver" | "Technician" | "Sustainability Manager";

interface UnifiedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPersona: string;
  onPersonaChange: (persona: string) => void;
}

const personas: Persona[] = [
  "Asset Manager",
  "Compliance Manager",
  "Dispatcher",
  "Driver",
  "Fleet Manager",
  "IT Administrator",
  "Maintenance Manager",
  "Owner/Operator",
  "Safety Manager",
  "Sustainability Manager",
  "Technician"
];

const getPersonaIcon = (persona: Persona) => {
  switch (persona) {
    case "Fleet Manager": return <Users className="h-4 w-4" />;
    case "Compliance Manager": return <Shield className="h-4 w-4" />;
    case "Dispatcher": return <Radio className="h-4 w-4" />;
    case "Safety Manager": return <AlertTriangle className="h-4 w-4" />;
    case "Maintenance Manager": return <Wrench className="h-4 w-4" />;
    case "Asset Manager": return <Package className="h-4 w-4" />;
    case "IT Administrator": return <Server className="h-4 w-4" />;
    case "Owner/Operator": return <Crown className="h-4 w-4" />;
    case "Driver": return <Car className="h-4 w-4" />;
    case "Technician": return <Settings className="h-4 w-4" />;
    case "Sustainability Manager": return <Leaf className="h-4 w-4" />;
    default: return <Users className="h-4 w-4" />;
  }
};

export default function UnifiedSearchBar({
  searchQuery,
  onSearchChange,
  selectedPersona,
  onPersonaChange
}: UnifiedSearchBarProps) {
  return (
    <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
      {/* Mobile: Stacked Layout */}
      <div className="block lg:hidden">
        <div className="space-y-3">
          {/* Search Input */}
          <div className="bg-[#2c2c2c] rounded-full border border-[#3e3e3e] p-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3">
                <Input
                  placeholder="Search prototypes..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="border-none p-0 placeholder:text-white/50 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white text-base"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0 flex-shrink-0 mr-1"
                >
                  <motion.div
                    animate={{
                      rotate: searchQuery ? [0, 360] : 0
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    <Search className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* Persona Filter */}
          <div className="bg-[#2c2c2c] rounded-lg border border-[#3e3e3e] p-3">
            <Select value={selectedPersona} onValueChange={onPersonaChange}>
              <SelectTrigger className="border-none p-0 h-auto bg-transparent focus:ring-0 focus:ring-offset-0 text-white text-sm">
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent className="bg-[#2c2c2c] border-[#3e3e3e] text-white">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Personas
                  </div>
                </SelectItem>
                {personas.map((persona) => (
                  <SelectItem key={persona} value={persona} className="text-white hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      {getPersonaIcon(persona)}
                      {persona}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal Layout */}
      <div className="hidden lg:block">
        <div className="bg-[#2c2c2c] border border-[#3e3e3e] p-1 flex items-center gap-1" style={{ borderRadius: '16px' }}>
          {/* Search Section */}
          <div className="flex-1 px-6 py-3 border-r border-[#3e3e3e]/50">
            <Input
              placeholder="Search prototypes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-none p-0 placeholder:text-white/50 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
            />
          </div>
          
          {/* Personas Section */}
          <div className="px-6 py-3 min-w-[200px]">
            <Select value={selectedPersona} onValueChange={onPersonaChange}>
              <SelectTrigger className="border-none p-0 h-auto bg-transparent focus:ring-0 focus:ring-offset-0 text-white">
                <SelectValue placeholder="Filter by Persona" />
              </SelectTrigger>
              <SelectContent className="bg-[#2c2c2c] border-[#3e3e3e] text-white">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Personas
                  </div>
                </SelectItem>
                {personas.map((persona) => (
                  <SelectItem key={persona} value={persona} className="text-white hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      {getPersonaIcon(persona)}
                      {persona}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search Button */}
          <Button 
            size="lg"
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white h-12 w-12 p-0 flex-shrink-0"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}