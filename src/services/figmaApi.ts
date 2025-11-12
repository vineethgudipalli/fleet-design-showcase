// Figma API service for fetching project data using the official Figma REST API spec
import type { GetFileResponse, GetFileMetaResponse, GetImagesResponse, GetTeamProjectsResponse, GetProjectFilesResponse } from "@figma/rest-api-spec";

export interface FigmaFile {
    key: string;
    name: string;
    thumbnail_url: string;
    last_modified: string;
    version: string;
}

export interface FigmaProject {
    id: string;
    name: string;
    files: FigmaFile[];
}

export interface FigmaPage {
    id: string;
    name: string;
    type: string;
}

export interface FigmaPrototype {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    embedUrl: string;
    lastModified: string;
    version: string;
    fileKey: string;
    author?: string;
}

class FigmaApiService {
    private baseUrl = "https://api.figma.com/v1";
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;

        // Validate token format
        const tokenPrefix = token.substring(0, 5);
        const isOAuthToken = tokenPrefix === "figu_"; // OAuth user access token
        const isRefreshToken = tokenPrefix === "figr_"; // OAuth refresh token
        const isPersonalToken = tokenPrefix === "figo_"; // Personal access token

        console.log("🔑 Figma API token set:", token ? `${token.substring(0, 10)}...` : "Empty token!");

