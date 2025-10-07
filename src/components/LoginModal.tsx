import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ open, onOpenChange, onSwitchToSignUp, onSuccess }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: 'demo@fleet.design',
    password: 'demo123',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual login logic
      console.log('Login form submitted:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSuccess?.();
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGmailLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Gmail OAuth
      console.log('Gmail login clicked');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSuccess?.();
    } catch (error) {
      console.error('Gmail login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log('Forgot password clicked');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2c2c2c] border-[#3e3e3e] text-white max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-center text-white/70">
            Log in to your Fleet Design Showcase account
          </DialogDescription>
        </DialogHeader>

        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gmail Login Button */}
          <Button
            type="button"
            onClick={handleGmailLogin}
            disabled={isLoading}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 flex items-center justify-center gap-3 py-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Gmail
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-[#3e3e3e]" />
            <span className="text-sm text-white/60">or</span>
            <Separator className="flex-1 bg-[#3e3e3e]" />
          </div>

          {/* Demo Credentials Notice */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400 text-sm text-center">
              <strong>Demo Access:</strong> Credentials are pre-filled. Just click "Log In" below.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50 focus:border-[#0d99ff] ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#0d99ff] hover:text-[#0d99ff]/80 underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pr-10 bg-[#1e1e1e] border-[#3e3e3e] text-white placeholder:text-white/50 focus:border-[#0d99ff] ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                className="border-[#3e3e3e] data-[state=checked]:bg-[#0d99ff] data-[state=checked]:border-[#0d99ff]"
                disabled={isLoading}
              />
              <Label htmlFor="rememberMe" className="text-sm text-white/70 cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90 py-3"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          {/* Switch to Sign Up */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-[#0d99ff] hover:text-[#0d99ff]/80 underline"
              >
                Sign up for free
              </button>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center">
            <p className="text-xs text-white/50">
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#0d99ff] hover:text-[#0d99ff]/80 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-[#0d99ff] hover:text-[#0d99ff]/80 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}