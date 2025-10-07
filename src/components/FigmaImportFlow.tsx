import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Search, Loader2, FileText, ArrowLeft, Video, ExternalLink, Settings, ChevronRight, Compass, UserPlus, ShoppingBag, Zap, Headphones, User, Leaf, TrendingUp, AppWindow } from "lucide-react";
import { FigmaIcon } from "./figma/FigmaIcon";
import { figmaApi, FigmaProject, FigmaFile, FigmaPage } from "../services/figmaApi";

interface FigmaImportFlowProps {
  onImport: (prototype: {
    title: string;
    link: string;
    thumbnail: string;
    fileKey: string;
    embedUrl: string;
    problemSummary?: string;
    videoLink?: string;
    experience?: "discover" | "onboard" | "shop" | "core-os" | "applications" | "growth" | "support";
    persona?: string;
    author?: string;
  }) => void;
  onTokenSet: (token: string) => void;
  hasToken: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type FlowStep = "token" | "files" | "details";

export default function FigmaImportFlow({ onImport, onTokenSet, hasToken, isOpen: externalIsOpen, onOpenChange }: FigmaImportFlowProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>("token");
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  
  // Determine if we're using external control
  const isExternallyControlled = externalIsOpen !== undefined;
  
  // Debug logging
  console.log('FigmaImportFlow - isOpen:', isOpen, 'isExternallyControlled:', isExternallyControlled);
  
  // Token step state
  const [token, setToken] = useState("");
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  
  // Team step state
  const [teamId, setTeamId] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  // Projects step state
  const [projects, setProjects] = useState<FigmaProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<FigmaProject | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // Files step state
  const [files, setFiles] = useState<FigmaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFileKey, setLoadingFileKey] = useState<string | null>(null);
  
  // Pages step state
  const [pages, setPages] = useState<FigmaPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FigmaPage | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  
  // Details step state
  const [problemSummary, setProblemSummary] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

