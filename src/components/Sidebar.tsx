import { cn } from "./ui/utils";
import { 
  Home, 
  Folder, 
  Video, 
  Link, 
  Star, 
  Users, 
  Settings,
  Archive
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'all-prototypes', label: 'All Prototypes', icon: Folder },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'interactive', label: 'Interactive', icon: Link },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4">
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                activeSection === item.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-8 p-3 bg-accent/30 rounded-lg">
        <h3 className="font-medium mb-2">Quick Stats</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Total Prototypes</span>
            <span>24</span>
          </div>
          <div className="flex justify-between">
            <span>Team Members</span>
            <span>8</span>
          </div>
          <div className="flex justify-between">
            <span>This Month</span>
            <span>+6</span>
          </div>
        </div>
      </div>
    </aside>
  );
}