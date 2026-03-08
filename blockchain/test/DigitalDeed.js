import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("DigitalDeed", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();

    const DigitalDeed = await ethers.getContractFactory("DigitalDeed");
    const deed = await DigitalDeed.deploy();

    return { deed, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { deed, owner } = await deployContract();
      expect(await deed.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint a new deed and assign it to the owner", async function () {
      const { deed, owner } = await deployContract();
      const tokenURI = "ipfs://QmSomeHash";
      const serialNumber = "SN12345678";

      await deed.safeMint(owner.address, tokenURI, serialNumber);

      expect(await deed.ownerOf(0)).to.equal(owner.address);
      expect(await deed.tokenURI(0)).to.equal(tokenURI);
      expect(await deed.getSerialNumber(0)).to.equal(serialNumber);
    });

    it("Should fail if the same serial number is used twice", async function () {
      const { deed, owner, otherAccount } = await deployContract();
      const tokenURI = "ipfs://QmSomeHash";
      const serialNumber = "SN12345678";

      await deed.safeMint(owner.address, tokenURI, serialNumber);
      
      await expect(
        deed.connect(otherAccount).safeMint(otherAccount.address, "ipfs://someOtherHash", serialNumber)
      ).to.be.revertedWithCustomError(deed, "SerialNumberAlreadyUsed");
    });
  });
});
