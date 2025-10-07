// Figma API service for fetching project data
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
  private baseUrl = 'https://api.figma.com/v1';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }



  private async request(endpoint: string) {
    if (!this.token) {
      throw new Error('Figma token not set');
    }

    console.log(`Making request to: ${this.baseUrl}${endpoint}`);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Figma-Token': this.token,
      },
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Figma API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  }

  async getTeamProjects(teamId: string): Promise<FigmaProject[]> {
    try {
      const data = await this.request(`/teams/${teamId}/projects`);
      if (!data.projects || !Array.isArray(data.projects)) {
        console.error('Invalid projects response:', data);
        throw new Error('Invalid response format from Figma API');
      }
      return data.projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        files: []
      }));
    } catch (error) {
      console.error('Error fetching team projects:', error);
      throw error;
    }
  }

  async getProjectFiles(projectId: string): Promise<FigmaFile[]> {
    try {
      const data = await this.request(`/projects/${projectId}/files`);
      if (!data.files || !Array.isArray(data.files)) {
        console.error('Invalid files response:', data);
        throw new Error('Invalid response format from Figma API');
      }
      return data.files.map((file: any) => ({
        key: file.key,
        name: file.name,
        thumbnail_url: file.thumbnail_url,
        last_modified: file.last_modified,
        version: file.version
      }));
    } catch (error) {
      console.error('Error fetching project files:', error);
      throw error;
    }
  }

  async getFilePages(fileKey: string): Promise<FigmaPage[]> {
    try {
      const data = await this.request(`/files/${fileKey}`);
      if (!data.document || !data.document.children) {
        return [];
      }
      
      return data.document.children
        .filter((child: any) => child.type === 'CANVAS')
        .map((page: any) => ({
          id: page.id,
          name: page.name,
          type: page.type
        }));
    } catch (error) {
      console.error('Error fetching file pages:', error);
      return [];
    }
  }

  async getFileDetails(fileKey: string): Promise<FigmaPrototype | null> {
    try {
      const data = await this.request(`/files/${fileKey}`);
      
      // Get thumbnail
      const thumbnailData = await this.request(
        `/images/${fileKey}?ids=${data.document.id}&format=png&scale=2`
      );

      // Extract author information - Figma API returns the file creator's handle
      const author = data.creator?.handle || data.creator?.name || 'Unknown Author';
      
      return {
        id: data.document.id,
        name: data.name,
        description: data.description || '',
        thumbnail: thumbnailData.images[data.document.id] || '',
        embedUrl: `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${fileKey}`,
        lastModified: data.lastModified,
        version: data.version,
        fileKey: fileKey,
        author: author
      };
    } catch (error) {
      console.error('Error fetching file details:', error);
      return null;
    }
  }

  async getUserRecentFiles(): Promise<FigmaFile[]> {
    try {
      const data = await this.request('/files/recent?per_page=50');
      
      if (!data.files || !Array.isArray(data.files)) {
        console.error('Invalid recent files response:', data);
        return [];
      }
      
      return data.files.map((file: any) => ({
        key: file.key,
        name: file.name,
        thumbnail_url: file.thumbnail_url,
        last_modified: file.last_modified,
        version: ''
      }));
    } catch (error) {
      console.error('Error fetching recent files:', error);
      return [];
    }
  }

  async searchFiles(query: string, teamId?: string): Promise<FigmaFile[]> {
    try {
      // Note: Figma API doesn't have a direct search endpoint
      // This would need to be implemented by fetching all files and filtering
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  // Generate embed URL for prototype viewing
  getEmbedUrl(fileKey: string, nodeId?: string): string {
    let url = `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/proto/${fileKey}`;
    if (nodeId) {
      url += `&node-id=${nodeId}`;
    }
    return url;
  }
}

export const figmaApi = new FigmaApiService();