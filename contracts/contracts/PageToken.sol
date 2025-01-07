// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PAGE Token
 * @dev Implementation of the PAGE token with burning capability and permit functionality
 */
contract PAGEToken is ERC20, ERC20Burnable, ERC20Permit, Ownable, Pausable {
    // Maximum supply of PAGE tokens (100 million with 18 decimals)
    uint256 public constant MAXIMUM_SUPPLY = 100_000_000 * 10**18;
    
    // Addresses for different token allocations
    address public stakingPool;
    address public treasuryWallet;
    address public teamWallet;
    
    // Timestamps for vesting periods
    uint256 public teamVestingStart;
    uint256 public constant VESTING_DURATION = 730 days; // 2 years
    
    // Track claimed team tokens
    uint256 public teamTokensClaimed;
    uint256 public constant TEAM_ALLOCATION = 15_000_000 * 10**18; // 15% of total supply
    
    /**
     * @dev Contract constructor
     * @param _treasuryWallet Address of the treasury wallet
     * @param _teamWallet Address of the team wallet
     */
    constructor(
        address _treasuryWallet,
        address _teamWallet
    ) ERC20("PageSwap Token", "PAGE") ERC20Permit("PageSwap Token") Ownable(msg.sender) {
        require(_treasuryWallet != address(0), "Zero treasury address");
        require(_teamWallet != address(0), "Zero team address");
        
        treasuryWallet = _treasuryWallet;
        teamWallet = _teamWallet;
        teamVestingStart = block.timestamp;
        
        // Mint initial supply
        // 50% for staking rewards (50M PAGE)
        _mint(address(this), 50_000_000 * 10**18);
        // 35% for treasury (35M PAGE)
        _mint(_treasuryWallet, 35_000_000 * 10**18);
        // 15% for team (15M PAGE) - held in contract for vesting
    }
    
    /**
     * @dev Sets the staking pool address
     * @param _stakingPool Address of the staking pool contract
     */
    function setStakingPool(address _stakingPool) external onlyOwner {
        require(_stakingPool != address(0), "Zero staking pool address");
        require(stakingPool == address(0), "Staking pool already set");
        stakingPool = _stakingPool;
        
        // Transfer staking allocation to staking pool
        uint256 stakingAllocation = balanceOf(address(this));
        _transfer(address(this), stakingPool, stakingAllocation);
    }
    
    /**
     * @dev Allows team to claim vested tokens
     */
    function claimTeamTokens() external {
        require(msg.sender == teamWallet, "Only team wallet");
        
        uint256 vestedAmount = getVestedAmount();
        require(vestedAmount > teamTokensClaimed, "No tokens to claim");
        
        uint256 claimableAmount = vestedAmount - teamTokensClaimed;
        teamTokensClaimed = vestedAmount;
        
        _mint(teamWallet, claimableAmount);
    }
    
    /**
     * @dev Calculates vested team tokens
     * @return amount of vested tokens
     */
    function getVestedAmount() public view returns (uint256) {
        if (block.timestamp < teamVestingStart) {
            return 0;
        }
        
        if (block.timestamp >= teamVestingStart + VESTING_DURATION) {
            return TEAM_ALLOCATION;
        }
        
        return (TEAM_ALLOCATION * (block.timestamp - teamVestingStart)) / VESTING_DURATION;
    }
    
    // Pause/Unpause functionality
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Override transfer functions to check for paused state
    function _update(address from, address to, uint256 value) internal virtual override(ERC20) {
        require(!paused(), "Token transfers paused");
        super._update(from, to, value);
    }
}