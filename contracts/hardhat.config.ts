import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";
import * as dotenv from "dotenv";

dotenv.config();

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "";
const ARBITRUM_API_KEY = process.env.ARBITRUM_API_KEY || "";      
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";
const BSCSCAN_API_KEY_TESTNET = "J4JWQTRKJCHAKS555QY3BYDFEQYD2CB5UH";
const HASHSCAN_API_KEY = process.env.HASHSCAN_API_KEY || "";

// RPC URLs
const MAINNET_RPC = process.env.MAINNET_RPC || "https://eth-mainnet.g.alchemy.com/v2/your-api-key";
const POLYGON_RPC = process.env.POLYGON_RPC || "https://polygon-mainnet.g.alchemy.com/v2/your-api-key";
const ARBITRUM_RPC = process.env.ARBITRUM_RPC || "https://arb-mainnet.g.alchemy.com/v2/your-api-key";
const BSC_RPC = process.env.BSC_RPC || "https://bsc-dataseed.binance.org/";
const BSC_RPC_TESTNET = process.env.BSC_RPC_TESTNET || "https://data-seed-prebsc-1-s1.binance.org:8545/";
const HEDERA_TESTNET = process.env.HEDERA_TESTNET || "https://testnet.mirrornode.hedera.com:5600";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // Mainnet networks
    mainnet: {
      url: MAINNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 1,
    },
    polygon: {
      url: POLYGON_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 137,
    },
    arbitrum: {
      url: ARBITRUM_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 42161,
    },
    bsc: {
      url: BSC_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 56,
    },
    // Testnet networks
    bscTestnet: {
      url: BSC_RPC_TESTNET,
      accounts: [PRIVATE_KEY],
      chainId: 97,
    },
    hederaTestnet: {
      url: HEDERA_TESTNET,
      accounts: [PRIVATE_KEY],
      chainId: 296,
    },
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      accounts: [PRIVATE_KEY],
      chainId: 421613,
    },
    // Local network
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      polygon: POLYGON_API_KEY,
      arbitrumOne: ARBITRUM_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygonMumbai: POLYGON_API_KEY,
      arbitrumGoerli: ARBITRUM_API_KEY,
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY_TESTNET,
      hederaTestnet: HASHSCAN_API_KEY,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    ignition: "./ignition",
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;