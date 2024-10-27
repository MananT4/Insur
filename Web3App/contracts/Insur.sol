//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Claims.sol";

contract Insur{
    struct Policy {
        address policyHolder;
        uint256 premium;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
    }

    mapping(address => Policy) public policies;
    address public owner;
    Claims public claimsContract;
    bool internal reentrancylock = false;

    constructor(address claimsContractAddress) {
    owner = msg.sender; // Initialize the owner to the deployer's address
    claimsContract = Claims(claimsContractAddress); // Deploy the Claims contract
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can execute this action.");
        _;
    }

    modifier onlyPolicyHolder() {
        require(msg.sender == policies[msg.sender].policyHolder, "Only the policy holder can execute this action.");
        _;
    }

    modifier reentrancyGuard() {
        require(!reentrancylock, "Reentrancy guard");
        reentrancylock = true;
        _;
        reentrancylock = false;
    }

    event PolicyPurchased(address indexed policyHolder, uint256 premiumAmount, uint256 policyStart, uint256 policyEnd);
    event Withdrawal(address indexed owner, uint256 amount);
    event PolicyExpired(address indexed policyHolder, uint256 endDate);
    event PolicyCancelled(address indexed policyHolder, uint256 refundAmount);

    function purchasePolicy(uint256 durationInSeconds) public payable {
        require(msg.value > 0, "You must send ETH to purchase a policy");
        require(policies[msg.sender].isActive == false, "You already have an active policy");

        // Set policy details
        policies[msg.sender] = Policy({
            premium: msg.value,
            policyHolder: msg.sender,
            startDate: block.timestamp,
            endDate: block.timestamp + durationInSeconds,
            isActive: true
        });

        emit PolicyPurchased(msg.sender, msg.value, block.timestamp, block.timestamp + durationInSeconds);
    }

    // Function to withdraw funds from the contract (onlyOwner)
    function withdraw() public onlyOwner reentrancyGuard{
        uint256 balance = address(this).balance; // Check contract balance
        require(balance > 0, "Contract balance is zero"); // Ensure there's balance to withdraw

        // Send balance to the owner
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Transfer failed");
        emit Withdrawal(owner, balance);
    }

    function checkPolicyStatus() public view returns (bool isActive, uint256 endDate) {
        Policy memory policy = policies[msg.sender]; // Retrieve the policy of the sender
        
        if (policy.isActive == false) {
            return (false, 0); // No active policy if isActive is false
        }
        
        // Check if the policy has expired
        // Active if isActive is true and current time is before end date
        isActive = policy.isActive && block.timestamp <= policy.endDate;
        endDate = policy.endDate;

        return (isActive, endDate);
    }

    // Deactivate the policy after it expires
    function expirePolicy() public onlyPolicyHolder {
        Policy storage policy = policies[msg.sender];
        require(block.timestamp >= policy.endDate, "Policy has not expired yet");

        policy.isActive = false;
        emit PolicyExpired(msg.sender, policy.endDate);
    }

    // Retrieve the policy details for a given address
    function getPolicyDetails(address policyHolder) public view returns (Policy memory) {
        return policies[policyHolder];
    }

    // Cancel an active policy and optionally refund part of the premium
    function cancelPolicy() public {
        Policy storage policy = policies[msg.sender];
        require(policy.isActive, "You do not have an active policy");

        uint256 remainingTime = policy.endDate > block.timestamp ? policy.endDate - block.timestamp : 0;
        uint256 refundAmount = (remainingTime * policy.premium) / (policy.endDate - policy.startDate);

        policy.isActive = false;

        if (refundAmount > 0) {
            payable(msg.sender).transfer(refundAmount);
        }

        emit PolicyCancelled(msg.sender, refundAmount);
    }

    // Submit a claim via the Claims contract
    function submitClaim(uint256 claimAmount) public {
        Policy memory policy = policies[msg.sender];
        require(policy.isActive, "You do not have an active policy");

        // Forward the claim submission to the Claims contract
        claimsContract.submitClaim(msg.sender, claimAmount);
    }

    function processClaim(address claimant, bool approve) public onlyOwner {
        claimsContract.processClaim(claimant, approve);

        // If the claim is approved, transfer the payout
        if (approve) {
            // Get the claim details (this could be done with an event listener instead)
            (uint256 claimAmount, , ) = claimsContract.claims(claimant);
            _transferPayout(claimant, claimAmount);
        }
    }

    // Internal function to transfer Ether to the claimant
    function _transferPayout(address claimant, uint256 amount) internal {
        require(address(this).balance >= amount, "Insufficient contract balance");

        (bool success, ) = payable(claimant).call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    // Function to recieve ether in the contract
    receive() external payable {}

    // Fallback function to receive ETH
    fallback() external payable {}
}