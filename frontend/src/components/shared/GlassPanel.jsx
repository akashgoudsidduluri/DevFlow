import React from 'react';
import { cn } from '../../lib/utils';

const GlassPanel = ({ children, className, hoverEffect = false, ...props }) => {
  return (
    <div 
      className={cn(
        "glass-panel rounded-xl",
        hoverEffect && "hover-lift",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
