import React from 'react';

export default function LoadingSpinner({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
        />
      </svg>
      <style jsx>{`
        .animate-spin {
          animation: spin 0.4s linear infinite;
        }
        @keyframes spin {
        100% { transform: rotate(360deg); }
        }
    `}</style>
    </div>
  );
}
