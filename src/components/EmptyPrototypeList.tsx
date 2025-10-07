import React from 'react';
import { motion } from 'motion/react';

interface EmptyPrototypeListProps {
  hasFilters: boolean;
}

const SkeletonPrototype = () => (
  <div className="w-64 h-80 bg-[#2c2c2c]/30 rounded-lg border border-[#3e3e3e]/30 overflow-hidden">
    {/* Thumbnail skeleton */}
    <div className="relative h-40 bg-[#1e1e1e]/40">
      <div className="absolute top-3 left-3 w-16 h-5 bg-white/10 rounded"></div>
      <div className="absolute top-3 right-3 w-8 h-5 bg-white/10 rounded-full"></div>
      
      {/* Placeholder design elements */}
      <div className="absolute inset-4 flex flex-col gap-2">
        <div className="w-full h-3 bg-white/5 rounded"></div>
        <div className="w-3/4 h-3 bg-white/5 rounded"></div>
        <div className="w-1/2 h-3 bg-white/5 rounded"></div>
        <div className="mt-2 w-full h-8 bg-white/5 rounded"></div>
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-white/5 rounded"></div>
          <div className="w-12 h-6 bg-white/5 rounded"></div>
        </div>
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="p-4">
      {/* Title */}
      <div className="w-3/4 h-4 bg-white/10 rounded mb-2"></div>
      
      {/* Description */}
      <div className="space-y-1 mb-3">
        <div className="w-full h-3 bg-white/5 rounded"></div>
        <div className="w-5/6 h-3 bg-white/5 rounded"></div>
      </div>
      
      {/* Tags */}
      <div className="flex gap-1 mb-3">
        <div className="w-12 h-4 bg-white/5 rounded-full"></div>
        <div className="w-16 h-4 bg-white/5 rounded-full"></div>
        <div className="w-10 h-4 bg-white/5 rounded-full"></div>
      </div>
      
      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-white/10 rounded-full"></div>
        <div className="flex-1">
          <div className="w-20 h-3 bg-white/5 rounded mb-1"></div>
          <div className="w-16 h-2 bg-white/5 rounded"></div>
        </div>
      </div>
      
      {/* Reactions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex gap-1">
          <div className="w-8 h-6 bg-white/5 rounded"></div>
          <div className="w-8 h-6 bg-white/5 rounded"></div>
          <div className="w-8 h-6 bg-white/5 rounded"></div>
        </div>
        <div className="w-8 h-6 bg-white/5 rounded"></div>
      </div>
    </div>
  </div>
);

export function EmptyPrototypeList({ hasFilters }: EmptyPrototypeListProps) {
  if (hasFilters) {
    // No results found with current filters
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="mb-8">
          <SkeletonPrototype />
        </div>
        
        <h3 className="text-xl text-white mb-2">No prototypes found</h3>
        <p className="text-white/60 text-center max-w-md">
          No prototypes match your current selection.
        </p>
      </motion.div>
    );
  }

  // No prototypes at all
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="mb-8">
        <SkeletonPrototype />
      </div>
      
      <h3 className="text-2xl text-white mb-2">No prototypes yet</h3>
      <p className="text-white/60 text-center max-w-md">
        Your prototype showcase is empty.
      </p>
    </motion.div>
  );
}