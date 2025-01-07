// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PAGE Token Staking Contract
 * @dev Allows users to stake PAGE tokens for rewards with different lock periods
 */
contract PAGEStaking is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Staking token (PAGE)
    IERC20 public pageToken;
    
    // Staking tiers with lock periods and APR
    struct StakingTier {
        uint256 months;      // Lock period in months
        uint256 apr;         // Annual percentage rate (multiplied by 100 for precision)
        bool isActive;       // Whether this tier is active
    }
    
    // Staking information for each user
    struct StakeInfo {
        uint256 amount;          // Staked amount
        uint256 startTime;       // Start time of stake
        uint256 lockPeriod;      // Lock period in seconds
        uint256 tier;            // Tier index
        uint256 lastClaimTime;   // Last reward claim timestamp
    }
    
    // Mapping of tier index to tier info
    StakingTier[] public stakingTiers;
    
    // Mapping of user address to their stakes
    mapping(address => StakeInfo[]) public userStakes;
    
    // Total staked amount
    uint256 public totalStaked;

    // Emergency withdrawal fee percentage (default 10%)
    uint256 public emergencyWithdrawalFee = 1000; // 10.00%
    uint256 public constant MAX_EMERGENCY_FEE = 2000; // 20.00%
    uint256 public constant PERCENTAGE_SCALE = 10000; // 100.00%
    
    // Treasury address for fees
    address public treasury;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 tier, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 stakeIndex);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 stakeIndex);
    event TierAdded(uint256 months, uint256 apr);
    event TierUpdated(uint256 tierId, uint256 apr, bool isActive);
    event EmergencyWithdraw(address indexed user, uint256 amount, uint256 fee);
    event EmergencyWithdrawalFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);
    
    /**
     * @dev Contract constructor
     * @param _pageToken Address of the PAGE token contract
     * @param _treasury Address of the treasury for fees
     */
    constructor(address _pageToken, address _treasury) Ownable(msg.sender) {
        require(_pageToken != address(0), "Zero token address");
        require(_treasury != address(0), "Zero treasury address");
        pageToken = IERC20(_pageToken);
        treasury = _treasury;
        
        // Initialize staking tiers
        stakingTiers.push(StakingTier(1, 57, true));     // 0.57% APR
        stakingTiers.push(StakingTier(3, 172, true));    // 1.72% APR
        stakingTiers.push(StakingTier(6, 344, true));    // 3.44% APR
        stakingTiers.push(StakingTier(12, 687, true));   // 6.87% APR
        stakingTiers.push(StakingTier(24, 1374, true));  // 13.74% APR
        stakingTiers.push(StakingTier(48, 2787, true));  // 27.87% APR
    }
    
    /**
     * @dev Allows users to stake tokens
     * @param amount Amount of tokens to stake
     * @param tierId ID of the staking tier
     */
    function stake(uint256 amount, uint256 tierId) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(tierId < stakingTiers.length, "Invalid tier");
        require(stakingTiers[tierId].isActive, "Tier not active");
        
        StakingTier memory tier = stakingTiers[tierId];
        uint256 lockPeriod = tier.months * 30 days;
        
        // Transfer tokens to contract
        pageToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Create new stake
        userStakes[msg.sender].push(StakeInfo({
            amount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod,
            tier: tierId,
            lastClaimTime: block.timestamp
        }));
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, tierId, lockPeriod);
    }
    
    /**
     * @dev Allows users to unstake tokens after lock period
     * @param stakeIndex Index of the stake to unstake
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(block.timestamp >= stakeInfo.startTime + stakeInfo.lockPeriod, "Lock period not ended");
        require(stakeInfo.amount > 0, "Already unstaked");
        
        // Claim any remaining rewards
        _claimRewards(msg.sender, stakeIndex);
        
        uint256 amount = stakeInfo.amount;
        stakeInfo.amount = 0;
        totalStaked -= amount;
        
        pageToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, stakeIndex);
    }
    
    /**
     * @dev Emergency withdrawal with fee
     * @param stakeIndex Index of the stake to withdraw
     */
    function emergencyWithdraw(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(stakeInfo.amount > 0, "Already withdrawn");
        
        uint256 amount = stakeInfo.amount;
        uint256 fee = (amount * emergencyWithdrawalFee) / PERCENTAGE_SCALE;
        uint256 withdrawAmount = amount - fee;
        
        stakeInfo.amount = 0;
        totalStaked -= amount;
        
        // Transfer fee to treasury
        if (fee > 0) {
            pageToken.safeTransfer(treasury, fee);
        }
        
        // Transfer remaining amount to user
        pageToken.safeTransfer(msg.sender, withdrawAmount);
        
        emit EmergencyWithdraw(msg.sender, withdrawAmount, fee);
    }
    
    /**
     * @dev Claims rewards for a specific stake
     * @param stakeIndex Index of the stake
     */
    function claimRewards(uint256 stakeIndex) external nonReentrant {
        _claimRewards(msg.sender, stakeIndex);
    }
    
    /**
     * @dev Claims rewards for multiple stakes
     * @param stakeIndexes Array of stake indexes to claim
     */
    function claimMultipleRewards(uint256[] calldata stakeIndexes) external nonReentrant {
        for (uint256 i = 0; i < stakeIndexes.length; i++) {
            _claimRewards(msg.sender, stakeIndexes[i]);
        }
    }
    
    /**
     * @dev Internal function to calculate and transfer rewards
     * @param user Address of the user
     * @param stakeIndex Index of the stake
     */
    function _claimRewards(address user, uint256 stakeIndex) internal {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        
        StakeInfo storage stakeInfo = userStakes[user][stakeIndex];
        require(stakeInfo.amount > 0, "No active stake");
        
        uint256 timePassed = block.timestamp - stakeInfo.lastClaimTime;
        require(timePassed > 0, "No rewards yet");
        
        StakingTier memory tier = stakingTiers[stakeInfo.tier];
        
        // Calculate rewards: amount * (APR/100) * (timePassed/365 days)
        uint256 rewards = (stakeInfo.amount * tier.apr * timePassed) / (365 days * 10000);
        
        if (rewards > 0) {
            stakeInfo.lastClaimTime = block.timestamp;
            pageToken.safeTransfer(user, rewards);
            emit RewardsClaimed(user, rewards, stakeIndex);
        }
    }
    
    /**
     * @dev Gets the number of stakes for a user
     * @param user Address of the user
     * @return Number of stakes
     */
    function getStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }
    
    /**
     * @dev Gets all stakes for a user
     * @param user Address of the user
     * @return Array of stake information
     */
    function getUserStakes(address user) external view returns (StakeInfo[] memory) {
        return userStakes[user];
    }
    
    /**
     * @dev Gets active stakes for a user (amount > 0)
     * @param user Address of the user
     * @return activeStakes Array of active stake information
     * @return indexes Array of stake indexes
     */
    function getActiveStakes(address user) external view returns (StakeInfo[] memory activeStakes, uint256[] memory indexes) {
        StakeInfo[] memory allStakes = userStakes[user];
        uint256 activeCount = 0;
        
        // Count active stakes
        for (uint256 i = 0; i < allStakes.length; i++) {
            if (allStakes[i].amount > 0) {
                activeCount++;
            }
        }
        
        // Create arrays for active stakes and their indexes
        activeStakes = new StakeInfo[](activeCount);
        indexes = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        // Fill arrays
        for (uint256 i = 0; i < allStakes.length; i++) {
            if (allStakes[i].amount > 0) {
                activeStakes[currentIndex] = allStakes[i];
                indexes[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return (activeStakes, indexes);
    }
    
    /**
     * @dev Calculates pending rewards for a stake
     * @param user Address of the user
     * @param stakeIndex Index of the stake
     * @return Pending reward amount
     */
    function calculatePendingRewards(address user, uint256 stakeIndex) external view returns (uint256) {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        
        StakeInfo memory stakeInfo = userStakes[user][stakeIndex];
        if (stakeInfo.amount == 0) return 0;
        
        uint256 timePassed = block.timestamp - stakeInfo.lastClaimTime;
        if (timePassed == 0) return 0;
        
        StakingTier memory tier = stakingTiers[stakeInfo.tier];
        return (stakeInfo.amount * tier.apr * timePassed) / (365 days * 10000);
    }
    
    /**
     * @dev Calculates total pending rewards for all stakes of a user
     * @param user Address of the user
     * @return Total pending reward amount
     */
    function calculateTotalPendingRewards(address user) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            StakeInfo memory stakeInfo = userStakes[user][i];
            if (stakeInfo.amount > 0) {
                uint256 timePassed = block.timestamp - stakeInfo.lastClaimTime;
                if (timePassed > 0) {
                    StakingTier memory tier = stakingTiers[stakeInfo.tier];
                    total += (stakeInfo.amount * tier.apr * timePassed) / (365 days * 10000);
                }
            }
        }
        return total;
    }
    
    // Admin functions
    
    /**
     * @dev Updates APR for a tier
     * @param tierId ID of the tier to update
     * @param newApr New APR value (multiplied by 100)
     * @param isActive Whether the tier should be active
     */
    function updateTier(uint256 tierId, uint256 newApr, bool isActive) external onlyOwner {
        require(tierId < stakingTiers.length, "Invalid tier");
        stakingTiers[tierId].apr = newApr;
        stakingTiers[tierId].isActive = isActive;
        emit TierUpdated(tierId, newApr, isActive);
    }
    
    /**
     * @dev Adds a new staking tier
     * @param months Lock period in months
     * @param apr APR for the tier (multiplied by 100)
     */
    function addTier(uint256 months, uint256 apr) external onlyOwner {
        stakingTiers.push(StakingTier(months, apr, true));
        emit TierAdded(months, apr);
    }
    
    /**
     * @dev Updates the emergency withdrawal fee
     * @param newFee New fee percentage (multiplied by 100)
     */
    function updateEmergencyWithdrawalFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_EMERGENCY_FEE, "Fee too high");
        emergencyWithdrawalFee = newFee;
        emit EmergencyWithdrawalFeeUpdated(newFee);
    }
    
    /**
     * @dev Updates the treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Zero treasury address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }
    
    /**
     * @dev Allows owner to pause staking
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Allows owner to unpause staking
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency function to recover tokens
     * @param token Address of the token to recover
     * @param amount Amount of tokens to recover
     */
    function recoverTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        
        if (token == address(pageToken)) {
            // For PAGE tokens, only allow recovery of tokens that aren't staked
            uint256 balance = pageToken.balanceOf(address(this));
            require(balance > totalStaked, "No tokens to recover");
            require(amount <= balance - totalStaked, "Cannot recover staked tokens");
        }
        
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Emergency function to recover native coins (e.g., ETH)
     * @param amount Amount of native coins to recover
     */
    function recoverNativeCoins(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Get current tier information
     * @return Array of tier information
     */
    function getTiers() external view returns (StakingTier[] memory) {
        return stakingTiers;
    }

    /**
     * @dev Get time until unlock for a specific stake
     * @param user Address of the user
     * @param stakeIndex Index of the stake
     * @return Time remaining in seconds until unlock
     */
    function getTimeUntilUnlock(address user, uint256 stakeIndex) external view returns (uint256) {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        StakeInfo memory stakeInfo = userStakes[user][stakeIndex];
        
        if (stakeInfo.amount == 0 || block.timestamp >= stakeInfo.startTime + stakeInfo.lockPeriod) {
            return 0;
        }
        
        return (stakeInfo.startTime + stakeInfo.lockPeriod) - block.timestamp;
    }

    /**
     * @dev Check if a stake can be unstaked
     * @param user Address of the user
     * @param stakeIndex Index of the stake
     * @return Whether the stake can be unstaked
     */
    function canUnstake(address user, uint256 stakeIndex) external view returns (bool) {
        if (stakeIndex >= userStakes[user].length) return false;
        
        StakeInfo memory stakeInfo = userStakes[user][stakeIndex];
        return stakeInfo.amount > 0 && block.timestamp >= stakeInfo.startTime + stakeInfo.lockPeriod;
    }

    /**
     * @dev Get detailed information about a specific tier
     * @param tierId ID of the tier
     * @return months Lock period in months
     * @return apr Annual percentage rate
     * @return isActive Whether the tier is active
     * @return totalStakedInTier Total amount staked in this tier
     */
    function getTierInfo(uint256 tierId) external view returns (
        uint256 months,
        uint256 apr,
        bool isActive,
        uint256 totalStakedInTier
    ) {
        require(tierId < stakingTiers.length, "Invalid tier");
        StakingTier memory tier = stakingTiers[tierId];
        
        uint256 stakedInTier = 0;
        address[] memory stakers = new address[](0); // Placeholder for potential stakers tracking
        
        for (uint256 i = 0; i < stakers.length; i++) {
            StakeInfo[] memory userStakeList = userStakes[stakers[i]];
            for (uint256 j = 0; j < userStakeList.length; j++) {
                if (userStakeList[j].tier == tierId && userStakeList[j].amount > 0) {
                    stakedInTier += userStakeList[j].amount;
                }
            }
        }
        
        return (tier.months, tier.apr, tier.isActive, stakedInTier);
    }

    // Function to receive ETH
    receive() external payable {}

}