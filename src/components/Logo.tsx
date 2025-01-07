import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center space-x-3">
      {/* <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg animate-pulse" />
        <div className="absolute inset-0.5 bg-gray-900 rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h6v2h-8V7z" />
          </svg>
        </div>
      </div> */}
      <div className="flex flex-col">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          PageSwap
        </span>
        <span className="text-xs text-gray-400 tracking-wider">NEXT-GEN DEX</span>
      </div>
    </div>
  );
};

export default Logo;