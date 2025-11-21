const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CampusResourceNFT contract...\n");

  // Configuration
  const TRUSTED_FORWARDER = process.env.TRUSTED_FORWARDER || ethers.ZeroAddress;
  const RESERVATION_STAKE = ethers.parseEther(process.env.RESERVATION_STAKE || "0.1");
  const METADATA_URI = process.env.METADATA_URI || "https://api.campusresources.com/metadata/{id}.json";

  console.log("Configuration:");
  console.log("- Network:", hre.network.name);
  console.log("- Trusted Forwarder:", TRUSTED_FORWARDER);
  console.log("- Reservation Stake:", ethers.formatEther(RESERVATION_STAKE), "ETH");
  console.log("- Metadata URI:", METADATA_URI);
  console.log();

  // Deploy contract
  const CampusResourceNFT = await ethers.getContractFactory("CampusResourceNFT");
  const contract = await CampusResourceNFT.deploy(
    TRUSTED_FORWARDER,
    RESERVATION_STAKE,
    METADATA_URI
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ CampusResourceNFT deployed to:", contractAddress);
  console.log();

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log();

  // Verify roles
  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  const RESOURCE_MANAGER_ROLE = await contract.RESOURCE_MANAGER_ROLE();

  console.log("Access Control:");
  console.log("- Admin role granted to:", deployer.address);
  console.log("- Resource Manager role granted to:", deployer.address);
  console.log();

  // Create sample resources (optional)
  if (process.env.CREATE_SAMPLES === "true") {
    console.log("📝 Creating sample resources...");
    
    const samples = [
      { name: "Physics Lab A", category: 0, supply: 1 },
      { name: "Quantum Mechanics Textbook", category: 1, supply: 5 },
      { name: "Grand Piano", category: 2, supply: 1 },
      { name: "Oscilloscope", category: 3, supply: 3 },
      { name: "Conference Room 101", category: 4, supply: 1 },
    ];

    for (let i = 0; i < samples.length; i++) {
      const { name, category, supply } = samples[i];
      const tx = await contract.createResource(name, category, supply, deployer.address);
      await tx.wait();
      console.log(`  ✓ Created: ${name} (ID: ${i}, Category: ${category}, Supply: ${supply})`);
    }
    console.log();
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    trustedForwarder: TRUSTED_FORWARDER,
    reservationStake: ethers.formatEther(RESERVATION_STAKE),
    metadataURI: METADATA_URI,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log();

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 To verify contract on block explorer:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${TRUSTED_FORWARDER}" "${RESERVATION_STAKE}" "${METADATA_URI}"`);
    console.log();
  }

  console.log("✨ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