        if (isOAuthToken) {
            console.log("✅ Valid OAuth user access token detected (figu_)");
        } else if (isRefreshToken) {
            console.warn("⚠️ WARNING: This is a refresh token (figr_), not an access token!");
            console.warn("⚠️ Use the access token (figu_) for API requests.");
        } else if (isPersonalToken) {
            console.warn("⚠️ WARNING: Personal access token detected (figo_)");
            console.warn("⚠️ Personal tokens may have limited access. OAuth tokens (figu_) are recommended.");
        } else {
            console.warn("⚠️ Unknown token format. Expected: figu_ (OAuth access) or figo_ (Personal)");
        }
    }

    // Parse Figma URL to extract file key and node ID
    parseUrl(url: string): { fileKey: string | null; nodeId: string | null } {
        try {
            const cleanUrl = url.trim();

            // Match various Figma URL patterns
            const fileKeyPatterns = [
                /(?:www\.)?figma\.com\/file\/([a-zA-Z0-9]+)/, // /file/{fileKey}
                /(?:www\.)?figma\.com\/proto\/([a-zA-Z0-9]+)/, // /proto/{fileKey}
                /(?:www\.)?figma\.com\/design\/([a-zA-Z0-9]+)/ // /design/{fileKey}
            ];

            let fileKey: string | null = null;
            for (const pattern of fileKeyPatterns) {
                const match = cleanUrl.match(pattern);
                if (match) {
                    fileKey = match[1];
                    break;
                }
            }

            // Extract node ID from URL if present
            let nodeId: string | null = null;
            const nodeIdMatch = cleanUrl.match(/node-id=([^&]+)/);
            if (nodeIdMatch) {
                // Convert from URL format (1-2) to API format (1:2)
                nodeId = nodeIdMatch[1].replace("-", ":");
            }

            return { fileKey, nodeId };
        } catch (error) {
            console.error("Error parsing Figma URL:", error);
            return { fileKey: null, nodeId: null };
        }
    }

    private async request<T>(endpoint: string): Promise<T> {
        if (!this.token) {
            throw new Error("Authentication required. Please log in with Figma.");
        }

        console.log(`🌐 Making request to: ${this.baseUrl}${endpoint}`);
        console.log(`🔑 Using token: ${this.token.substring(0, 10)}...`);

        let response: Response;

        try {
            response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
        } catch (error) {
            // Network errors or other issues
            if (error instanceof TypeError && error.message.includes("fetch")) {
                throw new Error("Network error. Please check your internet connection.");
            }
            throw new Error(`Failed to connect to Figma API: ${error instanceof Error ? error.message : "Unknown error"}`);
        }

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorText);

            // Provide specific error messages based on status code
            switch (response.status) {
                case 401:
                    throw new Error("Authentication failed. Your Figma token may have expired. Please log in again.");
                case 403:
                    throw new Error("Access denied. You don't have permission to access this Figma file.");
                case 404:
                    throw new Error("File not found. The Figma file may have been deleted or the URL is incorrect.");
                case 429:
                    throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
                case 500:
                case 502:
                case 503:
                    throw new Error("Figma service is temporarily unavailable. Please try again later.");
                default:
                    throw new Error(`Figma API error (${response.status}): ${response.statusText}`);
            }
        }

        const data = await response.json();
        console.log("API Response data:", data);
        return data;
    }

    async getFile(fileKey: string): Promise<GetFileResponse> {
        return this.request<GetFileResponse>(`/files/${fileKey}`);
    }

    /**
     * Get lightweight file metadata without the full document structure
     * More efficient than getFile() when you only need basic info
     */
    async getFileMeta(fileKey: string): Promise<GetFileMetaResponse> {
        return this.request<GetFileMetaResponse>(`/files/${fileKey}/meta`);
    }

    async getFileImages(fileKey: string, nodeIds: string[], options = { format: "png" as const, scale: 2 }): Promise<GetImagesResponse> {
        const params = new URLSearchParams({
            ids: nodeIds.join(","),
            format: options.format,
            scale: options.scale.toString()
        });
        return this.request<GetImagesResponse>(`/images/${fileKey}?${params}`);
    }

    async getTeamProjects(teamId: string): Promise<FigmaProject[]> {
        try {
            const response = await this.request<GetTeamProjectsResponse>(`/teams/${teamId}/projects`);
            return response.projects.map((project: any) => ({
                id: project.id,
                name: project.name,
                files: []
            }));
        } catch (error) {
            console.error("Error fetching team projects:", error);
            throw error;
        }
    }

    async getProjectFiles(projectId: string): Promise<FigmaFile[]> {
        try {
            const response = await this.request<GetProjectFilesResponse>(`/projects/${projectId}/files`);
            return response.files.map((file: any) => ({
                key: file.key,
                name: file.name,
                thumbnail_url: file.thumbnail_url || "",
                last_modified: file.last_modified,
                version: ""
            }));
        } catch (error) {
            console.error("Error fetching project files:", error);
            throw error;
        }
    }

    async getFilePages(fileKey: string): Promise<FigmaPage[]> {
        try {
            const fileData = await this.getFile(fileKey);

            if (!fileData.document || !fileData.document.children) {
                return [];
            }

            return fileData.document.children
                .filter((child: any) => child.type === "CANVAS")
                .map((page: any) => ({
                    id: page.id,
                    name: page.name,
                    type: page.type
                }));
        } catch (error) {
            console.error("Error fetching file pages:", error);
            return [];
        }
    }

    async getFileDetails(fileKey: string): Promise<FigmaPrototype | null> {
        try {
            const fileData = await this.getFile(fileKey);

            // Get thumbnail
            let thumbnailUrl = "";
            try {
                const images = await this.getFileImages(fileKey, [fileData.document.id]);
                thumbnailUrl = images.images[fileData.document.id] || "";
            } catch (thumbnailError) {
                console.warn("Could not fetch thumbnail:", thumbnailError);
            }

            // Extract author information - Note: GetFileResponse may not have creator field
            const author = "Unknown Author"; // Figma API spec may not include creator info

            return {
                id: fileData.document.id,
                name: fileData.name,
                description: "", // GetFileResponse may not have description field
                thumbnail: thumbnailUrl,
                embedUrl: `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${fileKey}`,
                lastModified: fileData.lastModified,
                version: fileData.version,
                fileKey: fileKey,
                author: author
            };
        } catch (error) {
            console.error("Error fetching file details:", error);
            return null;
        }
    }

    // Fetch file metadata from a Figma URL
    async getFileDetailsFromUrl(url: string): Promise<{
        title: string;
        description: string;
        thumbnail: string;
        fileKey: string;
        nodeId: string | null;
        embedUrl: string;
        author: {
            name: string;
            avatar?: string;
            initials: string;
        };
    } | null> {
        try {
            const { fileKey, nodeId } = this.parseUrl(url);

            if (!fileKey) {
                throw new Error("Invalid Figma URL: Could not extract file key");
            }

            // Token is required for fetching file details
            if (!this.token) {
                console.error("❌ No authentication token available for API request");
                throw new Error("Authentication required. Please log in with Figma to import prototypes.");
            }

            // For authenticated requests, use the official Figma API
            try {
                const response = await this.getFileMeta(fileKey);
                // The actual API returns { file: { ... } } but the type definition has properties at root
                // Cast to any to access the actual response structure
                const fileData = (response as any).file || response;
                console.log("📄 Fetched file metadata:", fileData.name);

                // Use the thumbnail_url provided by the meta endpoint (if available)
                let thumbnailUrl = fileData.thumbnail_url || "";
                console.log("🎨 Thumbnail URL from meta:", thumbnailUrl || "None provided");

                // If no thumbnail from meta, try to generate one for the specific node
                if (!thumbnailUrl && nodeId) {
                    try {
                        console.log("�️ Attempting to generate thumbnail for node:", nodeId);
                        const images = await this.getFileImages(fileKey, [nodeId], { format: "png", scale: 1 });
                        thumbnailUrl = images.images[nodeId] || "";
                        console.log("✅ Generated thumbnail for node:", thumbnailUrl ? "Success" : "Failed");
                    } catch (thumbnailError) {
                        console.warn("❌ Could not generate thumbnail for node:", thumbnailError);
                    }
                }

                // Extract title from meta response
                const title = fileData.name || "Untitled Prototype";
                const description = ""; // Meta endpoint doesn't include description field

                // Get author information from the creator field in meta response
                // The creator object has: id, handle, img_url
                const authorName = fileData.creator?.handle || fileData.creator?.email || "Figma User";
                const authorAvatar = fileData.creator?.img_url;
                const authorInitials =
                    authorName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2) || "U";

                console.log("👤 File creator:", authorName, "Avatar:", authorAvatar);

                // Generate appropriate embed URL using embed.figma.com
                let embedUrl = "";
                if (url.includes("/proto/")) {
                    // For prototype URLs, use embed.figma.com format
                    if (nodeId) {
                        embedUrl = `https://embed.figma.com/proto/${fileKey}?node-id=${nodeId.replace(":", "-")}&embed-host=share`;
                    } else {
                        embedUrl = `https://embed.figma.com/proto/${fileKey}?embed-host=share`;
                    }
                } else if (nodeId) {
                    // If we have a specific node in a file URL
                    embedUrl = `https://embed.figma.com/design/${fileKey}?node-id=${nodeId.replace(":", "-")}&embed-host=share`;
                } else {
                    // Otherwise, use the file embed URL
                    embedUrl = `https://embed.figma.com/design/${fileKey}?embed-host=share`;
                }

                return {
                    title,
                    description,
                    thumbnail: thumbnailUrl,
                    fileKey,
                    nodeId,
                    embedUrl,
                    author: {
                        name: authorName,
                        avatar: authorAvatar,
                        initials: authorInitials
                    }
                };
            } catch (apiError) {
                console.warn("Figma API request failed, using fallback:", apiError);

                // Fallback to URL extraction if API fails
                const urlParts = url.split("/");
                const fileIndex = urlParts.findIndex(part => part === "file" || part === "proto" || part === "design");
                let extractedTitle = "Figma Prototype";

                if (fileIndex !== -1 && urlParts[fileIndex + 2]) {
                    extractedTitle = decodeURIComponent(urlParts[fileIndex + 2])
                        .replace(/-/g, " ")
                        .replace(/\?.*$/, "");
                }

                let embedUrl = "";
                if (url.includes("/proto/")) {
                    // For prototype URLs, use embed.figma.com format
                    if (nodeId) {
                        embedUrl = `https://embed.figma.com/proto/${fileKey}?node-id=${nodeId.replace(":", "-")}&embed-host=share`;
                    } else {
                        embedUrl = `https://embed.figma.com/proto/${fileKey}?embed-host=share`;
                    }
                } else if (nodeId) {
                    embedUrl = `https://embed.figma.com/design/${fileKey}?node-id=${nodeId.replace(":", "-")}&embed-host=share`;
                } else {
                    embedUrl = `https://embed.figma.com/design/${fileKey}?embed-host=share`;
                }

                return {
                    title: extractedTitle,
                    description: "Imported from Figma URL",
                    thumbnail: "",
                    fileKey,
                    nodeId,
                    embedUrl,
                    author: {
                        name: "Unknown",
                        initials: "U"
                    }
                };
            }
        } catch (error) {
            console.error("Error fetching file details from URL:", error);
            return null;
        }
    }

    async getUserRecentFiles(): Promise<FigmaFile[]> {
        try {
            // Note: The Figma API doesn't have a direct recent files endpoint
            // This would require fetching user's teams and their files
            console.warn("Recent files functionality requires team access - not implemented");
            return [];
        } catch (error) {
            console.error("Error fetching recent files:", error);
            return [];
        }
    }

    async searchFiles(_query: string, _teamId?: string): Promise<FigmaFile[]> {
        try {
            // Note: Figma API doesn't have a direct search endpoint
            // This would need to be implemented by fetching team files and filtering
            console.warn("Search functionality requires team access and filtering - not implemented");
            return [];
        } catch (error) {
            console.error("Error searching files:", error);
            return [];
        }
    }

    // Generate embed URL for prototype viewing
    getEmbedUrl(fileKey: string, nodeId?: string): string {
        let url = `https://embed.figma.com/proto/${fileKey}?embed-host=share`;
        if (nodeId) {
            url += `&node-id=${nodeId.replace(":", "-")}`;
        }
        return url;
    }
}

export const figmaApi = new FigmaApiService();
