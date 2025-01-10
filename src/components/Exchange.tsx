import React from 'react';
import { WormholeWidget } from './WormholeWidget';
// import { useWallet } from '../contexts/WalletContext';
// import { Wallet } from 'lucide-react';

export function Exchange() {
  // const { isConnected, connect } = useWallet();

  // if (!isConnected) {
  //   return (
  //     <div className="max-w-2xl mx-auto">
  //       <div className="relative overflow-hidden backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-2xl shadow-xl p-8 text-center">
  //         {/* Background gradient effect */}
  //         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-pulse" />
          
  //         <div className="relative z-10">
  //           <div className="w-16 h-16 mx-auto mb-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
  //             <Wallet className="w-full h-full text-white animate-float" />
  //           </div>
            
  //           <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
  //             Connect Your Wallet
  //           </h2>
            
  //           <p className="text-gray-400 mb-8 text-lg">
  //             Please connect your wallet to access the exchange
  //           </p>
            
  //           <button
  //             onClick={connect}
  //             className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl 
  //                      shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 
  //                      transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
  //           >
  //             Connect Wallet
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative overflow-hidden backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-2xl shadow-xl p-8">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-pulse" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Cross-Chain Exchange
          </h2>
          
          <div className="transform transition-all duration-500 hover:scale-[1.02]">
            <WormholeWidget />
          </div>
        </div>
      </div>
    </div>
  );
}