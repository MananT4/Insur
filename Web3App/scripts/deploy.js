async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Claims contract first
  const Claims = await ethers.getContractFactory("Claims");
  const claimsContract = await Claims.deploy(deployer.address); // Pass the insurer (owner) address

  console.log("Claims contract deployed to:", claimsContract.target);

  // Deploy the InsurancePolicy contract and pass the Claims contract address
  const InsurancePolicy = await ethers.getContractFactory("Insur");
  const insurancePolicy = await InsurancePolicy.deploy(claimsContract.target); // Pass the Claims contract address

  console.log("InsurancePolicy contract deployed to:", insurancePolicy.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
