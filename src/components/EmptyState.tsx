import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mail, Users, MessageCircle, TrendingUp, ArrowRight, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  onGmailAuthClick: () => void;
}

export function EmptyState({ onGmailAuthClick }: EmptyStateProps) {
  const benefits = [
    {
      icon: Users,
      title: 'Cross-Team Collaboration',
      description: 'Get feedback from fleet managers, dispatchers, drivers, and other stakeholders in one place'
    },
    {
      icon: TrendingUp,
      title: 'Design Impact Tracking',
      description: 'See which designs resonate most with your audience through reactions and engagement'
    },
    {
      icon: MessageCircle,
      title: 'Contextual Feedback',
      description: 'Receive specific, actionable feedback with comments directly on your prototypes'
    },
    {
      icon: Layers,
      title: 'Best Practice Library',
      description: 'Build a searchable library of proven design patterns for fleet management solutions'
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Sign In with Gmail',
      description: 'Access with your @geotab.com Gmail account - no additional signup required',
      action: 'Continue with Gmail',
      onClick: onGmailAuthClick,
      icon: Mail
    },
    {
      step: '2',
      title: 'Upload Prototypes',
      description: 'Import from Figma or add manually with context and demo videos',
      action: 'Get Started',
      onClick: () => {},
      icon: Layers
    },
    {
      step: '3',
      title: 'Get Feedback',
      description: 'Share with your team and start collecting valuable insights',
      action: 'Collaborate',
      onClick: () => {},
      icon: MessageCircle
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        className="max-w-5xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero Section */}
        <motion.div 
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Figma-style Icon */}
          <motion.div 
            className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2c2c2c] border border-[#3e3e3e] rounded-xl sm:rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3 
            }}
          >
            <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-4 sm:mb-6 px-4">
            Welcome to Fleet Design Showcase
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/70 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Access exclusive design prototypes and collaborate with your Geotab team. 
            Sign in with your @geotab.com Gmail account to get started.
          </p>
          
          <div className="flex justify-center px-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                onClick={onGmailAuthClick}
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-lg shadow-sm transition-all flex items-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Gmail
              </Button>
            </motion.div>
          </div>

          {/* Domain Restriction Notice */}
          <motion.div 
            className="mt-6 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Mail className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm">Only @geotab.com email addresses</span>
            </div>
          </motion.div>
          

        </motion.div>

        {/* Benefits Grid */}
        <motion.div 
          className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            >
              <Card className="bg-[#2c2c2c] border-[#3e3e3e] p-5 sm:p-6 hover:border-[#4e4e4e] transition-all duration-300 h-full">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/90" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-white mb-2 sm:mb-3 text-sm sm:text-base">{benefit.title}</h3>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Getting Started Steps */}
        <motion.div 
          className="bg-[#2c2c2c] border border-[#3e3e3e] rounded-xl sm:rounded-2xl p-6 sm:p-8 mx-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl text-white mb-6 sm:mb-8">How It Works</h2>
          
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 text-left">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div 
                  key={step.step}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 + index * 0.2 }}
                >
                  <div className="text-center">
                    {/* Step Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-[#3e3e3e] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <StepIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    
                    {/* Step Number Badge */}
                    <div className="inline-flex items-center justify-center px-2 py-1 bg-white/10 rounded-full text-white/60 text-xs mb-3">
                      Step {step.step}
                    </div>
                    
                    <h3 className="text-white mb-2 text-base sm:text-lg">{step.title}</h3>
                    <p className="text-white/60 text-xs sm:text-sm mb-4 leading-relaxed">{step.description}</p>
                    
                    {index === 0 && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          onClick={step.onClick}
                          size="sm"
                          className="bg-[#0d99ff] text-white hover:bg-[#0d99ff]/90 active:bg-[#0d99ff]/80 text-sm transition-all"
                        >
                          {step.action}
                          <ArrowRight className="w-4 h-4 ml-2 text-white" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Connector line - Desktop only */}
                  {index < steps.length - 1 && (
                    <div className="hidden sm:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-[#3e3e3e] to-transparent"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-8 sm:mt-12 text-white/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <p className="text-xs sm:text-sm">
            Exclusive access for Geotab team members. Secure, private, and designed for collaboration.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}