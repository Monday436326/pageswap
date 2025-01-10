import { 
    useAccount, 
    useReadContract, 
    useWriteContract, 
    useWaitForTransactionReceipt
  } from 'wagmi';
  import { parseEther, formatEther } from 'viem';
  
  // ABI for the PAGE token contract
  const tokenAbi = [
    {
      name: 'approve',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ type: 'bool' }]
    },
    {
      name: 'allowance',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' }
      ],
      outputs: [{ type: 'uint256' }]
    },
    {
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ type: 'uint256' }]
    }
  ] as const;
  
  // ABI for the staking contract
  const stakingAbi = [
    {
      name: 'stake',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'amount', type: 'uint256' },
        { name: 'tierId', type: 'uint256' }
      ],
      outputs: []
    },
    {
      name: 'unstake',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'stakeIndex', type: 'uint256' }],
      outputs: []
    },
    {
      name: 'claimRewards',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'stakeIndex', type: 'uint256' }],
      outputs: []
    },
    {
      name: 'getUserStakes',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{
        type: 'tuple[]',
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'lockPeriod', type: 'uint256' },
          { name: 'tier', type: 'uint256' },
          { name: 'lastClaimTime', type: 'uint256' }
        ]
      }]
    },
    {
      name: 'calculateTotalPendingRewards',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{ type: 'uint256' }]
    }
  ] as const;
  
  // Contract addresses (replace with actual deployed addresses)
  const PAGE_TOKEN_ADDRESS = '0xe9b76d5Ff7b523aE313641e68260c6cd85CAFB7b' as const;
  const STAKING_CONTRACT_ADDRESS = '0xe730899a822497909eFA7d51CE1f580Ed04a9F39' as const;
  
  export function usePageBalance() {
    const { address } = useAccount();
  
    const { data: balance, error, isPending } = useReadContract({
      address: PAGE_TOKEN_ADDRESS,
      abi: tokenAbi,
      functionName: 'balanceOf',
      args: [address!],
      query: {
        enabled: Boolean(address),
      }
    });
  
    return {
      balance: balance ? formatEther(balance) : '0',
      error,
      isLoading: isPending
    };
  }
  
  export function useStakingAllowance() {
    const { address } = useAccount();
    const { writeContract, data: hash } = useWriteContract();
  
    const { data: allowance, isPending: isCheckingAllowance } = useReadContract({
      address: PAGE_TOKEN_ADDRESS,
      abi: tokenAbi,
      functionName: 'allowance',
      args: [address!, STAKING_CONTRACT_ADDRESS],
      query: {
        enabled: Boolean(address),
      }
    });
  
    const { isLoading: isApproving } = useWaitForTransactionReceipt({
      hash
    });
  
    const approve = async (amount: string) => {
      await writeContract({
        address: PAGE_TOKEN_ADDRESS,
        abi: tokenAbi,
        functionName: 'approve',
        args: [STAKING_CONTRACT_ADDRESS, parseEther(amount)]
      });
    };
  
    return {
      allowance: allowance ? formatEther(allowance) : '0',
      approve,
      isApproving,
      isCheckingAllowance
    };
  }
  
  export function useStaking() {
    const { address } = useAccount();
    const { writeContract, data: hash } = useWriteContract();
  
    const { data: stakes, isPending: isLoadingStakes } = useReadContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: stakingAbi,
      functionName: 'getUserStakes',
      args: [address!],
      query: {
        enabled: Boolean(address),
      }
    });
  
    const { data: pendingRewards, isPending: isLoadingRewards } = useReadContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: stakingAbi,
      functionName: 'calculateTotalPendingRewards',
      args: [address!],
      query: {
        enabled: Boolean(address),
      }
    });
  
    const { isLoading: isTransactionPending } = useWaitForTransactionReceipt({
      hash
    });
  
    const stake = async (amount: string, tierId: number) => {
      await writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingAbi,
        functionName: 'stake',
        args: [parseEther(amount), BigInt(tierId)]
      });
    };
  
    const unstake = async (stakeIndex: number) => {
      await writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingAbi,
        functionName: 'unstake',
        args: [BigInt(stakeIndex)]
      });
    };
  
    const claimRewards = async (stakeIndex: number) => {
      await writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingAbi,
        functionName: 'claimRewards',
        args: [BigInt(stakeIndex)]
      });
    };
  
    return {
      stakes: stakes || [],
      pendingRewards: pendingRewards ? formatEther(pendingRewards) : '0',
      stake,
      unstake,
      claimRewards,
      isTransactionPending,
      isLoading: isLoadingStakes || isLoadingRewards
    };
  }