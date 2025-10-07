import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, Search, Loader2, FileText, ArrowLeft, Video, Settings, ExternalLink } from "lucide-react";
import { figmaApi, FigmaProject, FigmaFile } from "../services/figmaApi";

interface UnifiedFigmaImportDialogProps {
  onImport: (prototype: {
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
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Step = "token" | "team" | "projects" | "files" | "details";

export default function UnifiedFigmaImportDialog({ onImport, onTokenSet, hasToken, isOpen: externalIsOpen, onOpenChange }: UnifiedFigmaImportDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [currentStep, setCurrentStep] = useState<Step>("token");
  
  // Token state
  const [token, setToken] = useState("");
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  
  // Import flow state
  const [projects, setProjects] = useState<FigmaProject[]>([]);
  const [files, setFiles] = useState<FigmaFile[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [problemSummary, setProblemSummary] = useState("");
  const [videoLink, setVideoLink] = useState("");

  // Set initial step based on token availability
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(hasToken ? "team" : "token");
    }
  }, [isOpen, hasToken]);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsValidatingToken(true);
    try {
      // Test the token by making a simple API call
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': token.trim(),
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      onTokenSet(token.trim());
      setToken("");
      setCurrentStep("team");
    } catch (error) {
      alert('Invalid Figma token. Please check and try again.');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleSelectFile = (file: FigmaFile) => {
    setSelectedFile(file);
    setCurrentStep("details");
  };

  const handleFinalImport = async () => {
    if (!selectedFile) return;
    
    try {
      console.log('Starting import for file:', selectedFile.key);
      
      // Try to get detailed file info, but fallback to basic info if it fails
      let prototype;
      try {
        prototype = await figmaApi.getFileDetails(selectedFile.key);
        console.log('File details received:', prototype);
      } catch (detailError) {
        console.warn('Failed to get detailed file info, using basic info:', detailError);
        // Fallback to using the file info we already have
        prototype = {
          name: selectedFile.name,
          thumbnail: selectedFile.thumbnail_url
        };
      }
      
      if (prototype) {
        const importData = {
          title: prototype.name,
          link: `https://www.figma.com/file/${selectedFile.key}`,
          thumbnail: prototype.thumbnail || selectedFile.thumbnail_url || '',
          fileKey: selectedFile.key,
          embedUrl: figmaApi.getEmbedUrl(selectedFile.key),
          problemSummary: problemSummary.trim() || undefined,
          videoLink: videoLink.trim() || undefined
        };
        console.log('Importing prototype with data:', importData);
        onImport(importData);
        handleDialogClose();
      } else {
        console.error('No prototype data available');
        alert('Failed to get prototype details');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import prototype: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    // Reset all state
    setProjects([]);
    setFiles([]);
    setSelectedProject("");
    setSelectedFile(null);
    setSearchQuery("");
    setTeamId("");
    setProblemSummary("");
    setVideoLink("");
    setCurrentStep(hasToken ? "team" : "token");
  };

  const loadProjects = async () => {
    if (!teamId.trim()) {
      alert('Please enter a Team ID');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Loading projects for team:', teamId.trim());
      const projectsData = await figmaApi.getTeamProjects(teamId.trim());
      console.log('Projects loaded:', projectsData);
      setProjects(projectsData);
      setCurrentStep("projects");
    } catch (error) {
      console.error('Load projects error:', error);
      alert('Failed to load projects. Check your Team ID and token.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectFiles = async (projectId: string) => {
    setLoadingFiles(true);
    setSelectedProject(projectId);
    try {
      console.log('Loading files for project:', projectId);
      const filesData = await figmaApi.getProjectFiles(projectId);
      console.log('Files loaded:', filesData);
      setFiles(filesData);
      setCurrentStep("files");
    } catch (error) {
      console.error('Load files error:', error);
      alert('Failed to load project files');
    } finally {
      setLoadingFiles(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "token":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                You need a Figma personal access token to import prototypes.
                <a 
                  href="https://www.figma.com/developers/api#access-tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 ml-1 text-primary hover:underline"
                >
                  Get your token here
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-white">Personal Access Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="figd_..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isValidatingToken}>
                  {isValidatingToken ? "Verifying..." : "Connect & Continue"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        );

      case "team":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamId" className="text-white">Team ID</Label>
              <div className="flex gap-2">
                <Input
                  id="teamId"
                  placeholder="Enter your Figma Team ID"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
                />
                <Button onClick={loadProjects} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load"}
                </Button>
              </div>
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setProjects([]);
                  setCurrentStep("team");
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h3 className="font-medium text-white">Select a Project</h3>
            </div>
            <div className="grid gap-2">
              {projects.map((project) => (
                <Card key={project.id} className="cursor-pointer hover:bg-white/10 bg-[#1e1e1e] border-[#3e3e3e]" onClick={() => loadProjectFiles(project.id)}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-white/70" />
                      <span className="font-medium text-white">{project.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "files":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedProject("");
                  setFiles([]);
                  setCurrentStep("projects");
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h3 className="font-medium text-white">Select a File</h3>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input 
                placeholder="Search files..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
              />
            </div>

            {loadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {filteredFiles.map((file) => (
                  <Card key={file.key} className="cursor-pointer hover:bg-white/10 bg-[#1e1e1e] border-[#3e3e3e]" onClick={() => handleSelectFile(file)}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2c2c2c] rounded flex items-center justify-center overflow-hidden">
                            {file.thumbnail_url ? (
                              <img 
                                src={file.thumbnail_url} 
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="h-4 w-4 text-white/70" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{file.name}</p>
                            <p className="text-xs text-white/60">
                              Modified {new Date(file.last_modified).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-[#3e3e3e] text-white/70">v{file.version}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredFiles.length === 0 && !loadingFiles && (
                  <div className="text-center py-8 text-white/60">
                    {searchQuery ? "No files match your search" : "No files found in this project"}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setCurrentStep("files");
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h3 className="font-medium text-white">Add Project Details</h3>
            </div>

            {selectedFile && (
              <Card className="bg-[#1e1e1e] border-[#3e3e3e]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2c2c2c] rounded flex items-center justify-center overflow-hidden">
                      {selectedFile.thumbnail_url ? (
                        <img 
                          src={selectedFile.thumbnail_url} 
                          alt={selectedFile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="h-5 w-5 text-white/70" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{selectedFile.name}</p>
                      <p className="text-sm text-white/60">
                        Modified {new Date(selectedFile.last_modified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="problemSummary" className="text-white">What problem does this design solve? *</Label>
              <Textarea
                id="problemSummary"
                placeholder="Write a brief 2-line summary of the problem this design addresses..."
                value={problemSummary}
                onChange={(e) => setProblemSummary(e.target.value)}
                rows={3}
                className="resize-none bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
                required
              />
              <p className="text-xs text-white/60">
                Help your team understand the context and purpose of this design.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoLink" className="text-white">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-white/70" />
                  Explanation Video (Optional)
                </div>
              </Label>
              <Input
                id="videoLink"
                placeholder="Paste video URL (YouTube, Loom, etc.)"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
              />
              <p className="text-xs text-white/60">
                Add a video link to walk your team through the design thinking and decisions.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleFinalImport}
                disabled={!problemSummary.trim()}
              >
                Import Prototype
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case "token":
        return "Connect to Figma";
      case "team":
        return "Import from Figma";
      case "projects":
        return "Choose Project";
      case "files":
        return "Choose File";
      case "details":
        return "Add Details";
      default:
        return "Import from Figma";
    }
  };

  const getDialogDescription = () => {
    switch (currentStep) {
      case "token":
        return "Enter your Figma personal access token to import prototypes directly from your projects.";
      case "team":
        return "Enter your Figma Team ID to browse projects and import prototypes.";
      case "projects":
        return "Select a project to browse its files.";
      case "files":
        return "Choose the file you want to import as a prototype.";
      case "details":
        return "Add context to help your team understand this design.";
      default:
        return "Browse your Figma team projects and import prototypes directly into your showcase.";
    }
  };

  // If externally controlled, don't render trigger
  if (externalIsOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2c2c2c] border-[#3e3e3e]">
          <DialogHeader>
            <DialogTitle className="text-white">{getDialogTitle()}</DialogTitle>
            <DialogDescription className="text-white/70">
              {getDialogDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {renderStepContent()}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If internally controlled, render with trigger
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Import from Figma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2c2c2c] border-[#3e3e3e]">
        <DialogHeader>
          <DialogTitle className="text-white">{getDialogTitle()}</DialogTitle>
          <DialogDescription className="text-white/70">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}