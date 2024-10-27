const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Insur", function () {
  let insurancePolicy;
  let claimsContract;
  let owner;
  let user;
  const duration = 30 * 24 * 60 * 60; // 30 days in seconds
  const premium = ethers.parseEther("1"); // 1 ETH premium

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners(); // Get the owner and user accounts

    // Deploy the Claims contract first
    const Claims = await ethers.getContractFactory("Claims");
    claimsContract = await Claims.deploy(owner.address); // Pass the owner as the insurer

    // Deploy the InsurancePolicy contract and link it with the Claims contract
    const InsurancePolicy = await ethers.getContractFactory("Insur");
    insurancePolicy = await InsurancePolicy.deploy(claimsContract.target); // Pass the Claims contract address
  });

  it("should allow a user to purchase a policy", async function () {
    // User purchases a policy
    await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });

    // Fetch policy details for the user
    const policy = await insurancePolicy.getPolicyDetails(user.address);

    // Check that the policy is active and the premium matches
    expect(policy.isActive).to.equal(true);
    expect(policy.premium).to.equal(premium);
    expect(policy.endDate).to.be.gt(policy.startDate); // Check that the end date is after the start date
  });

  it("should check if a policy is active", async function () {
    const premium = ethers.parseEther("1"); // 1 ETH premium

    // User purchases a policy
    await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });

    // Check if the policy is active
    const [isActive, endDate] = await insurancePolicy.connect(user).checkPolicyStatus();
    expect(isActive).to.equal(true); // Policy should be active
    expect(endDate).to.be.gt(0); // End date should be in the future
    });

    it("should return correct policy details", async function () {
        const premium = ethers.parseEther("1"); // 1 ETH premium
    
        // User purchases a policy
        await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });
    
        // Fetch policy details
        const policy = await insurancePolicy.getPolicyDetails(user.address);
    
        // Check if the policy details are correct
        expect(policy.premium).to.equal(premium); // Premium should match the amount sent
        expect(policy.policyHolder).to.equal(user.address); // The policyHolder should be the user
        expect(policy.startDate).to.be.gt(0); // Start date should be set
        expect(policy.endDate).to.be.gt(policy.startDate); // End date should be greater than start date
        expect(policy.isActive).to.equal(true); // Policy should be active
      });

  it("should allow a user to cancel their policy and receive a refund", async function () {
    // User purchases a policy
    await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });

    // Fast forward time by 15 days to calculate partial refund
    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]); // Add 15 days
    await ethers.provider.send("evm_mine", []); // Mine a block to reflect the time change

    // Check user balance before cancellation
    const balanceBefore = await ethers.provider.getBalance(user.address);

    // User cancels the policy
    const cancelTx = await insurancePolicy.connect(user).cancelPolicy();
    const txReceipt = await cancelTx.wait();

    // Check user balance after cancellation and refund
    const balanceAfter = await ethers.provider.getBalance(user.address);

    // Calculate gas cost using effectiveGasPrice and gasUsed in Ethers v6
    //const gasUsed = txReceipt.gasUsed;
    const gasCost = txReceipt.gasUsed*txReceipt.gasPrice; // Multiply gas used by the effective gas price

    // Ensure the refund is greater than the gas used
    expect(balanceAfter).to.be.gt(balanceBefore - gasCost); // Balance after refund should be higher
    });

    it("should expire the policy after its duration", async function () {
        const premium = ethers.parseEther("1"); // 1 ETH premium

        // User purchases a policy
        await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });

        // Fast-forward time by 30 days to simulate the policy duration ending
        await ethers.provider.send("evm_increaseTime", [duration + 1]); // Add 30 days and 1 second
        await ethers.provider.send("evm_mine", []); // Mine a new block to reflect the time change

        // Expire the policy manually
        await insurancePolicy.connect(user).expirePolicy();

        const policy = await insurancePolicy.connect(user).getPolicyDetails(user.address);
        expect(policy.isActive).to.equal(false); // The policy should no longer be active
    });
    it("should allow the owner to withdraw funds from the contract", async function () {
        // User purchases a policy
        await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });

        // Check the contract balance before withdrawal
        const contractBalanceBefore = await ethers.provider.getBalance(insurancePolicy.target);
        expect(contractBalanceBefore).to.equal(premium); // Contract should hold the premium

        // Check owner balance before withdrawal
        const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

        // Owner withdraws the funds
        const withdrawTx = await insurancePolicy.connect(owner).withdraw();
        const txReceipt = await withdrawTx.wait();
        const gasUsed = txReceipt.gasUsed*withdrawTx.gasPrice; // Calculate gas used

        // Check the contract balance after withdrawal
        const contractBalanceAfter = await ethers.provider.getBalance(insurancePolicy.target);
        expect(contractBalanceAfter).to.equal(0); // Contract balance should be 0 after withdrawal

        // Check owner balance after withdrawal
        const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
        expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore-gasUsed); // Owner balance should increase after withdrawal
    });
});
describe("Claims", function () {
    let insurancePolicy;
    let claimsContract;
    let owner;
    let user;
    const duration = 30 * 24 * 60 * 60; // 30 days in seconds
    const premium = ethers.parseEther("1"); // 1 ETH premium

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners(); // Get the owner and user accounts

        // Deploy the Claims contract first
        const Claims = await ethers.getContractFactory("Claims");
        claimsContract = await Claims.deploy(owner.address); // Pass the owner as the insurer

        // Deploy the InsurancePolicy contract and link it with the Claims contract
        const InsurancePolicy = await ethers.getContractFactory("Insur");
        insurancePolicy = await InsurancePolicy.deploy(claimsContract.target); // Pass the Claims contract address
    });


    it("should allow a user to submit a claim", async function () {
        // User purchases a policy
        await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });

        // User submits a claim for 0.5 ETH
        const claimAmount = ethers.parseEther("0.5");
        await insurancePolicy.connect(user).submitClaim(claimAmount);

        // Fetch the claim details from the Claims contract
        const claim = await claimsContract.claims(user.address);
        expect(claim.isSubmitted).to.equal(true);
        expect(claim.amount).to.equal(claimAmount); // Check that the claim amount matches
    });

    it("should allow the insurer to approve a submitted claim", async function () {
        // User purchases a policy
        await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });

        const depositAmount = ethers.parseEther("100"); // 100 ETH
        await owner.sendTransaction({
            to: insurancePolicy.target, // Sending ETH to the InsurancePolicy contract
            value: depositAmount
        });

        // User submits a claim for 0.5 ETH
        const claimAmount = ethers.parseEther("0.5");
        await insurancePolicy.connect(user).submitClaim(claimAmount);

        // Check user balance before claim approval
        const balanceBefore = await ethers.provider.getBalance(user.address);

        // Insurer approves the claim
        await insurancePolicy.connect(owner).processClaim(user.address, true);

        // Fetch the claim details from the Claims contract
        const claim = await claimsContract.claims(user.address);
        expect(claim.isApproved).to.equal(true); // Ensure the claim is approved

        // Check user balance after claim payout
        const balanceAfter = await ethers.provider.getBalance(user.address);
        expect(balanceAfter).to.be.gt(balanceBefore); // Balance should increase after payout
    });

    it("should allow the insurer to reject a submitted claim", async function () {
        // User purchases a policy
        await insurancePolicy.connect(user).purchasePolicy(duration, { value: premium });

        // User submits a claim for 0.5 ETH
        const claimAmount = ethers.parseEther("0.5");
        await insurancePolicy.connect(user).submitClaim(claimAmount);

        // Insurer rejects the claim
        await insurancePolicy.connect(owner).processClaim(user.address, false);

        // Fetch the claim details from the Claims contract
        const claim = await claimsContract.claims(user.address);
        expect(claim.isSubmitted).to.equal(false); // Ensure the claim is no longer submitted
        expect(claim.isApproved).to.equal(false); // Claim should not be approved
    });
});
