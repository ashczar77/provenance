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

      await deed.safeMint(owner.address, tokenURI);

      expect(await deed.ownerOf(0)).to.equal(owner.address);
      expect(await deed.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should fail if a non-owner tries to mint", async function () {
      const { deed, otherAccount } = await deployContract();
      const tokenURI = "ipfs://QmSomeHash";

      await expect(
        deed.connect(otherAccount).safeMint(otherAccount.address, tokenURI)
      ).to.be.reverted;
    });
  });
});
