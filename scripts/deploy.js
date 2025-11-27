const hre = require("hardhat");

async function main() {
  const baseURI = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const metadataEndpoint = `${baseURI}/api/metadata/`;
  
  console.log("Deploying TrainerProfile contract...");
  console.log("Base URI:", metadataEndpoint);
  
  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const TrainerProfile = await hre.ethers.getContractFactory("TrainerProfile", deployer);
  const trainerProfile = await TrainerProfile.deploy(metadataEndpoint);
  
  await trainerProfile.waitForDeployment();
  
  const address = await trainerProfile.getAddress();
  console.log("TrainerProfile deployed to:", address);
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_TRAINER_PROFILE_CONTRACT_ADDRESS=${address}`);
  
  // Wait for a few block confirmations
  console.log("\nWaiting for block confirmations...");
  await trainerProfile.deploymentTransaction().wait(5);
  
  // Verify contract on BaseScan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nVerifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [metadataEndpoint],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
