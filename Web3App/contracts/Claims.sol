// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Claims {
    struct Claim {
        uint256 amount;
        bool isApproved;
        bool isSubmitted;
    }

    address public insurer; // Only the insurer can approve/reject claims
    mapping(address => Claim) public claims;

    // Array to track all addresses that have submitted claims
    address[] public claimants;

    event ClaimSubmitted(address indexed claimant, uint256 amount);
    event ClaimApproved(address indexed claimant, uint256 payoutAmount);
    event ClaimRejected(address indexed claimant);

    modifier onlyInsurer() {
        require(tx.origin == insurer, "Only the insurer can call this function");
        _;
    }

    constructor(address _insurer) {
        insurer = _insurer;
    }

    // Submit a claim
    function submitClaim(address claimant, uint256 claimAmount) external {
        Claim storage claim = claims[claimant];
        require(claim.isSubmitted == false, "You already have a pending claim");

        if (claims[msg.sender].isSubmitted == false) {
            claimants.push(msg.sender);
        }
        
        claims[claimant] = Claim({
            amount: claimAmount,
            isApproved: false,
            isSubmitted: true
        });

        emit ClaimSubmitted(claimant, claimAmount);
    }

    function processClaim(address claimant, bool approve) external onlyInsurer {
        Claim storage claim = claims[claimant];
        require(claim.isSubmitted, "No claim has been submitted by this address");

        if (approve) {
            claim.isApproved = true;
            emit ClaimApproved(claimant, claim.amount);
        } else {
            claim.isSubmitted = false;
            emit ClaimRejected(claimant);
        }
    }

    // Withdraw any funds in the contract (only the insurer can call this)
    function withdraw() external onlyInsurer {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");
        payable(insurer).transfer(balance);
    }

     // Function to get the number of claimants
    function getTotalClaimants() public view returns (uint256) {
        return claimants.length;
    }

    // Function to get a claimant address by index
    function getClaimantByIndex(uint256 index) public view returns (address) {
        require(index < claimants.length, "Index out of bounds");
        return claimants[index];
    }
}
