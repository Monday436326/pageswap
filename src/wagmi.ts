
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, base, mainnet, optimism, polygon, opBNB, bsc, bscGreenfield, bscTestnet, } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'PageSwap',
  projectId: '9a65b54a9cd89df934f3269520b35ba3',
  chains: [mainnet, polygon, optimism, arbitrum, base, opBNB, bsc, bscGreenfield, bscTestnet],
});
