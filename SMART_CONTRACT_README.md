# CampusResourceNFT Smart Contract

## Overview

ERC1155-based smart contract for managing campus resource tokens with reservation and staking functionality.

## Features

- ✅ **ERC1155 Multi-Token Standard**: Each resource is a unique token ID
- ✅ **Reservation System**: One active reservation per resource at a time
- ✅ **Staking Mechanism**: Users stake ETH to reserve resources
- ✅ **EIP-2771 Compatible**: Supports gasless meta-transactions
- ✅ **Role-Based Access**: Resource managers can create new resources
- ✅ **Auto-Release**: Expired reservations are automatically released
- ✅ **Comprehensive Events**: Track all reservation activities
- ✅ **Security**: ReentrancyGuard and AccessControl

## Contract Architecture

### Resource Structure
```solidity
struct Resource {
    string name;                    // "Physics Lab A"
    ResourceCategory category;      // LAB, BOOK, INSTRUMENT, etc.
    bool isReserved;                // Current status
    address currentReserver;        // Who reserved it
    uint256 reservationStart;       // When reservation began
    uint256 reservationEnd;         // When it expires
    uint256 stakedAmount;           // Staked ETH amount
    bool exists;                    // Resource exists flag
}
```

### Categories
- `LAB` (0): Laboratory equipment/space
- `BOOK` (1): Library books
- `INSTRUMENT` (2): Musical/Scientific instruments  
- `EQUIPMENT` (3): General equipment
- `SPACE` (4): Physical spaces/rooms

## Installation

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv

# Or with yarn
yarn add -D hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

## Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```env
PRIVATE_KEY=your_private_key_here
POLYGON_RPC_URL=https://polygon-rpc.com
SEPOLIA_RPC_URL=https://rpc.sepolia.org
POLYGONSCAN_API_KEY=your_api_key
ETHERSCAN_API_KEY=your_api_key
TRUSTED_FORWARDER=0x0000000000000000000000000000000000000000
RESERVATION_STAKE=0.1
METADATA_URI=https://api.campusresources.com/metadata/{id}.json
```

## Compilation

```bash
npx hardhat compile
```

## Testing

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/CampusResourceNFT.test.js

# Run with coverage
npx hardhat coverage
```

### Test Coverage

The test suite includes comprehensive coverage for:
- ✅ Deployment and initialization
- ✅ Resource creation
- ✅ Resource reservation (success and failure cases)
- ✅ Resource release (success and failure cases)
- ✅ Staking and unstaking
- ✅ Auto-release of expired reservations
- ✅ Multiple concurrent reservations
- ✅ Access control
- ✅ View functions
- ✅ EIP-2771 compatibility

## Deployment

### Local Network
```bash
# Start local node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet (Sepolia)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet (Polygon)
```bash
npx hardhat run scripts/deploy.js --network polygon
```

### Deploy with Sample Resources
```bash
CREATE_SAMPLES=true npx hardhat run scripts/deploy.js --network sepolia
```

## Contract Verification

After deployment, verify on block explorer:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "<FORWARDER>" "<STAKE>" "<URI>"
```

Example:
```bash
npx hardhat verify --network sepolia 0x123... "0x0000000000000000000000000000000000000000" "100000000000000000" "https://api.campusresources.com/metadata/{id}.json"
```

## Usage Examples

### Creating a Resource (Resource Manager)

```javascript
const tx = await contract.createResource(
    "Physics Lab A",    // name
    0,                  // category (LAB)
    1,                  // initial supply
    recipientAddress    // who receives tokens
);
```

### Reserving a Resource

```javascript
const stake = ethers.parseEther("0.1");
const duration = 3600; // 1 hour in seconds

const tx = await contract.reserveResource(
    resourceId,
    duration,
    { value: stake }
);
```

### Releasing a Resource

```javascript
const tx = await contract.releaseResource(resourceId);
// Stake is automatically returned to reserver
```

### Checking Reservation Status

```javascript
const isReserved = await contract.isResourceReserved(resourceId);
const currentReserver = await contract.getCurrentReserver(resourceId);
const timeRemaining = await contract.getRemainingReservationTime(resourceId);
```

### Getting Resource Info

```javascript
const resource = await contract.getResource(resourceId);
console.log(resource.name);
console.log(resource.category);
console.log(resource.isReserved);
console.log(resource.currentReserver);
```

## Events

### ResourceCreated
```solidity
event ResourceCreated(
    uint256 indexed resourceId,
    string name,
    ResourceCategory category
);
```

### ResourceReserved
```solidity
event ResourceReserved(
    uint256 indexed resourceId,
    address indexed reserver,
    uint256 stakeAmount,
    uint256 reservationEnd
);
```

### ResourceReleased
```solidity
event ResourceReleased(
    uint256 indexed resourceId,
    address indexed reserver,
    uint256 stakeReturned
);
```

### ReservationExpired
```solidity
event ReservationExpired(
    uint256 indexed resourceId,
    address indexed previousReserver
);
```

## Security Features

### ReentrancyGuard
- Protects against reentrancy attacks in `reserveResource` and `releaseResource`

### Access Control
- `DEFAULT_ADMIN_ROLE`: Can grant/revoke roles
- `RESOURCE_MANAGER_ROLE`: Can create new resources

### Stake Requirements
- Minimum stake enforced for all reservations
- Stake automatically returned on release or expiration

### Time Limits
- Maximum reservation duration: 7 days
- Prevents indefinite resource locking

### EIP-2771 Meta-Transactions
- Supports gasless transactions via trusted forwarder
- Users can reserve resources without paying gas

## Gas Optimization

The contract is optimized for gas efficiency:
- Uses `immutable` for fixed values
- Efficient struct packing
- Minimal storage operations
- Optimized compiler settings

## Frontend Integration

Example using ethers.js v6:

```javascript
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

const contractAddress = "0x...";
const abi = [...]; // Import from artifacts

// Reserve a resource
async function reserveResource(resourceId, durationInSeconds) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const stake = ethers.parseEther("0.1");
    const tx = await contract.reserveResource(resourceId, durationInSeconds, {
        value: stake
    });
    
    await tx.wait();
    console.log("Resource reserved!");
}

// Release a resource
async function releaseResource(resourceId) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const tx = await contract.releaseResource(resourceId);
    await tx.wait();
    console.log("Resource released! Stake returned.");
}
```

## Upgradeability

This contract is **not upgradeable** by design for security and transparency. To upgrade:
1. Deploy a new contract version
2. Migrate resources and state
3. Update frontend to point to new contract

## License

MIT License

## Security Considerations

⚠️ **Important Notes:**
- Always test thoroughly on testnet before mainnet deployment
- Ensure trusted forwarder address is correct for EIP-2771
- Set appropriate reservation stake amount for your use case
- Monitor for expired reservations
- Implement proper access control for resource managers
- Consider implementing pausable functionality for emergencies

## Support

For issues or questions:
- GitHub Issues: [Repository URL]
- Documentation: [Docs URL]
- Discord: [Community URL]

## Changelog

### v1.0.0
- Initial release
- ERC1155 resource tokens
- Reservation system with staking
- EIP-2771 meta-transaction support
- Role-based access control
- Comprehensive test suite
