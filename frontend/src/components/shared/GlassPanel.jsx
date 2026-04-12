import React from 'react';
import { cn } from '../../lib/utils';

const GlassPanel = ({ children, className, hoverEffect = false, ...props }) => {
  return (
    <div 
      className={cn(
        "glass-panel rounded-2xl transition-all duration-300",
        hoverEffect && "hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
