import { useEffect } from "react";

interface FigmaAuthDirectProps {
    onSuccess?: (data: { id: string; name: string; email: string; avatar?: string }) => void;
    onError?: (error: string) => void;
}

export function FigmaAuthDirect({ onSuccess, onError }: FigmaAuthDirectProps) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (code && state) {
            const savedState = sessionStorage.getItem("figma_oauth_state");
            if (savedState && savedState === state) {
                handleOAuthCallback(code);
                window.history.replaceState({}, "", "/");
            } else {
                onError?.("Invalid OAuth state. Possible CSRF attack.");
                window.history.replaceState({}, "", "/");
            }
        }
    }, [onSuccess, onError]);

    const handleOAuthCallback = async (code: string) => {
        try {
            const FIGMA_CLIENT_ID = import.meta.env.VITE_FIGMA_CLIENT_ID;
            const FIGMA_CLIENT_SECRET = import.meta.env.VITE_FIGMA_CLIENT_SECRET;
            const FIGMA_REDIRECT_URI = import.meta.env.VITE_FIGMA_REDIRECT_URI;

            const codeVerifier = sessionStorage.getItem("figma_code_verifier");
            if (!codeVerifier) {
                throw new Error("Code verifier not found. Please try logging in again.");
            }

            const basicAuth = btoa(`${FIGMA_CLIENT_ID}:${FIGMA_CLIENT_SECRET}`);

            const formData = new URLSearchParams({
                redirect_uri: FIGMA_REDIRECT_URI,
                code: code,
                grant_type: "authorization_code",
                code_verifier: codeVerifier
            });

            const tokenResponse = await fetch("https://api.figma.com/v1/oauth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${basicAuth}`
                },
                body: formData.toString()
            });

            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                console.error("Token exchange failed:", errorText);
                throw new Error("Failed to exchange code for token");
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            sessionStorage.removeItem("figma_code_verifier");

            const userResponse = await fetch("https://api.figma.com/v1/me", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!userResponse.ok) {
                throw new Error("Failed to fetch user information from Figma");
            }

            const userData = await userResponse.json();

            localStorage.setItem("figma_user_id", userData.id);
            localStorage.setItem("figma_authenticated", "true");
            localStorage.setItem("figma_user", JSON.stringify(userData));
            localStorage.setItem("figma_access_token", accessToken);

            const userInfo = {
                id: userData.id,
                name: userData.handle || userData.email || "Figma User",
                email: userData.email,
                avatar: userData.img_url
            };

            onSuccess?.(userInfo);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : "Failed to authenticate with Figma");
        }
    };

    return null;
}

function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    return base64;
}

export async function initiateFigmaAuth() {
    const FIGMA_CLIENT_ID = import.meta.env.VITE_FIGMA_CLIENT_ID;
    const FIGMA_REDIRECT_URI = import.meta.env.VITE_FIGMA_REDIRECT_URI;

    if (!FIGMA_CLIENT_ID) {
        return;
    }

    const state = crypto.randomUUID();
    sessionStorage.setItem("figma_oauth_state", state);

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    sessionStorage.setItem("figma_code_verifier", codeVerifier);

    const params = new URLSearchParams({
        client_id: FIGMA_CLIENT_ID,
        redirect_uri: FIGMA_REDIRECT_URI,
        scope: "current_user:read file_content:read file_metadata:read",
        state: state,
        response_type: "code",
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
    });

    const authUrl = `https://www.figma.com/oauth?${params.toString()}`;

    window.location.href = authUrl;
}
