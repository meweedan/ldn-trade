import React, { forwardRef, HTMLAttributes } from 'react';
import './GlassCard.css';

export type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <div ref={ref} className={`glass-card ${className}`} {...rest}>
        <div className="glass-card__inner">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
