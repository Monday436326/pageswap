import React from 'react';
import { Wallet, ArrowLeftRight, CoinsIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import Logo from './Logo';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onConnectWallet: () => void;
  isConnected: boolean;
}

export function Navbar({ activeTab, onTabChange, onConnectWallet, isConnected }: NavbarProps) {
  return (
    <nav className="backdrop-blur-xl border-b border-gray-800/50 bg-gray-900/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <Logo />
          
          <div className="flex space-x-2 bg-gray-800/50 p-1 rounded-lg backdrop-blur-lg">
            <button
              onClick={() => onTabChange('exchange')}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-500',
                activeTab === 'exchange'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              )}
            >
              <ArrowLeftRight size={20} className="transition-transform group-hover:scale-110" />
              <span>Exchange</span>
            </button>
            
            <button
              onClick={() => onTabChange('stake')}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-500',
                activeTab === 'stake'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              )}
            >
              <CoinsIcon size={20} className="transition-transform group-hover:scale-110" />
              <span>Stake</span>
            </button>
          </div>
        </div>
        <ConnectButton />
        {/* <button
          onClick={onConnectWallet}
          className={cn(
            'flex items-center space-x-2 px-6 py-2 rounded-lg transition-all duration-500 transform hover:scale-105',
            isConnected
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/25'
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
          )}
        >
          <Wallet size={20} className="transition-transform group-hover:scale-110" />
          <span>{isConnected ? 'Connected' : 'Connect Wallet'}</span>
        </button> */}
      </div>
    </nav>
  );
}