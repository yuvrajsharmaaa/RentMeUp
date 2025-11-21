const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CampusResourceNFT", function () {
  // Deployment fixture
  async function deployCampusResourceNFTFixture() {
    const [owner, user1, user2, resourceManager, trustedForwarder] = await ethers.getSigners();

    const reservationStake = ethers.parseEther("0.1"); // 0.1 ETH stake
    const uri = "https://api.campusresources.com/metadata/{id}.json";

    const CampusResourceNFT = await ethers.getContractFactory("CampusResourceNFT");
    const contract = await CampusResourceNFT.deploy(
      trustedForwarder.address,
      reservationStake,
      uri
    );

    // Grant resource manager role
    const RESOURCE_MANAGER_ROLE = await contract.RESOURCE_MANAGER_ROLE();
    await contract.grantRole(RESOURCE_MANAGER_ROLE, resourceManager.address);

    return { 
      contract, 
      owner, 
      user1, 
      user2, 
      resourceManager, 
      trustedForwarder,
      reservationStake,
      RESOURCE_MANAGER_ROLE
    };
  }

  describe("Deployment", function () {
    it("Should set the correct reservation stake", async function () {
      const { contract, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      expect(await contract.RESERVATION_STAKE()).to.equal(reservationStake);
    });

    it("Should grant admin and resource manager roles to deployer", async function () {
      const { contract, owner } = await loadFixture(deployCampusResourceNFTFixture);
      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      const RESOURCE_MANAGER_ROLE = await contract.RESOURCE_MANAGER_ROLE();
      
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await contract.hasRole(RESOURCE_MANAGER_ROLE, owner.address)).to.be.true;
    });

    it("Should set max reservation duration to 7 days", async function () {
      const { contract } = await loadFixture(deployCampusResourceNFTFixture);
      expect(await contract.MAX_RESERVATION_DURATION()).to.equal(7 * 24 * 60 * 60);
    });
  });

  describe("Resource Creation", function () {
    it("Should create a new resource successfully", async function () {
      const { contract, resourceManager, user1 } = await loadFixture(deployCampusResourceNFTFixture);
      
      const tx = await contract.connect(resourceManager).createResource(
        "Physics Lab A",
        0, // LAB category
        1, // initial supply
        user1.address
      );

      await expect(tx)
        .to.emit(contract, "ResourceCreated")
        .withArgs(0, "Physics Lab A", 0);

      const resource = await contract.getResource(0);
      expect(resource.name).to.equal("Physics Lab A");
      expect(resource.category).to.equal(0);
      expect(resource.exists).to.be.true;
      expect(resource.isReserved).to.be.false;
    });

    it("Should mint tokens to recipient", async function () {
      const { contract, resourceManager, user1 } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource(
        "Chemistry Book",
        1, // BOOK category
        5, // initial supply
        user1.address
      );

      expect(await contract.balanceOf(user1.address, 0)).to.equal(5);
    });

    it("Should fail if not called by resource manager", async function () {
      const { contract, user1, user2 } = await loadFixture(deployCampusResourceNFTFixture);
      
      await expect(
        contract.connect(user2).createResource(
          "Piano",
          2, // INSTRUMENT category
          1,
          user1.address
        )
      ).to.be.reverted;
    });

    it("Should fail with empty name", async function () {
      const { contract, resourceManager, user1 } = await loadFixture(deployCampusResourceNFTFixture);
      
      await expect(
        contract.connect(resourceManager).createResource(
          "",
          0,
          1,
          user1.address
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should increment resource ID counter", async function () {
      const { contract, resourceManager, user1 } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab 1", 0, 1, user1.address);
      await contract.connect(resourceManager).createResource("Lab 2", 0, 1, user1.address);
      await contract.connect(resourceManager).createResource("Lab 3", 0, 1, user1.address);

      const resource3 = await contract.getResource(2);
      expect(resource3.name).to.equal("Lab 3");
    });
  });

  describe("Resource Reservation", function () {
    it("Should reserve a resource successfully", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      // Create a resource
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      const duration = 3600; // 1 hour
      const tx = await contract.connect(user1).reserveResource(0, duration, {
        value: reservationStake
      });

      const blockTime = await time.latest();
      
      await expect(tx)
        .to.emit(contract, "ResourceReserved")
        .withArgs(0, user1.address, reservationStake, blockTime + duration);

      const resource = await contract.getResource(0);
      expect(resource.isReserved).to.be.true;
      expect(resource.currentReserver).to.equal(user1.address);
      expect(resource.stakedAmount).to.equal(reservationStake);
    });

    it("Should update user's total staked amount", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      await contract.connect(user1).reserveResource(0, 3600, {
        value: reservationStake
      });

      expect(await contract.totalStakedByUser(user1.address)).to.equal(reservationStake);
    });

    it("Should add to reservation history", async function () {
      const { contract, resourceManager, user1 } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      await contract.connect(user1).reserveResource(0, 3600, {
        value: ethers.parseEther("0.1")
      });

      const history = await contract.getReservationHistory(0);
      expect(history.length).to.equal(1);
      expect(history[0]).to.equal(user1.address);
    });

    it("Should fail if resource doesn't exist", async function () {
      const { contract, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await expect(
        contract.connect(user1).reserveResource(999, 3600, {
          value: reservationStake
        })
      ).to.be.revertedWithCustomError(contract, "ResourceDoesNotExist");
    });

    it("Should fail if insufficient stake provided", async function () {
      const { contract, resourceManager, user1 } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      await expect(
        contract.connect(user1).reserveResource(0, 3600, {
          value: ethers.parseEther("0.05") // Half of required stake
        })
      ).to.be.revertedWithCustomError(contract, "InsufficientStake");
    });

    it("Should fail if resource is already reserved", async function () {
      const { contract, resourceManager, user1, user2, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      // User1 reserves first
      await contract.connect(user1).reserveResource(0, 3600, {
        value: reservationStake
      });

      // User2 tries to reserve
      await expect(
        contract.connect(user2).reserveResource(0, 3600, {
          value: reservationStake
        })
      ).to.be.revertedWithCustomError(contract, "ResourceAlreadyReserved");
    });

    it("Should fail if duration exceeds maximum", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      const tooLongDuration = 8 * 24 * 60 * 60; // 8 days
      
      await expect(
        contract.connect(user1).reserveResource(0, tooLongDuration, {
          value: reservationStake
        })
      ).to.be.revertedWithCustomError(contract, "ReservationDurationTooLong");
    });

    it("Should auto-release expired reservation when new user reserves", async function () {
      const { contract, resourceManager, user1, user2, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      // User1 reserves for 1 hour
      await contract.connect(user1).reserveResource(0, 3600, {
        value: reservationStake
      });

      // Fast forward past expiration
      await time.increase(3601);

      // User2 reserves (should auto-release user1's expired reservation)
      const tx = await contract.connect(user2).reserveResource(0, 3600, {
        value: reservationStake
      });

      await expect(tx)
        .to.emit(contract, "ReservationExpired")
        .withArgs(0, user1.address);

      const resource = await contract.getResource(0);
      expect(resource.currentReserver).to.equal(user2.address);
    });
  });

  describe("Resource Release", function () {
    it("Should release a reserved resource successfully", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      await contract.connect(user1).reserveResource(0, 3600, {
        value: reservationStake
      });

      const initialBalance = await ethers.provider.getBalance(user1.address);

      const tx = await contract.connect(user1).releaseResource(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(contract, "ResourceReleased")
        .withArgs(0, user1.address, reservationStake);

      const resource = await contract.getResource(0);
      expect(resource.isReserved).to.be.false;
      expect(resource.currentReserver).to.equal(ethers.ZeroAddress);
      expect(resource.stakedAmount).to.equal(0);

      // Check stake was returned
      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.closeTo(
        initialBalance + reservationStake - gasUsed,
        ethers.parseEther("0.001") // Account for gas fluctuations
      );
    });

    it("Should update user's total staked amount on release", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      await contract.connect(user1).reserveResource(0, 3600, {
        value: reservationStake
      });

      await contract.connect(user1).releaseResource(0);

      expect(await contract.totalStakedByUser(user1.address)).to.equal(0);
    });

    it("Should fail if resource is not reserved", async function () {
      const { contract, resourceManager, user1 } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);

      await expect(
        contract.connect(user1).releaseResource(0)
      ).to.be.revertedWithCustomError(contract, "ResourceNotReserved");
    });

    it("Should fail if caller is not the reserver", async function () {
      const { contract, resourceManager, user1, user2, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      await contract.connect(user1).reserveResource(0, 3600, {
        value: reservationStake
      });

      await expect(
        contract.connect(user2).releaseResource(0)
      ).to.be.revertedWithCustomError(contract, "NotResourceReserver");
    });

    it("Should fail if resource doesn't exist", async function () {
      const { contract, user1 } = await loadFixture(deployCampusResourceNFTFixture);
      
      await expect(
        contract.connect(user1).releaseResource(999)
      ).to.be.revertedWithCustomError(contract, "ResourceDoesNotExist");
    });
  });

  describe("View Functions", function () {
    it("Should check if resource is reserved correctly", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      expect(await contract.isResourceReserved(0)).to.be.false;

      await contract.connect(user1).reserveResource(0, 3600, {
        value: reservationStake
      });

      expect(await contract.isResourceReserved(0)).to.be.true;

      await contract.connect(user1).releaseResource(0);

      expect(await contract.isResourceReserved(0)).to.be.false;
    });

    it("Should return correct current reserver", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      expect(await contract.getCurrentReserver(0)).to.equal(ethers.ZeroAddress);

      await contract.connect(user1).reserveResource(0, 3600, {
        value: reservationStake
      });

      expect(await contract.getCurrentReserver(0)).to.equal(user1.address);
    });

    it("Should calculate remaining reservation time correctly", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      const duration = 7200; // 2 hours
      await contract.connect(user1).reserveResource(0, duration, {
        value: reservationStake
      });

      const remaining = await contract.getRemainingReservationTime(0);
      expect(remaining).to.be.closeTo(duration, 5); // Within 5 seconds

      // Fast forward 1 hour
      await time.increase(3600);

      const remainingAfter = await contract.getRemainingReservationTime(0);
      expect(remainingAfter).to.be.closeTo(3600, 5);
    });

    it("Should return full reservation history", async function () {
      const { contract, resourceManager, user1, user2, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      
      // User1 reserves and releases
      await contract.connect(user1).reserveResource(0, 3600, { value: reservationStake });
      await contract.connect(user1).releaseResource(0);

      // User2 reserves and releases
      await contract.connect(user2).reserveResource(0, 3600, { value: reservationStake });
      await contract.connect(user2).releaseResource(0);

      const history = await contract.getReservationHistory(0);
      expect(history.length).to.equal(2);
      expect(history[0]).to.equal(user1.address);
      expect(history[1]).to.equal(user2.address);
    });
  });

  describe("Multiple Reservations", function () {
    it("Should allow user to reserve multiple different resources", async function () {
      const { contract, resourceManager, user1, reservationStake } = await loadFixture(deployCampusResourceNFTFixture);
      
      // Create multiple resources
      await contract.connect(resourceManager).createResource("Lab A", 0, 1, user1.address);
      await contract.connect(resourceManager).createResource("Book B", 1, 1, user1.address);
      await contract.connect(resourceManager).createResource("Piano C", 2, 1, user1.address);

      // Reserve all three
      await contract.connect(user1).reserveResource(0, 3600, { value: reservationStake });
      await contract.connect(user1).reserveResource(1, 3600, { value: reservationStake });
      await contract.connect(user1).reserveResource(2, 3600, { value: reservationStake });

      // Check all are reserved
      expect(await contract.isResourceReserved(0)).to.be.true;
      expect(await contract.isResourceReserved(1)).to.be.true;
      expect(await contract.isResourceReserved(2)).to.be.true;

      // Check total staked
      expect(await contract.totalStakedByUser(user1.address)).to.equal(
        reservationStake * 3n
      );
    });
  });

  describe("EIP-2771 Compatibility", function () {
    it("Should support meta-transactions through trusted forwarder", async function () {
      const { contract, trustedForwarder } = await loadFixture(deployCampusResourceNFTFixture);
      
      // Verify trusted forwarder is set correctly
      expect(await contract.isTrustedForwarder(trustedForwarder.address)).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to grant resource manager role", async function () {
      const { contract, owner, user1, RESOURCE_MANAGER_ROLE } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(owner).grantRole(RESOURCE_MANAGER_ROLE, user1.address);
      
      expect(await contract.hasRole(RESOURCE_MANAGER_ROLE, user1.address)).to.be.true;
    });

    it("Should allow resource manager to create resources", async function () {
      const { contract, owner, user1, user2, RESOURCE_MANAGER_ROLE } = await loadFixture(deployCampusResourceNFTFixture);
      
      await contract.connect(owner).grantRole(RESOURCE_MANAGER_ROLE, user1.address);
      
      await expect(
        contract.connect(user1).createResource("New Lab", 0, 1, user2.address)
      ).to.not.be.reverted;
    });
  });
});
