import React, { useState } from 'react';
import { CoinsIcon, TrendingUp, Wallet, LockIcon } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { cn } from '../utils/cn';

const LOCK_PERIODS = [
  { months: 1, apr: 0.57 },
  { months: 3, apr: 1.72 },
  { months: 6, apr: 3.44 },
  { months: 12, apr: 6.87 },
  { months: 24, apr: 13.74 },
  { months: 48, apr: 27.87 }
];

export function Stake() {
  const [stakedAmount, setStakedAmount] = useState('0');
  const [stakingAmount, setStakingAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(LOCK_PERIODS[0]);
  const [isStaking, setIsStaking] = useState(false);
  const { isConnected, connect } = useWallet();
  const pageBalance = '1,000.00'; // Mock balance - replace with actual balance from wallet

  const handleStake = () => {
    setIsStaking(true);
    setTimeout(() => {
      setStakedAmount((prev) => (Number(prev) + Number(stakingAmount)).toString());
      setStakingAmount('');
      setIsStaking(false);
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-2xl shadow-xl p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 animate-pulse" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-6 p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Wallet className="w-full h-full text-white animate-float" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Connect Your Wallet
            </h2>
            
            <p className="text-gray-400 mb-8 text-lg">
              Please connect your wallet to access staking
            </p>
            
            <button
              onClick={connect}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-xl 
                       shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 
                       transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative overflow-hidden backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-2xl shadow-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Stake Tokens
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your $PAGE Balance</p>
              <p className="text-xl font-bold text-white">{pageBalance} PAGE</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative overflow-hidden backdrop-blur-xl bg-gray-700/30 p-6 rounded-xl border border-gray-600/50 
                          transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-2">
                    <CoinsIcon className="text-purple-400" />
                    <p className="text-gray-300">Total Staked</p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stakedAmount} PAGE
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden backdrop-blur-xl bg-gray-700/30 p-6 rounded-xl border border-gray-600/50 
                          transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="text-green-400" />
                    <p className="text-gray-300">Current APR</p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {selectedPeriod.apr}%
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lock Period
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {LOCK_PERIODS.map((period) => (
                    <button
                      key={period.months}
                      onClick={() => setSelectedPeriod(period)}
                      className={cn(
                        "relative overflow-hidden group p-4 rounded-xl border transition-all duration-300",
                        selectedPeriod.months === period.months
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-gray-600/50 bg-gray-700/30 hover:border-purple-500/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <LockIcon size={16} className="text-purple-400" />
                        <span className="text-sm text-gray-400">APR</span>
                      </div>
                      <p className="text-lg font-bold text-white">{period.months} Month{period.months > 1 ? 's' : ''}</p>
                      <p className="text-sm text-purple-400">{period.apr}%</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Stake
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-xl px-4 py-3 
                             text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 
                             focus:border-purple-500/50 transition-all duration-300"
                    placeholder="Enter amount"
                  />
                  <button
                    onClick={() => setStakingAmount(pageBalance)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-400 hover:text-purple-300"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <button
                onClick={handleStake}
                disabled={isStaking || !stakingAmount}
                className={cn(
                  "w-full py-4 px-6 rounded-xl transition-all duration-300 transform",
                  isStaking || !stakingAmount
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 hover:-translate-y-1"
                )}
              >
                {isStaking ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                    <span>Staking...</span>
                  </div>
                ) : (
                  'Stake Tokens'
                )}
              </button>

              <button
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl 
                         shadow-lg shadow-green-500/25 hover:shadow-green-500/40 
                         transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                Claim Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}