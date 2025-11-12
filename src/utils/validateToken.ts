/**
 * Utility to validate Figma OAuth tokens
 *
 * Note: This utility is NOT used in the main authentication flow.
 * Token validation happens automatically when FigmaAuthDirect calls /v1/me
 * to fetch user information after OAuth token exchange.
 *
 * Use this utility for:
 * - Manual token validation in debugging/testing
 * - Checking token validity before critical operations
 * - Re-validating tokens after long idle periods
 */

/**
 * Checks if a Figma token is valid by calling the /me endpoint
 * @param token - The Figma access token to validate
 * @returns Promise with validation result, error message, and user data if valid
 */
export async function validateFigmaToken(token: string): Promise<{
    valid: boolean;
    error?: string;
    user?: { id: string; handle: string; email: string };
}> {
    if (!token) {
        return { valid: false, error: "No token provided" };
    }

    try {
        console.log("🔍 Validating token:", token.substring(0, 15) + "...");

        const response = await fetch("https://api.figma.com/v1/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Token validation failed:", response.status, errorText);

            // Parse error message
            let errorMessage = "Token validation failed";
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.err || errorData.message || errorMessage;
            } catch {
                errorMessage = errorText;
            }

            return {
                valid: false,
                error: `${response.status}: ${errorMessage}`
            };
        }

        const userData = await response.json();
        console.log("✅ Token is valid! User:", userData.handle || userData.email);

        return {
            valid: true,
            user: {
                id: userData.id,
                handle: userData.handle,
                email: userData.email
            }
        };
    } catch (error) {
        console.error("❌ Token validation error:", error);
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Unknown validation error"
        };
    }
}

/**
 * Gets the token expiration info
 * @param expiresIn - Number of seconds until expiration
 * @returns Object with expiration details
 */
export function getTokenExpirationInfo(expiresIn: number) {
    const expirationDate = new Date(Date.now() + expiresIn * 1000);
    const daysUntilExpiration = Math.floor(expiresIn / (60 * 60 * 24));

    return {
        expiresIn,
        expirationDate,
        daysUntilExpiration,
        isExpiringSoon: daysUntilExpiration < 7
    };
}
