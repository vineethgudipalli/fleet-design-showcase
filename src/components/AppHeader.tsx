import { Button } from "./ui/button";
import { Plus, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { FigmaIcon } from "./figma/FigmaIcon";
import { useAuth } from "../contexts/AuthContext";

interface AppHeaderProps {
    onAddPrototype?: () => void;
    onLogout?: () => void;
    onLogin?: () => void;
    isAuthenticated: boolean;
}

export function AppHeader({ onAddPrototype, onLogout, onLogin, isAuthenticated }: AppHeaderProps) {
    const { user, logout: authLogout } = useAuth();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            authLogout();
        }
    };

    return (
        <header className="bg-[#2c2c2c] border-b border-[#3e3e3e] px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center">
                        <FigmaIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e1e1e]" />
                    </div>
                    <h1 className="text-white font-semibold text-sm sm:text-base">Fleet Design Showcase</h1>
                </div>

                {/* Right: Actions & User Menu */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Show Login button if not authenticated */}
                    {!isAuthenticated && onLogin && (
                        <Button onClick={onLogin} size="sm" className="bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90 gap-2">
                            <FigmaIcon className="w-4 h-4" />
                            <span>Continue with Figma</span>
                        </Button>
                    )}

                    {/* Show Add Prototype button only if authenticated */}
                    {isAuthenticated && onAddPrototype && (
                        <Button onClick={onAddPrototype} size="sm" className="bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Add Prototype</span>
                        </Button>
                    )}

                    {/* Show User Menu only if authenticated */}
                    {isAuthenticated && user && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-[#0d99ff] text-white text-xs">{user.initials}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 bg-[#2c2c2c] border-[#3e3e3e] p-3" align="end">
                                <div className="space-y-3">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback className="bg-[#0d99ff] text-white">{user.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{user.name}</p>
                                            <p className="text-white/60 text-xs truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    <Separator className="bg-[#3e3e3e]" />

                                    {/* Actions */}
                                    <Button
                                        onClick={handleLogout}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-white/70 hover:text-white hover:bg-[#3e3e3e]"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </header>
    );
}
