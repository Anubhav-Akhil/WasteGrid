import React from 'react';

const WasteGridLogo = ({ size = 22, color = 'var(--primary)', style = {} }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {/* Outer recycling loops representing Waste flow */}
      <path 
        d="M 5 8 L 2.5 11.5 L 6 13" 
        stroke={color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 2.5 11.5 C 5.5 6.5, 9.5 4, 13.5 4" 
        stroke={color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />
      
      <path 
        d="M 19 16 L 21.5 12.5 L 18 11" 
        stroke={color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 21.5 12.5 C 18.5 17.5, 14.5 20, 10.5 20" 
        stroke={color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />
      
      {/* Central grid network representing telemetry nodes */}
      <path 
        d="M 8 9 L 12 12 L 16 9" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M 12 12 L 12 17" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M 8 9 L 16 9 L 12 17 L 8 9" 
        stroke={color} 
        strokeWidth="1" 
        strokeDasharray="2 2" 
      />
      
      {/* Network connection nodes */}
      <circle cx="8" cy="9" r="2.2" fill={color} stroke="white" strokeWidth="0.8" />
      <circle cx="16" cy="9" r="2.2" fill={color} stroke="white" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="2.2" fill={color} stroke="white" strokeWidth="0.8" />
      <circle cx="12" cy="17" r="2.2" fill={color} stroke="white" strokeWidth="0.8" />
    </svg>
  );
};

export default WasteGridLogo;
