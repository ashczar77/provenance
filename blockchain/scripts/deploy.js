import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const DigitalDeed = await ethers.getContractFactory("DigitalDeed");
  const deed = await DigitalDeed.deploy();

  await deed.waitForDeployment();

  console.log("DigitalDeed deployed to:", await deed.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
