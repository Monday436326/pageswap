import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Exchange } from './components/Exchange';
import { Stake } from './components/Stake';
import { WalletProvider, useWallet } from './contexts/WalletContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('exchange');
  const { isConnected, connect } = useWallet();

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse transform rotate-12 scale-150" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onConnectWallet={connect}
          isConnected={isConnected}
        />
        
        <main className="container mx-auto py-8 px-4">
          <div className="transition-all duration-500 transform">
            {activeTab === 'exchange' ? <Exchange /> : <Stake />}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;