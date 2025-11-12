export async function exchangeCodeForToken(code: string) {
    const FIGMA_CLIENT_ID = import.meta.env.VITE_FIGMA_CLIENT_ID;
    const FIGMA_CLIENT_SECRET = import.meta.env.FIGMA_CLIENT_SECRET;
    const FIGMA_REDIRECT_URI = import.meta.env.VITE_FIGMA_REDIRECT_URI;

    const response = await fetch("https://www.figma.com/api/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: FIGMA_CLIENT_ID || "",
            client_secret: FIGMA_CLIENT_SECRET || "",
            redirect_uri: FIGMA_REDIRECT_URI || "",
            code,
            grant_type: "authorization_code"
        })
    });

    if (!response.ok) {
        throw new Error("Token exchange failed");
    }

    return await response.json();
}

export async function getFigmaUserInfo(accessToken: string) {
    const response = await fetch("https://api.figma.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) throw new Error("Failed to fetch user info");
    return await response.json();
}

export async function getFileMetadata(accessToken: string, fileKey: string) {
    if (!accessToken || !fileKey) {
        throw new Error("Access token and file key required");
    }

    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/meta`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid or expired token");
        if (response.status === 403) throw new Error("Access denied");
        if (response.status === 404) throw new Error("File not found");
        throw new Error("Failed to fetch file metadata");
    }

    const data = await response.json();

    // The API returns { file: { ... } } structure
    // Return the file object directly with all its properties
    return data.file;
}
