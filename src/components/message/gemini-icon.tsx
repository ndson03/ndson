"use client";

import React from "react";

export const GeminiIcon: React.FC = () => {
  return (
    <div className="flex justify-start animate-[fadeIn_0.3s_ease-in]">
      <div className="relative w-10 h-10 flex-shrink-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-full h-full"
          >
            <defs>
              <radialGradient
                id="SVGID_1_"
                cx="-700.8264"
                cy="797.3722"
                r="1.0633"
                gradientTransform="matrix(426.7172 144.2988 1155.938 -3418.313 -622582.4375 2827010)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.067" stopColor="#9168C0" />
                <stop offset="0.3426" stopColor="#5684D1" />
                <stop offset="0.6721" stopColor="#1BA1E3" />
              </radialGradient>
            </defs>

            <path
              fill="url(#SVGID_1_)"
              d="M481,256.4C360.3,263.7,263.7,360.3,256.4,481h-0.9C248.3,360.3,151.7,263.7,31,256.4v-0.9
                C151.7,248.3,248.3,151.7,255.6,31h0.9c7.3,120.7,103.9,217.3,224.6,224.6V256.4z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
