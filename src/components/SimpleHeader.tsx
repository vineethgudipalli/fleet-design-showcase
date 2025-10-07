import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import AddPrototypeDialog from "./AddPrototypeDialog";
import FigmaImportFlow from "./FigmaImportFlow";

interface SimpleHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddPrototype: (prototype: {
    title: string;
    link: string;
    thumbnail?: string;
  }) => void;
  onImportFromFigma: (prototype: {
    title: string;
    link: string;
    thumbnail: string;
    fileKey: string;
    embedUrl: string;
    problemSummary?: string;
    videoLink?: string;
  }) => void;
  onTokenSet: (token: string) => void;
  hasToken: boolean;
}

export default function SimpleHeader({ 
  searchQuery, 
  onSearchChange, 
  onAddPrototype, 
  onImportFromFigma,
  onTokenSet,
  hasToken 
}: SimpleHeaderProps) {
  return (
    <header className="bg-[#2c2c2c] border-b border-[#3e3e3e] px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">PS</span>
            </div>
            <h1 className="font-medium text-lg text-white">Prototype Studio</h1>
          </div>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input 
              placeholder="Search prototypes..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-80 bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FigmaImportFlow 
            onImport={onImportFromFigma} 
            onTokenSet={onTokenSet}
            hasToken={hasToken} 
          />
          <AddPrototypeDialog onAdd={onAddPrototype} />
        </div>
      </div>
    </header>
  );
}