  const resetState = () => {
    setCurrentStep(hasToken ? "files" : "token");
    setToken("");
    setTeamId("");
    setProjects([]);
    setSelectedProject(null);
    setLoadingProjectId(null);
    setFiles([]);
    setSelectedFile(null);
    setLoadingFileKey(null);
    setPages([]);
    setSelectedPage(null);
    setLoadingPageId(null);
    setSearchQuery("");
    setProblemSummary("");
    setVideoLink("");
    setSelectedExperience("");
    setSelectedPersona("");
    setIsImporting(false);
  };

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Set initial step based on token availability
      if (hasToken) {
        setCurrentStep("files");
        // Load user's recent files automatically
        setIsLoadingFiles(true);
        try {
          const recentFiles = await figmaApi.getUserRecentFiles();
          setFiles(recentFiles);
        } catch (error) {
          console.error('Failed to load recent files:', error);
          alert('Failed to load your Figma files. Please check your token.');
        } finally {
          setIsLoadingFiles(false);
        }
      } else {
        setCurrentStep("token");
      }
    } else {
      resetState();
    }
  };

  const handleTokenSubmit = async () => {
    if (!token.trim()) {
      alert("Please enter a valid token");
      return;
    }

    setIsValidatingToken(true);
    try {
      // Test the token
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: { 'X-Figma-Token': token.trim() }
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      onTokenSet(token.trim());
      // Load user's recent files
      setIsLoadingFiles(true);
      try {
        const recentFiles = await figmaApi.getUserRecentFiles();
        setFiles(recentFiles);
        setCurrentStep("files");
      } catch (error) {
        console.error('Failed to load files:', error);
        alert('Token validated but failed to load files.');
        setCurrentStep("files");
      } finally {
        setIsLoadingFiles(false);
      }
    } catch (error) {
      alert('Invalid Figma token. Please check and try again.');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleTeamIdSubmit = async () => {
    if (!teamId.trim()) {
      alert("Please enter a Team ID");
      return;
    }

    setIsLoadingProjects(true);
    try {
      const projectsData = await figmaApi.getTeamProjects(teamId.trim());
      setProjects(projectsData);
      setCurrentStep("projects");
    } catch (error) {
      console.error('Load projects error:', error);
      alert('Failed to load projects. Check your Team ID and token.');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleProjectSelect = async (project: FigmaProject) => {
    setSelectedProject(project);
    setLoadingProjectId(project.id);
    setIsLoadingFiles(true);
    try {
      const filesData = await figmaApi.getProjectFiles(project.id);
      setFiles(filesData);
      setCurrentStep("files");
    } catch (error) {
      console.error('Load files error:', error);
      alert('Failed to load project files.');
    } finally {
      setIsLoadingFiles(false);
      setLoadingProjectId(null);
    }
  };

  const handleFileSelect = async (file: FigmaFile) => {
    setSelectedFile(file);
    setLoadingFileKey(file.key);
    setCurrentStep("details");
    setLoadingFileKey(null);
  };

  const handlePageSelect = (page: FigmaPage) => {
    setLoadingPageId(page.id);
    // Add a slight delay to show loading state for better UX
    setTimeout(() => {
      setSelectedPage(page);
      setCurrentStep("details");
      setLoadingPageId(null);
    }, 300);
  };

  const handleImport = async () => {
    if (!selectedFile || !problemSummary.trim() || !selectedExperience || !selectedPersona) {
      alert("Please fill in all required fields including experience category and persona");
      return;
    }

    setIsImporting(true);
    try {
      // Fetch file details to get author information
      const fileDetails = await figmaApi.getFileDetails(selectedFile.key);
      const author = fileDetails?.author || 'Unknown Author';

      const importData = {
        title: selectedFile.name,
        link: `https://www.figma.com/file/${selectedFile.key}`,
        thumbnail: selectedFile.thumbnail_url || fileDetails?.thumbnail || '',
        fileKey: selectedFile.key,
        embedUrl: figmaApi.getEmbedUrl(selectedFile.key),
        problemSummary: problemSummary.trim(),
        videoLink: videoLink.trim() || undefined,
        experience: selectedExperience as "discover" | "onboard" | "shop" | "core-os" | "applications" | "growth" | "support",
        persona: selectedPersona,
        author: author
      };

      onImport(importData);
      setIsOpen(false);
      resetState();
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import prototype');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTokenStep = () => (
    <div className="space-y-6">
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

      <div className="space-y-2">
        <Label htmlFor="token" className="text-white">Personal Access Token</Label>
        <Input
          id="token"
          type="password"
          placeholder="figd_..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
          className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
        />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleTokenSubmit} 
          className="flex-1" 
          disabled={isValidatingToken || !token.trim()}
        >
          {isValidatingToken ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderTeamStep = () => (
    <div className="space-y-6">
      <Alert>
        <AlertDescription className="text-white/70">
          You'll need your Figma Team ID to access projects. This is found in your team's URL:
          <br />
          <code className="text-xs bg-[#3e3e3e] px-2 py-1 rounded mt-1 inline-block text-white">
            figma.com/files/team/<strong className="text-blue-400">YOUR_TEAM_ID</strong>
          </code>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="teamId" className="text-white">Figma Team ID</Label>
        <Input
          id="teamId"
          placeholder="Enter your Figma Team ID (numbers only)"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTeamIdSubmit()}
          className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
        />
        <p className="text-xs text-white/60">
          Example: If your team URL is <span className="text-white/80">figma.com/files/team/123456789</span>, 
          enter <span className="text-white/80 font-mono">123456789</span>
        </p>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("token")} 
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleTeamIdSubmit} 
          className="flex-1" 
          disabled={isLoadingProjects || !teamId.trim()}
        >
          {isLoadingProjects ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Load Projects
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderProjectsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentStep("team")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="font-medium text-white">Choose a Project</h3>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            No projects found for this team
          </div>
        ) : (
          projects.map((project) => (
            <Card 
              key={project.id} 
              className={`cursor-pointer hover:bg-white/10 transition-colors bg-[#1e1e1e] border-[#3e3e3e] ${
                loadingProjectId === project.id ? 'opacity-75' : ''
              }`}
              onClick={() => loadingProjectId ? null : handleProjectSelect(project)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2c2c2c] rounded flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white/70" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-sm text-white/60">Project</p>
                    </div>
                  </div>
                  {loadingProjectId === project.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-white/50" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderFilesStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentStep("projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h3 className="font-medium text-white">Choose a File to Import</h3>
          {selectedProject && (
            <p className="text-sm text-white/60">From: {selectedProject.name}</p>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search files..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
        />
      </div>

      {isLoadingFiles ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No files match your search" : "No files found in this project"}
            </div>
          ) : (
            filteredFiles.map((file) => (
              <Card 
                key={file.key} 
                className={`cursor-pointer hover:bg-white/10 transition-colors bg-[#1e1e1e] border-[#3e3e3e] ${
                  loadingFileKey === file.key ? 'opacity-75' : ''
                }`}
                onClick={() => loadingFileKey ? null : handleFileSelect(file)}
              >
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
                      <div className="flex-1">
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-xs text-white/60">
                          Modified {new Date(file.last_modified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {loadingFileKey === file.key ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                        <span className="text-xs text-white/70">Loading...</span>
                      </div>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white/50" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderPagesStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentStep("files")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h3 className="font-medium text-white">Choose a Page</h3>
          {selectedFile && (
            <p className="text-sm text-white/60">From: {selectedFile.name}</p>
          )}
        </div>
      </div>

      {isLoadingPages ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-2">
          {pages.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No pages found in this file
            </div>
          ) : (
            pages.map((page) => (
              <Card 
                key={page.id} 
                className={`cursor-pointer hover:bg-white/10 transition-colors bg-[#1e1e1e] border-[#3e3e3e] ${
                  loadingPageId === page.id ? 'opacity-75' : ''
                }`}
                onClick={() => loadingPageId ? null : handlePageSelect(page)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#2c2c2c] rounded flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white/70" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{page.name}</p>
                        <p className="text-sm text-white/60">Page</p>
                      </div>
                    </div>
                    {loadingPageId === page.id ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                        <span className="text-xs text-white/70">Loading...</span>
                      </div>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white/50" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentStep("pages")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="font-medium text-white">Add Project Details</h3>
      </div>

      {selectedFile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                {selectedFile.thumbnail_url ? (
                  <img 
                    src={selectedFile.thumbnail_url} 
                    alt={selectedFile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                {selectedPage && (
                  <p className="text-sm text-muted-foreground">
                    Page: {selectedPage.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  From: {selectedProject?.name} • Modified {new Date(selectedFile.last_modified).toLocaleDateString()}
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
        />
        <p className="text-xs text-white/60">
          Help your team understand the context and purpose of this design.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience" className="text-white">Experience Category *</Label>
        <Select value={selectedExperience} onValueChange={setSelectedExperience}>
          <SelectTrigger className="bg-[#1e1e1e] border-[#3e3e3e] text-white">
            <SelectValue placeholder="Choose which experience this design belongs to" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-[#3e3e3e]">
            <SelectItem value="discover" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Discover
              </div>
            </SelectItem>
            <SelectItem value="onboard" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Onboard
              </div>
            </SelectItem>
            <SelectItem value="shop" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Shop
              </div>
            </SelectItem>
            <SelectItem value="core-os" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Core OS
              </div>
            </SelectItem>
            <SelectItem value="applications" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <AppWindow className="h-4 w-4" />
                Applications
              </div>
            </SelectItem>
            <SelectItem value="growth" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Growth
              </div>
            </SelectItem>
            <SelectItem value="support" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                Support
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-white/60">
          Tag your design with the relevant experience area to help teams find it easily.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="persona" className="text-white">Target Persona *</Label>
        <Select value={selectedPersona} onValueChange={setSelectedPersona}>
          <SelectTrigger className="bg-[#1e1e1e] border-[#3e3e3e] text-white">
            <SelectValue placeholder="Who is this design primarily for?" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-[#3e3e3e]">
            <SelectItem value="Asset Manager" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Asset Manager
              </div>
            </SelectItem>
            <SelectItem value="Compliance Manager" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Compliance Manager
              </div>
            </SelectItem>
            <SelectItem value="Dispatcher" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dispatcher
              </div>
            </SelectItem>
            <SelectItem value="Driver" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Driver
              </div>
            </SelectItem>
            <SelectItem value="Fleet Manager" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Fleet Manager
              </div>
            </SelectItem>
            <SelectItem value="IT Administrator" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                IT Administrator
              </div>
            </SelectItem>
            <SelectItem value="Maintenance Manager" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Maintenance Manager
              </div>
            </SelectItem>
            <SelectItem value="Owner/Operator" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Owner/Operator
              </div>
            </SelectItem>
            <SelectItem value="Safety Manager" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Safety Manager
              </div>
            </SelectItem>
            <SelectItem value="Sustainability Manager" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Sustainability Manager
              </div>
            </SelectItem>
            <SelectItem value="Technician" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Technician
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-white/60">
          Select the primary user type this design is created for to help teams understand the target audience.
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
          Add a video link to walk your team through the design thinking.
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1" disabled={isImporting}>
          Cancel
        </Button>
        <Button 
          onClick={handleImport}
          disabled={!problemSummary.trim() || !selectedPage || !selectedExperience || !selectedPersona || isImporting}
          className="flex-1"
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            "Import Prototype"
          )}
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "token": return "Step 1: Connect to Figma";
      case "files": return "Step 2: Select File";
      case "details": return "Step 3: Add Details";
      default: return "Import from Figma";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "token": return "Connect your Figma account with a personal access token";
      case "files": return "Browse your recent files and choose one to import";
      case "details": return "Add context to help your team understand this design";
      default: return "Import prototypes directly from your Figma projects";
    }
  };

  // If externally controlled, don't render trigger
  if (isExternallyControlled) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[#2c2c2c] border-[#3e3e3e]">
          <DialogHeader>
            <DialogTitle className="text-white">{getStepTitle()}</DialogTitle>
            <DialogDescription className="text-white/70">
              {getStepDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {currentStep === "token" && renderTokenStep()}
            {currentStep === "files" && renderFilesStep()}
            {currentStep === "details" && renderDetailsStep()}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If internally controlled, render with trigger
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button data-figma-import>
          <FigmaIcon className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[#2c2c2c] border-[#3e3e3e]">
        <DialogHeader>
          <DialogTitle className="text-white">{getStepTitle()}</DialogTitle>
          <DialogDescription className="text-white/70">
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep === "token" && renderTokenStep()}
          {currentStep === "files" && renderFilesStep()}
          {currentStep === "details" && renderDetailsStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}