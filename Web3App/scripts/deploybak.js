async function main() {
    // Get the contract factory
    const InsurContract = await ethers.getContractFactory("InsurContract");
  
    // Deploy the contract (this automatically waits for the contract to be mined)
    console.log("Deploying InsurContract...");
    const insurContract = await InsurContract.deploy();
  
    // Log the contract address directly (no need for `deployed()` in ethers.js v6+)
    console.log("InsurContract deployed to:", insurContract.target); // target is the new address property in ethers.js v6
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  