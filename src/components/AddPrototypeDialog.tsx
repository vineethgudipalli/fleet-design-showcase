import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, ArrowLeft, Video, ExternalLink, Compass, UserPlus, ShoppingBag, Zap, Settings, Headphones, User, Leaf, Loader2, TrendingUp, AppWindow } from "lucide-react";

type Experience = "discover" | "onboard" | "shop" | "core-os" | "applications" | "growth" | "support";

interface AddPrototypeDialogProps {
  onAdd: (prototype: {
    title: string;
    link: string;
    thumbnail: string;
    fileKey?: string;
    embedUrl?: string;
    problemSummary?: string;
    videoLink?: string;
    experience?: Experience;
    persona?: string;
    author?: string;
  }) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type FlowStep = "link" | "details";

export default function AddPrototypeDialog({ onAdd, isOpen: externalIsOpen, onOpenChange }: AddPrototypeDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>("link");
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  
  // Determine if we're using external control
  const isExternallyControlled = externalIsOpen !== undefined;
  
  // Debug logging
  console.log('AddPrototypeDialog - isOpen:', isOpen, 'isExternallyControlled:', isExternallyControlled);
  
  // Link step state
  const [figmaLink, setFigmaLink] = useState("");
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  
  // Details step state
  const [title, setTitle] = useState("");
  const [problemSummary, setProblemSummary] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setCurrentStep("link");
    setFigmaLink("");
    setTitle("");
    setProblemSummary("");
    setVideoLink("");
    setSelectedExperience("");
    setSelectedPersona("");
    setIsProcessingLink(false);
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  const extractFileKeyFromUrl = (url: string) => {
    // Extract file key from various Figma URL formats
    const fileKeyMatch = url.match(/\/file\/([a-zA-Z0-9]+)/);
    return fileKeyMatch ? fileKeyMatch[1] : null;
  };

  const generateEmbedUrl = (url: string) => {
    const fileKey = extractFileKeyFromUrl(url);
    if (fileKey) {
      return `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${fileKey}`;
    }
    return "";
  };

  const handleLinkSubmit = async () => {
    if (!figmaLink.trim()) {
      alert("Please enter a valid Figma link");
      return;
    }

    if (!figmaLink.includes("figma.com")) {
      alert("Please enter a valid Figma link");
      return;
    }

    setIsProcessingLink(true);
    try {
      // Extract title from URL or use a default
      const urlParts = figmaLink.split('/');
      const fileIndex = urlParts.findIndex(part => part === 'file');
      let extractedTitle = "Untitled Prototype";
      
      if (fileIndex !== -1 && urlParts[fileIndex + 2]) {
        // Try to extract title from URL structure
        extractedTitle = decodeURIComponent(urlParts[fileIndex + 2]).replace(/-/g, ' ');
      }
      
      setTitle(extractedTitle);
      setCurrentStep("details");
    } catch (error) {
      console.error('Link processing error:', error);
      alert('Failed to process Figma link');
    } finally {
      setIsProcessingLink(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !problemSummary.trim() || !selectedExperience || !selectedPersona) {
      alert("Please fill in all required fields including experience category and persona");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileKey = extractFileKeyFromUrl(figmaLink);
      const embedUrl = generateEmbedUrl(figmaLink);

      const prototypeData = {
        title: title.trim(),
        link: figmaLink,
        thumbnail: "", // Will be empty for manual entries
        fileKey: fileKey || undefined,
        embedUrl: embedUrl || undefined,
        problemSummary: problemSummary.trim(),
        videoLink: videoLink.trim() || undefined,
        experience: selectedExperience as Experience,
        persona: selectedPersona,
        author: "You"
      };

      onAdd(prototypeData);
      setIsOpen(false);
      resetState();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to add prototype');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLinkStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="figmaLink" className="text-white">Figma Link *</Label>
        <Input
          id="figmaLink"
          placeholder="https://www.figma.com/file/... or https://figma.com/proto/..."
          value={figmaLink}
          onChange={(e) => setFigmaLink(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
          className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
        />
        <p className="text-xs text-white/60">
          Paste any Figma file or prototype link here. We'll extract the details automatically.
        </p>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleLinkSubmit} 
          className="flex-1" 
          disabled={isProcessingLink || !figmaLink.trim()}
        >
          {isProcessingLink ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentStep("link")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="font-medium text-white">Add Project Details</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">Title *</Label>
        <Input
          id="title"
          placeholder="Enter prototype title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
        />
        <p className="text-xs text-white/60">
          Give your prototype a clear, descriptive title.
        </p>
      </div>

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
        <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!title.trim() || !problemSummary.trim() || !selectedExperience || !selectedPersona || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Prototype"
          )}
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "link": return "Add from Figma Link";
      case "details": return "Add Project Details";
      default: return "Add New Prototype";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "link": return "Paste your Figma file or prototype link to get started.";
      case "details": return "Add context and details to help your team understand this prototype.";
      default: return "Add a new prototype to your showcase.";
    }
  };

  // If externally controlled, don't render trigger
  if (isExternallyControlled) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg bg-[#2c2c2c] border-[#3e3e3e]">
          <DialogHeader>
            <DialogTitle className="text-white">{getStepTitle()}</DialogTitle>
            <DialogDescription className="text-white/70">
              {getStepDescription()}
            </DialogDescription>
          </DialogHeader>
          
          {currentStep === "link" && renderLinkStep()}
          {currentStep === "details" && renderDetailsStep()}
        </DialogContent>
      </Dialog>
    );
  }

  // If internally controlled, render with trigger
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button data-add-prototype>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-[#2c2c2c] border-[#3e3e3e]">
        <DialogHeader>
          <DialogTitle className="text-white">{getStepTitle()}</DialogTitle>
          <DialogDescription className="text-white/70">
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {currentStep === "link" && renderLinkStep()}
        {currentStep === "details" && renderDetailsStep()}
      </DialogContent>
    </Dialog>
  );
}