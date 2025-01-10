import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CoinsIcon, TrendingUp, LockIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import { usePageBalance, useStakingAllowance, useStaking } from '../hooks/staking';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const LOCK_PERIODS = [
  { months: 1, apr: 0.57 },
  { months: 3, apr: 1.72 },
  { months: 6, apr: 3.44 },
  { months: 12, apr: 6.87 },
  { months: 24, apr: 13.74 },
  { months: 48, apr: 27.87 }
];

export function Stake() {
  const { isConnected } = useAccount();
  const [stakingAmount, setStakingAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(LOCK_PERIODS[0]);

  const { balance, isLoading: isLoadingBalance } = usePageBalance();
  const { 
    allowance, 
    approve, 
    isApproving, 
    isCheckingAllowance 
  } = useStakingAllowance();
  
  const { 
    stakes,
    pendingRewards,
    stake,
    unstake,
    claimRewards,
    isTransactionPending,
    isLoading: isLoadingStakes
  } = useStaking();

  const handleStake = async () => {
    try {
      // Check if approval is needed
      if (parseEther(allowance) < parseEther(stakingAmount)) {
        await approve(stakingAmount);
        return; // Wait for approval transaction to complete
      }

      // Perform stake
      const periodIndex = LOCK_PERIODS.findIndex(p => p.months === selectedPeriod.months);
      await stake(stakingAmount, periodIndex);
      setStakingAmount('');
    } catch (error) {
      console.error('Error staking:', error);
    }
  };

  const handleUnstake = async (stakeIndex: number) => {
    try {
      await unstake(stakeIndex);
    } catch (error) {
      console.error('Error unstaking:', error);
    }
  };

  const handleClaim = async (stakeIndex: number) => {
    try {
      await claimRewards(stakeIndex);
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-2xl shadow-xl p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 animate-pulse" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Please connect your wallet to access staking
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = isTransactionPending || isApproving;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative overflow-hidden backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-2xl shadow-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Stake PAGE Tokens
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your $PAGE Balance</p>
              <p className="text-xl font-bold text-white">
                {isLoadingBalance ? 'Loading...' : `${balance} PAGE`}
              </p>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Stats Cards */}
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
                    {isLoadingStakes ? 'Loading...' : formatEther(
                      stakes.reduce((acc, stake) => {
                        const amount = typeof stake.amount === 'bigint' ? stake.amount : BigInt(stake.amount);
                        return acc + amount;
                      }, 0n)
                    )} PAGE
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden backdrop-blur-xl bg-gray-700/30 p-6 rounded-xl border border-gray-600/50 
                          transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="text-green-400" />
                    <p className="text-gray-300">Pending Rewards</p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {isLoadingStakes ? 'Loading...' : `${pendingRewards} PAGE`}
                  </p>
                </div>
              </div>
            </div>

            {/* Staking Form */}
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
                      disabled={isProcessing}
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
                    disabled={isProcessing}
                  />
                  <button
                    onClick={() => setStakingAmount(balance)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-400 hover:text-purple-300"
                    disabled={isProcessing}
                  >
                    MAX
                  </button>
                </div>
              </div>

              <button
                onClick={handleStake}
                disabled={isProcessing || !stakingAmount || Number(stakingAmount) <= 0}
                className={cn(
                  "w-full py-4 px-6 rounded-xl transition-all duration-300 transform",
                  isProcessing || !stakingAmount || Number(stakingAmount) <= 0
                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 hover:-translate-y-1"
                )}
              >
                {isApproving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                    <span>Approving...</span>
                  </div>
                ) : isTransactionPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                    <span>Staking...</span>
                  </div>
                ) : parseEther(allowance) < parseEther(stakingAmount || '0') ? (
                  'Approve PAGE'
                ) : (
                  'Stake Tokens'
                )}
              </button>
            </div>

            {/* Active Stakes */}
            {stakes && stakes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Active Stakes</h3>
                <div className="space-y-4">
                  {stakes.map((stake, index) => {
                    const stakeAmount = typeof stake.amount === 'bigint' ? stake.amount : BigInt(stake.amount);
                    const startTime = typeof stake.startTime === 'bigint' ? stake.startTime : BigInt(stake.startTime);
                    const lockPeriod = typeof stake.lockPeriod === 'bigint' ? stake.lockPeriod : BigInt(stake.lockPeriod);
                    const now = BigInt(Math.floor(Date.now() / 1000));
                    const isUnlocked = now >= startTime + lockPeriod;

                    return (
                      <div
                        key={index}
                        className="relative overflow-hidden backdrop-blur-xl bg-gray-700/30 p-6 rounded-xl border border-gray-600/50"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Staked Amount</p>
                            <p className="text-lg font-bold text-white">
                              {formatEther(stakeAmount)} PAGE
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Lock Period</p>
                            <p className="text-lg font-bold text-white">
                              {LOCK_PERIODS[Number(stake.tier)].months} Months
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Start Time</p>
                            <p className="text-lg font-bold text-white">
                              {new Date(Number(startTime) * 1000).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">APR</p>
                            <p className="text-lg font-bold text-white">
                              {LOCK_PERIODS[Number(stake.tier)].apr}%
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                          <button
                            onClick={() => handleClaim(index)}
                            disabled={isProcessing}
                            className={cn(
                              "flex-1 py-2 px-4 rounded-xl transition-all duration-300 transform",
                              isProcessing
                                ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
                            )}
                          >
                            {isProcessing ? 'Processing...' : 'Claim Rewards'}
                          </button>

                          {isUnlocked && (
                            <button
                              onClick={() => handleUnstake(index)}
                              disabled={isProcessing}
                              className={cn(
                                "flex-1 py-2 px-4 rounded-xl transition-all duration-300 transform",
                                isProcessing
                                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
                              )}
                            >
                              {isProcessing ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                                  <span>Processing...</span>
                                </div>
                              ) : (
                                'Unstake'
                              )}
                            </button>
                          )}
                        </div>

                        {/* Lock Period Status */}
                        {!isUnlocked ? (
                          <div className="mt-2 text-sm text-gray-400">
                            Time until unlock: {formatTimeRemaining(Number(startTime + lockPeriod - now))}
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-green-400">
                            Ready to unstake
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Rewards Summary */}
            {Number(pendingRewards) > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-white">Total Pending Rewards</h4>
                    <p className="text-sm text-gray-400">Available to claim across all stakes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {pendingRewards} PAGE
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time remaining
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Unlocked';
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || 'Less than 1 minute';
}