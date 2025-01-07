import { WormholeConnectConfig, WormholeConnectTheme } from '@wormhole-foundation/wormhole-connect';

export const wormholeConfig: WormholeConnectConfig = {
  tokens: ['ETH', 'WETH', 'MATIC', 'WMATIC', 'AVAX', 'SOL'],
};

export const wormholeTheme: WormholeConnectTheme = {
  mode: "dark",
  input: "#181a2d",
  primary: "#9E77ED",
  secondary: "#667085",
  text: "#ffffff",
  textSecondary: "#79859e",
  error: "#F04438",
  success: "#12B76A",
  badge: "#010101",
  font: "\"Inter\", sans-serif"
};