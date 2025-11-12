import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
    name: string;
    email: string;
    initials: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    figmaUserId: string | null;
    login: (userInfo: { name: string; email: string; avatar?: string; id?: string }) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [figmaUserId, setFigmaUserId] = useState<string | null>(null);

    // Load persisted auth state on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("fleet_user");
        const storedFigmaUserId = localStorage.getItem("figma_user_id");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem("fleet_user");
            }
        }

        if (storedFigmaUserId) {
            setFigmaUserId(storedFigmaUserId);
        }
    }, []);

    const login = (userInfo: { name: string; email: string; avatar?: string; id?: string }) => {
        const newUser: User = {
            name: userInfo.name,
            email: userInfo.email,
            initials: userInfo.name
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase(),
            avatar: userInfo.avatar
        };

        setUser(newUser);
        localStorage.setItem("fleet_user", JSON.stringify(newUser));

        if (userInfo.id) {
            setFigmaUserId(userInfo.id);
            localStorage.setItem("figma_user_id", userInfo.id);
        }
    };

    const logout = () => {
        setUser(null);
        setFigmaUserId(null);
        localStorage.removeItem("fleet_user");
        localStorage.removeItem("figma_user_id");
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem("fleet_user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                figmaUserId,
                login,
                logout,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
