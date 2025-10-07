import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { 
  Settings, 
  Key, 
  Database, 
  Shield, 
  Activity,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  X,
  LogOut,
  Trash2,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminConsoleProps {
  onClose: () => void;
  onUpdate?: () => void;
}

interface SystemSettings {
  figmaApiToken: string;
  appName: string;
  enablePublicAccess: boolean;
  maxUploadSize: number;
  maintenanceMode: boolean;
}

interface ConnectionStatus {
  database: 'connected' | 'disconnected' | 'error';
  figma: 'connected' | 'disconnected' | 'error';
  lastUpdated: Date;
}

import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1153dc8c`;

export function AdminConsole({ onClose, onUpdate }: AdminConsoleProps) {
  const [settings, setSettings] = useState<SystemSettings>({
    figmaApiToken: '',
    appName: 'Fleet Design Showcase',
    enablePublicAccess: true,
    maxUploadSize: 50,
    maintenanceMode: false
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    database: 'connected',
    figma: 'disconnected',
    lastUpdated: new Date()
  });

  const [showApiToken, setShowApiToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [workItems, setWorkItems] = useState<any[]>([]);
  const [isLoadingWork, setIsLoadingWork] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Load settings from backend
    loadSettings();

    // Check if already authenticated
    const authToken = localStorage.getItem('adminAuthToken');
    if (authToken) {
      setIsAuthenticated(true);
      loadWorkItems();
    }
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/settings/figma-token`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setSettings(prev => ({ ...prev, figmaApiToken: data.token }));
          setConnectionStatus(prev => ({ ...prev, figma: 'connected' }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadWorkItems = async () => {
    try {
      setIsLoadingWork(true);
      const response = await fetch(`${API_BASE}/work`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkItems(data.works || []);
      }
    } catch (error) {
      console.error('Error loading work items:', error);
    } finally {
      setIsLoadingWork(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    // Mock authentication - replace with actual auth
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (adminEmail === 'admin@fleet.com' && adminPassword === 'admin123') {
        localStorage.setItem('adminAuthToken', 'mock-jwt-token');
        setIsAuthenticated(true);
        toast.success('Successfully logged in to admin console');
      } else {
        setLoginError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthToken');
    setIsAuthenticated(false);
    setAdminEmail('');
    setAdminPassword('');
    onClose();
    toast.success('Logged out successfully');
  };

  const handleSettingsChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      // Save Figma token to backend
      const response = await fetch(`${API_BASE}/settings/figma-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ token: settings.figmaApiToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Update connection status based on Figma token
      if (settings.figmaApiToken) {
        setConnectionStatus(prev => ({ 
          ...prev, 
          figma: 'connected',
          lastUpdated: new Date()
        }));
      } else {
        setConnectionStatus(prev => ({ 
          ...prev, 
          figma: 'disconnected',
          lastUpdated: new Date()
        }));
      }

      setIsDirty(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }

    setIsLoading(false);
  };

  const testFigmaConnection = async () => {
    if (!settings.figmaApiToken) {
      toast.error('Please enter a Figma API token first');
      return;
    }

    setIsLoading(true);

    try {
      // Mock Figma API test - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      setConnectionStatus(prev => ({ 
        ...prev, 
        figma: 'connected',
        lastUpdated: new Date()
      }));
      toast.success('Figma API connection successful!');
    } catch (error) {
      setConnectionStatus(prev => ({ 
        ...prev, 
        figma: 'error',
        lastUpdated: new Date()
      }));
      toast.error('Failed to connect to Figma API');
    }

    setIsLoading(false);
  };

  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(settings.figmaApiToken);
    toast.success('API token copied to clipboard');
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl">Admin Console</CardTitle>
              <CardDescription>Sign in to access system settings and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@fleet.com"
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    required
                  />
                </div>
                
                {loginError && (
                  <Alert className="bg-red-950/50 border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 text-sm">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex space-x-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              
              <Alert className="mt-4 bg-blue-950/50 border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-sm">
                  Demo credentials: admin@fleet.com / admin123
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main Admin Console
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl bg-gray-900 rounded-xl border border-gray-800 my-8 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Console</h2>
              <p className="text-gray-400 text-sm">System configuration and management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="work" className="space-y-6">
            <TabsList className="bg-gray-800 p-1">
              <TabsTrigger value="work" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Manage Work
              </TabsTrigger>
              <TabsTrigger value="figma" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Key className="w-4 h-4 mr-2" />
                Figma API
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="status" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Activity className="w-4 h-4 mr-2" />
                System Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="work" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Work Items Management
                    </span>
                    <Button
                      onClick={loadWorkItems}
                      variant="outline"
                      size="sm"
                      disabled={isLoadingWork}
                      className="border-gray-700 text-gray-300 hover:bg-gray-700"
                    >
                      {isLoadingWork ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    View and manage all prototypes in the system. Admins can delete any entry.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingWork ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 mx-auto mb-2 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
                      <p className="text-gray-400 text-sm">Loading work items...</p>
                    </div>
                  ) : workItems.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                      <p className="text-gray-400">No work items found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {workItems.map((work) => (
                        <div
                          key={work.id}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="text-white font-medium truncate">{work.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                by {work.author_name || 'Unknown'}
                              </span>
                              {work.experience && work.experience !== 'all' && (
                                <Badge variant="secondary" className="text-xs">
                                  {work.experience}
                                </Badge>
                              )}
                              {work.persona && work.persona !== 'all' && (
                                <Badge variant="outline" className="text-xs border-gray-600">
                                  {work.persona}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Created: {new Date(work.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete "${work.title}"? This action cannot be undone.`)) {
                                try {
                                  const response = await fetch(`${API_BASE}/work/${work.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${publicAnonKey}`,
                                    },
                                  });

                                  if (!response.ok) {
                                    throw new Error('Failed to delete work item');
                                  }

                                  toast.success('Work item deleted');
                                  loadWorkItems();
                                  if (onUpdate) onUpdate();
                                } catch (error) {
                                  console.error('Error deleting work:', error);
                                  toast.error('Failed to delete work item');
                                }
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Alert className="bg-yellow-950/50 border-yellow-800">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-300 text-sm">
                      Deleting a work item will also remove all associated reactions and comments. This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="figma" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Figma API Configuration
                  </CardTitle>
                  <CardDescription>
                    Connect your Figma account to enable prototype imports from anywhere. This token will be used globally for all users.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="figmaToken" className="text-gray-300">Figma Personal Access Token</Label>
                    <div className="relative mt-1">
                      <Input
                        id="figmaToken"
                        type={showApiToken ? 'text' : 'password'}
                        value={settings.figmaApiToken}
                        onChange={(e) => handleSettingsChange('figmaApiToken', e.target.value)}
                        placeholder="figd_..."
                        className="bg-gray-800 border-gray-700 text-white pr-20"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiToken(!showApiToken)}
                          className="h-8 w-8 p-0 hover:bg-gray-700"
                        >
                          {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        {settings.figmaApiToken && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={copyTokenToClipboard}
                            className="h-8 w-8 p-0 hover:bg-gray-700"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Generate a token at <span className="text-blue-400">figma.com/developers/api</span>
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={testFigmaConnection}
                      disabled={isLoading || !settings.figmaApiToken}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {isLoading ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>

                  <Alert className="bg-blue-950/50 border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-300 text-sm">
                      This token will be used globally for all user imports. Make sure it has access to the files your team needs to import.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Application Settings</CardTitle>
                  <CardDescription>Configure basic application parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="appName" className="text-gray-300">Application Name</Label>
                    <Input
                      id="appName"
                      value={settings.appName}
                      onChange={(e) => handleSettingsChange('appName', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxUpload" className="text-gray-300">Max Upload Size (MB)</Label>
                    <Input
                      id="maxUpload"
                      type="number"
                      value={settings.maxUploadSize}
                      onChange={(e) => handleSettingsChange('maxUploadSize', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="publicAccess"
                      checked={settings.enablePublicAccess}
                      onChange={(e) => handleSettingsChange('enablePublicAccess', e.target.checked)}
                      className="rounded border-gray-700"
                    />
                    <Label htmlFor="publicAccess" className="text-gray-300">Enable public access to prototypes</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="maintenance"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingsChange('maintenanceMode', e.target.checked)}
                      className="rounded border-gray-700"
                    />
                    <Label htmlFor="maintenance" className="text-gray-300">Maintenance mode</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      Database Connection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        connectionStatus.database === 'connected' ? 'bg-green-500' :
                        connectionStatus.database === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <Badge variant={
                        connectionStatus.database === 'connected' ? 'default' :
                        connectionStatus.database === 'error' ? 'destructive' : 'secondary'
                      }>
                        {connectionStatus.database}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last checked: {connectionStatus.lastUpdated.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Figma API Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        connectionStatus.figma === 'connected' ? 'bg-green-500' :
                        connectionStatus.figma === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <Badge variant={
                        connectionStatus.figma === 'connected' ? 'default' :
                        connectionStatus.figma === 'error' ? 'destructive' : 'secondary'
                      }>
                        {connectionStatus.figma}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last checked: {connectionStatus.lastUpdated.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          {isDirty && (
            <motion.div 
              className="flex justify-end pt-6 border-t border-gray-800 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}