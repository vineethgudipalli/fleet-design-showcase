import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import {
    Plus,
    ArrowLeft,
    Video,
    Compass,
    UserPlus,
    ShoppingBag,
    Zap,
    Headphones,
    User,
    Leaf,
    Loader2,
    TrendingUp,
    AppWindow,
    ChevronDown
} from "lucide-react";
import { figmaApi } from "../services/figmaApi";
import { toast } from "sonner";

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
        experience?: Experience | string[];
        persona?: string | string[];
        author?: string;
    }) => void;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    figmaToken?: string;
}

type FlowStep = "link" | "details";

export default function AddPrototypeDialog({ onAdd, isOpen: externalIsOpen, onOpenChange, figmaToken }: AddPrototypeDialogProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<FlowStep>("link");

    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = onOpenChange || setInternalIsOpen;

    // Determine if we're using external control
    const isExternallyControlled = externalIsOpen !== undefined;

    // Link step state
    const [figmaLink, setFigmaLink] = useState("");
    const [isProcessingLink, setIsProcessingLink] = useState(false);

    // Details step state
    const [title, setTitle] = useState("");
    const [problemSummary, setProblemSummary] = useState("");
    const [videoLink, setVideoLink] = useState("");
    const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
    const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetState = () => {
        setCurrentStep("link");
        setFigmaLink("");
        setTitle("");
        setProblemSummary("");
        setVideoLink("");
        setSelectedExperiences([]);
        setSelectedPersonas([]);
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
        const fileKeyPatterns = [
            /\/file\/([a-zA-Z0-9]+)/, // /file/{fileKey}
            /\/proto\/([a-zA-Z0-9]+)/, // /proto/{fileKey}
            /\/design\/([a-zA-Z0-9]+)/ // /design/{fileKey}
        ];

        for (const pattern of fileKeyPatterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    };

    const generateEmbedUrl = (url: string) => {
        const fileKey = extractFileKeyFromUrl(url);
        if (fileKey) {
            // Extract node-id if present
            const nodeIdMatch = url.match(/node-id=([^&]+)/);
            const nodeId = nodeIdMatch ? nodeIdMatch[1] : null;

            // Use embed.figma.com format
            if (url.includes("/proto/")) {
                if (nodeId) {
                    return `https://embed.figma.com/proto/${fileKey}?node-id=${nodeId}&embed-host=share`;
                }
                return `https://embed.figma.com/proto/${fileKey}?embed-host=share`;
            } else {
                if (nodeId) {
                    return `https://embed.figma.com/design/${fileKey}?node-id=${nodeId}&embed-host=share`;
                }
                return `https://embed.figma.com/design/${fileKey}?embed-host=share`;
            }
        }
        return "";
    };

    const handleLinkSubmit = async () => {
        if (!figmaLink.trim()) {
            toast.error("Invalid link", {
                description: "Please enter a valid Figma link"
            });
            return;
        }

        if (!figmaLink.includes("figma.com")) {
            toast.error("Invalid link", {
                description: "Please enter a valid Figma link"
            });
            return;
        }

        // Validate that we can extract a file key
        const fileKey = extractFileKeyFromUrl(figmaLink);
        if (!fileKey) {
            toast.error("Invalid URL format", {
                description: "Please make sure the URL contains a valid file key."
            });
            return;
        }

        setIsProcessingLink(true);

        // Check if we have a valid token before making API call
        if (!figmaToken) {
            toast.error("Authentication required", {
                description: "Please log in with Figma to import prototypes. Click 'Continue with Figma' in the header.",
                duration: 6000
            });
            setIsProcessingLink(false);
            return;
        }

        // Validate token format
        const tokenPrefix = figmaToken.substring(0, 5);
        const isValidOAuthToken = tokenPrefix === "figu_"; // OAuth user access token

        if (!isValidOAuthToken) {
            const isPersonalToken = tokenPrefix === "figo_";
            toast.error("Invalid authentication", {
                description: isPersonalToken
                    ? "Personal access tokens have limited permissions. Please log out and sign in with OAuth."
                    : "Your session has expired or is invalid. Please log out and sign in again with Figma OAuth.",
                duration: 6000
            });
            setIsProcessingLink(false);
            return;
        }

        // Show loading toast
        const loadingToast = toast.loading("Fetching prototype details", {
            description: "Loading metadata from Figma..."
        });

        try {
            // Initialize the Figma API with the token
            figmaApi.setToken(figmaToken);

            // Use the enhanced Figma API to fetch metadata
            const figmaDetails = await figmaApi.getFileDetailsFromUrl(figmaLink);

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (figmaDetails) {
                // Use the fetched metadata
                setTitle(figmaDetails.title);
                setProblemSummary(figmaDetails.description || "Imported from Figma");
                setCurrentStep("details");
            } else {
                // Fallback to URL extraction if API fails
                const urlParts = figmaLink.split("/");
                const fileIndex = urlParts.findIndex((part: any) => part === "file" || part === "proto" || part === "design");
                let extractedTitle = "Figma Prototype";

                if (fileIndex !== -1 && urlParts[fileIndex + 2]) {
                    // Try to extract title from URL structure
                    extractedTitle = decodeURIComponent(urlParts[fileIndex + 2])
                        .replace(/-/g, " ")
                        .replace(/\?.*$/, "");
                }

                setTitle(extractedTitle);
                setProblemSummary("Imported from Figma URL");
                setCurrentStep("details");

                // Dismiss loading toast on fallback
                toast.dismiss(loadingToast);
            }
        } catch (error) {
            // Dismiss loading toast on error
            toast.dismiss(loadingToast);

            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Failed to process Figma link:", error);

            // Show specific error messages based on error type
            if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
                toast.error("Access denied", {
                    description: "You don't have permission to access this Figma file. Please check your access rights.",
                    duration: 6000
                });
            } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
                toast.error("File not found", {
                    description: "The Figma file could not be found. Please check the URL.",
                    duration: 5000
                });
            } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
                toast.error("Authentication required", {
                    description: "Please log in with Figma to import prototypes.",
                    duration: 5000
                });
            } else {
                toast.error("Failed to process link", {
                    description: errorMessage,
                    duration: 5000
                });
            }
        } finally {
            setIsProcessingLink(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !problemSummary.trim() || selectedExperiences.length === 0 || selectedPersonas.length === 0) {
            toast.error("Missing required fields", {
                description: "Please fill in all required fields including at least one experience category and one persona",
                duration: 4000
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Check if we have a valid token
            if (!figmaToken) {
                toast.error("Authentication required", {
                    description: "Please log in with Figma to import prototypes.",
                    duration: 6000
                });
                setIsSubmitting(false);
                return;
            }

            // Initialize the Figma API with the token
            figmaApi.setToken(figmaToken);

            // Use the enhanced Figma API to get proper metadata and URLs
            const figmaDetails = await figmaApi.getFileDetailsFromUrl(figmaLink);

            let prototypeData;
            if (figmaDetails) {
                prototypeData = {
                    title: title.trim(),
                    link: figmaLink,
                    thumbnail: figmaDetails.thumbnail,
                    fileKey: figmaDetails.fileKey,
                    embedUrl: figmaDetails.embedUrl,
                    problemSummary: problemSummary.trim(),
                    videoLink: videoLink.trim() || undefined,
                    experience: selectedExperiences,
                    persona: selectedPersonas,
                    author: figmaDetails.author
                };
            } else {
                // Fallback if API fails
                const fileKey = extractFileKeyFromUrl(figmaLink);
                const embedUrl = generateEmbedUrl(figmaLink);

                prototypeData = {
                    title: title.trim(),
                    link: figmaLink,
                    thumbnail: "",
                    fileKey: fileKey || undefined,
                    embedUrl: embedUrl || undefined,
                    problemSummary: problemSummary.trim(),
                    videoLink: videoLink.trim() || undefined,
                    experience: selectedExperiences,
                    persona: selectedPersonas,
                    author: {
                        name: "You",
                        initials: "Y"
                    }
                };
            }

            onAdd(prototypeData);

            // Show success toast
            toast.success("Prototype added!", {
                description: `"${title}" has been successfully added to your prototypes.`,
                duration: 4000
            });

            setIsOpen(false);
            resetState();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Failed to add prototype:", error);

            toast.error("Failed to add prototype", {
                description: errorMessage,
                duration: 5000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderLinkStep = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="figmaLink" className="text-white">
                    Figma Link *
                </Label>
                <Input
                    id="figmaLink"
                    placeholder="https://www.figma.com/file/... or https://figma.com/proto/..."
                    value={figmaLink}
                    onChange={e => setFigmaLink(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLinkSubmit()}
                    className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/60">Paste any Figma file or prototype link here. We'll extract the details automatically.</p>
            </div>

            <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                    Cancel
                </Button>
                <Button onClick={handleLinkSubmit} className="flex-1" disabled={isProcessingLink || !figmaLink.trim()}>
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
            <div className="space-y-2">
                <Label htmlFor="title" className="text-white">
                    Title *
                </Label>
                <Input
                    id="title"
                    placeholder="Enter prototype title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/60">Give your prototype a clear, descriptive title.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="problemSummary" className="text-white">
                    What problem does this design solve? *
                </Label>
                <Textarea
                    id="problemSummary"
                    placeholder="Write a brief 2-line summary of the problem this design addresses..."
                    value={problemSummary}
                    onChange={e => setProblemSummary(e.target.value)}
                    rows={3}
                    className="resize-none bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/60">Help your team understand the context and purpose of this design.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="experience" className="text-white">
                    Experience Categories *
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start bg-[#1e1e1e] border-[#3e3e3e] text-white hover:bg-[#2c2c2c] hover:text-white"
                        >
                            <span className="text-white/70 flex-1 text-left">
                                {selectedExperiences.length === 0 ? "Select experience categories" : `${selectedExperiences.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-[#1e1e1e] border-[#3e3e3e] p-3" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <div className="space-y-2">
                            {[
                                { value: "discover", label: "Discover", icon: Compass },
                                { value: "onboard", label: "Onboard", icon: UserPlus },
                                { value: "shop", label: "Shop", icon: ShoppingBag },
                                { value: "core-os", label: "Core OS", icon: Zap },
                                { value: "applications", label: "Applications", icon: AppWindow },
                                { value: "growth", label: "Growth", icon: TrendingUp },
                                { value: "support", label: "Support", icon: Headphones }
                            ].map(exp => (
                                <div key={exp.value} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`exp-${exp.value}`}
                                        checked={selectedExperiences.includes(exp.value)}
                                        onCheckedChange={(checked: boolean) => {
                                            if (checked) {
                                                setSelectedExperiences([...selectedExperiences, exp.value]);
                                            } else {
                                                setSelectedExperiences(selectedExperiences.filter(e => e !== exp.value));
                                            }
                                        }}
                                    />
                                    <label htmlFor={`exp-${exp.value}`} className="flex items-center gap-2 text-sm text-white cursor-pointer flex-1">
                                        <exp.icon className="h-4 w-4" />
                                        {exp.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
                <p className="text-xs text-white/60">Select all relevant experience areas for this design.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="persona" className="text-white">
                    Target Personas *
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start bg-[#1e1e1e] border-[#3e3e3e] text-white hover:bg-[#2c2c2c] hover:text-white"
                        >
                            <span className="text-white/70 flex-1 text-left">
                                {selectedPersonas.length === 0 ? "Select target personas" : `${selectedPersonas.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-[#1e1e1e] border-[#3e3e3e] p-3 max-h-[300px] overflow-y-auto" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <div className="space-y-2">
                            {[
                                { value: "Asset Manager", icon: User },
                                { value: "Compliance Manager", icon: User },
                                { value: "Dispatcher", icon: User },
                                { value: "Driver", icon: User },
                                { value: "Fleet Manager", icon: User },
                                { value: "IT Administrator", icon: User },
                                { value: "Maintenance Manager", icon: User },
                                { value: "Owner/Operator", icon: User },
                                { value: "Safety Manager", icon: User },
                                { value: "Sustainability Manager", icon: Leaf },
                                { value: "Technician", icon: User }
                            ].map(persona => (
                                <div key={persona.value} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`persona-${persona.value}`}
                                        checked={selectedPersonas.includes(persona.value)}
                                        onCheckedChange={(checked: boolean) => {
                                            if (checked) {
                                                setSelectedPersonas([...selectedPersonas, persona.value]);
                                            } else {
                                                setSelectedPersonas(selectedPersonas.filter(p => p !== persona.value));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`persona-${persona.value}`}
                                        className="flex items-center gap-2 text-sm text-white cursor-pointer flex-1"
                                    >
                                        <persona.icon className="h-4 w-4" />
                                        {persona.value}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
                <p className="text-xs text-white/60">Select all user types this design is created for.</p>
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
                    onChange={e => setVideoLink(e.target.value)}
                    className="bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/60">Add a video link to walk your team through the design thinking.</p>
            </div>

            <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1" disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={
                        !title.trim() || !problemSummary.trim() || selectedExperiences.length === 0 || selectedPersonas.length === 0 || isSubmitting
                    }
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
            case "link":
                return "Add from Figma Link";
            case "details":
                return "Add Project Details";
            default:
                return "Add New Prototype";
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case "link":
                return "Paste your Figma file or prototype link to get started.";
            case "details":
                return "Add context and details to help your team understand this prototype.";
            default:
                return "Add a new prototype to your showcase.";
        }
    };

    // If externally controlled, don't render trigger
    if (isExternallyControlled) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-2xl bg-[#2c2c2c] border-[#3e3e3e]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            {currentStep === "details" && (
                                <Button variant="ghost" size="sm" onClick={() => setCurrentStep("link")} className="h-8 w-8 p-0 text-white">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            )}
                            <div className="flex-1">
                                <DialogTitle className="text-white">{getStepTitle()}</DialogTitle>
                                <DialogDescription className="text-white/70">{getStepDescription()}</DialogDescription>
                            </div>
                        </div>
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
            <DialogContent className="sm:max-w-2xl bg-[#2c2c2c] border-[#3e3e3e]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        {currentStep === "details" && (
                            <Button variant="ghost" size="sm" onClick={() => setCurrentStep("link")} className="h-8 w-8 p-0 text-white">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <div className="flex-1">
                            <DialogTitle className="text-white">{getStepTitle()}</DialogTitle>
                            <DialogDescription className="text-white/70">{getStepDescription()}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {currentStep === "link" && renderLinkStep()}
                {currentStep === "details" && renderDetailsStep()}
            </DialogContent>
        </Dialog>
    );
}
