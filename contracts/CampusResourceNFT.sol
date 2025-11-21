// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CampusResourceNFT
 * @author Campus Resources Team
 * @notice ERC1155 smart contract for managing campus resource tokens (labs, books, instruments)
 * @dev Implements ERC1155 with reservation logic and EIP-2771 meta-transaction support
 * 
 * Features:
 * - Each resource is a unique token ID with metadata
 * - One active reservation per resource at a time
 * - Staking mechanism for reservations
 * - Gasless transactions via EIP-2771
 * - Role-based access control for resource management
 */
contract CampusResourceNFT is ERC1155, AccessControl, ERC2771Context, ReentrancyGuard {
    
    /// @notice Role identifier for resource managers
    bytes32 public constant RESOURCE_MANAGER_ROLE = keccak256("RESOURCE_MANAGER_ROLE");
    
    /// @notice Minimum stake required to reserve a resource (in wei)
    uint256 public immutable RESERVATION_STAKE;
    
    /// @notice Maximum reservation duration in seconds (default: 7 days)
    uint256 public constant MAX_RESERVATION_DURATION = 7 days;
    
    /**
     * @notice Resource category enumeration
     * @dev Categories help organize and filter resources
     */
    enum ResourceCategory {
        LAB,           // Laboratory equipment/space
        BOOK,          // Library books
        INSTRUMENT,    // Musical/Scientific instruments
        EQUIPMENT,     // General equipment
        SPACE          // Physical spaces/rooms
    }
    
    /**
     * @notice Resource metadata structure
     * @dev Stores all information about a resource
     */
    struct Resource {
        string name;                    // Resource name (e.g., "Physics Lab A")
        ResourceCategory category;      // Resource type
        bool isReserved;                // Current reservation status
        address currentReserver;        // Address of current reserver (address(0) if not reserved)
        uint256 reservationStart;       // Timestamp when reservation started
        uint256 reservationEnd;         // Timestamp when reservation expires
        uint256 stakedAmount;           // Amount staked by current reserver
        bool exists;                    // Flag to check if resource exists
    }
    
    /// @notice Mapping from resource ID to Resource struct
    mapping(uint256 => Resource) public resources;
    
    /// @notice Mapping from user address to their staked amounts across all reservations
    mapping(address => uint256) public totalStakedByUser;
    
    /// @notice Mapping from resource ID to reservation history (for tracking)
    mapping(uint256 => address[]) public reservationHistory;
    
    /// @notice Counter for generating unique resource IDs
    uint256 private _resourceIdCounter;
    
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Emitted when a resource is successfully reserved
     * @param resourceId The ID of the reserved resource
     * @param reserver Address of the user who reserved the resource
     * @param stakeAmount Amount of tokens staked for the reservation
     * @param reservationEnd Timestamp when the reservation expires
     */
    event ResourceReserved(
        uint256 indexed resourceId,
        address indexed reserver,
        uint256 stakeAmount,
        uint256 reservationEnd
    );
    
    /**
     * @notice Emitted when a resource is released from reservation
     * @param resourceId The ID of the released resource
     * @param reserver Address of the user who released the resource
     * @param stakeReturned Amount of stake returned to the user
     */
    event ResourceReleased(
        uint256 indexed resourceId,
        address indexed reserver,
        uint256 stakeReturned
    );
    
    /**
     * @notice Emitted when a new resource is created
     * @param resourceId The ID of the newly created resource
     * @param name Name of the resource
     * @param category Category of the resource
     */
    event ResourceCreated(
        uint256 indexed resourceId,
        string name,
        ResourceCategory category
    );
    
    /**
     * @notice Emitted when a reservation expires and is auto-released
     * @param resourceId The ID of the resource
     * @param previousReserver Address of the previous reserver
     */
    event ReservationExpired(
        uint256 indexed resourceId,
        address indexed previousReserver
    );
    
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Thrown when attempting to reserve an already reserved resource
    error ResourceAlreadyReserved(uint256 resourceId, address currentReserver);
    
    /// @notice Thrown when attempting to release a resource that isn't reserved
    error ResourceNotReserved(uint256 resourceId);
    
    /// @notice Thrown when a non-reserver tries to release a resource
    error NotResourceReserver(uint256 resourceId, address caller);
    
    /// @notice Thrown when insufficient stake is provided for reservation
    error InsufficientStake(uint256 provided, uint256 required);
    
    /// @notice Thrown when attempting to interact with a non-existent resource
    error ResourceDoesNotExist(uint256 resourceId);
    
    /// @notice Thrown when reservation duration exceeds maximum allowed
    error ReservationDurationTooLong(uint256 requested, uint256 maximum);
    
    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Initializes the CampusResourceNFT contract
     * @param trustedForwarder Address of the EIP-2771 trusted forwarder for meta-transactions
     * @param reservationStake Minimum stake required for reservations (in wei)
     * @param uri Base URI for token metadata
     */
    constructor(
        address trustedForwarder,
        uint256 reservationStake,
        string memory uri
    ) ERC1155(uri) ERC2771Context(trustedForwarder) {
        require(reservationStake > 0, "Stake must be greater than zero");
        
        RESERVATION_STAKE = reservationStake;
        
        // Grant admin and resource manager roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(RESOURCE_MANAGER_ROLE, _msgSender());
    }
    
    /*//////////////////////////////////////////////////////////////
                        RESOURCE MANAGEMENT
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Creates a new resource token
     * @dev Only callable by addresses with RESOURCE_MANAGER_ROLE
     * @param name Name of the resource
     * @param category Category of the resource
     * @param initialSupply Initial supply of tokens to mint
     * @param recipient Address to receive the initial supply
     * @return resourceId The ID of the newly created resource
     */
    function createResource(
        string calldata name,
        ResourceCategory category,
        uint256 initialSupply,
        address recipient
    ) external onlyRole(RESOURCE_MANAGER_ROLE) returns (uint256 resourceId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than zero");
        require(recipient != address(0), "Invalid recipient address");
        
        resourceId = _resourceIdCounter++;
        
        resources[resourceId] = Resource({
            name: name,
            category: category,
            isReserved: false,
            currentReserver: address(0),
            reservationStart: 0,
            reservationEnd: 0,
            stakedAmount: 0,
            exists: true
        });
        
        _mint(recipient, resourceId, initialSupply, "");
        
        emit ResourceCreated(resourceId, name, category);
    }
    
    /*//////////////////////////////////////////////////////////////
                        RESERVATION LOGIC
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Reserves a resource by staking tokens
     * @dev Requires exact RESERVATION_STAKE to be sent with transaction
     * @dev Only one active reservation per resource at a time
     * @param resourceId The ID of the resource to reserve
     * @param duration Duration of the reservation in seconds (max 7 days)
     */
    function reserveResource(uint256 resourceId, uint256 duration) 
        external 
        payable 
        nonReentrant 
    {
        Resource storage resource = resources[resourceId];
        
        // Validation checks
        if (!resource.exists) {
            revert ResourceDoesNotExist(resourceId);
        }
        
        if (duration > MAX_RESERVATION_DURATION) {
            revert ReservationDurationTooLong(duration, MAX_RESERVATION_DURATION);
        }
        
        if (msg.value < RESERVATION_STAKE) {
            revert InsufficientStake(msg.value, RESERVATION_STAKE);
        }
        
        // Check if resource is currently reserved
        if (resource.isReserved && block.timestamp < resource.reservationEnd) {
            revert ResourceAlreadyReserved(resourceId, resource.currentReserver);
        }
        
        // If previous reservation expired, auto-release it first
        if (resource.isReserved && block.timestamp >= resource.reservationEnd) {
            _autoReleaseExpiredReservation(resourceId);
        }
        
        // Update resource reservation state
        resource.isReserved = true;
        resource.currentReserver = _msgSender();
        resource.reservationStart = block.timestamp;
        resource.reservationEnd = block.timestamp + duration;
        resource.stakedAmount = msg.value;
        
        // Update user's total staked amount
        totalStakedByUser[_msgSender()] += msg.value;
        
        // Record reservation in history
        reservationHistory[resourceId].push(_msgSender());
        
        emit ResourceReserved(resourceId, _msgSender(), msg.value, resource.reservationEnd);
    }
    
    /**
     * @notice Releases a reserved resource and returns the stake
     * @dev Only the current reserver can call this function
     * @param resourceId The ID of the resource to release
     */
    function releaseResource(uint256 resourceId) external nonReentrant {
        Resource storage resource = resources[resourceId];
        
        // Validation checks
        if (!resource.exists) {
            revert ResourceDoesNotExist(resourceId);
        }
        
        if (!resource.isReserved) {
            revert ResourceNotReserved(resourceId);
        }
        
        if (resource.currentReserver != _msgSender()) {
            revert NotResourceReserver(resourceId, _msgSender());
        }
        
        // Store values before resetting
        address reserver = resource.currentReserver;
        uint256 stakeToReturn = resource.stakedAmount;
        
        // Reset reservation state
        resource.isReserved = false;
        resource.currentReserver = address(0);
        resource.reservationStart = 0;
        resource.reservationEnd = 0;
        resource.stakedAmount = 0;
        
        // Update user's total staked amount
        totalStakedByUser[reserver] -= stakeToReturn;
        
        // Return stake to reserver
        (bool success, ) = reserver.call{value: stakeToReturn}("");
        require(success, "Stake refund failed");
        
        emit ResourceReleased(resourceId, reserver, stakeToReturn);
    }
    
    /**
     * @notice Internal function to auto-release expired reservations
     * @param resourceId The ID of the resource with expired reservation
     */
    function _autoReleaseExpiredReservation(uint256 resourceId) internal {
        Resource storage resource = resources[resourceId];
        
        address previousReserver = resource.currentReserver;
        uint256 stakeToReturn = resource.stakedAmount;
        
        // Reset reservation state
        resource.isReserved = false;
        resource.currentReserver = address(0);
        resource.reservationStart = 0;
        resource.reservationEnd = 0;
        resource.stakedAmount = 0;
        
        // Update user's total staked amount
        totalStakedByUser[previousReserver] -= stakeToReturn;
        
        // Return stake
        (bool success, ) = previousReserver.call{value: stakeToReturn}("");
        require(success, "Stake refund failed");
        
        emit ReservationExpired(resourceId, previousReserver);
    }
    
    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Gets complete resource information
     * @param resourceId The ID of the resource
     * @return Resource struct containing all resource data
     */
    function getResource(uint256 resourceId) external view returns (Resource memory) {
        if (!resources[resourceId].exists) {
            revert ResourceDoesNotExist(resourceId);
        }
        return resources[resourceId];
    }
    
    /**
     * @notice Checks if a resource is currently reserved
     * @param resourceId The ID of the resource
     * @return bool True if reserved and not expired, false otherwise
     */
    function isResourceReserved(uint256 resourceId) external view returns (bool) {
        Resource memory resource = resources[resourceId];
        return resource.isReserved && block.timestamp < resource.reservationEnd;
    }
    
    /**
     * @notice Gets the reservation history for a resource
     * @param resourceId The ID of the resource
     * @return Array of addresses that have reserved this resource
     */
    function getReservationHistory(uint256 resourceId) 
        external 
        view 
        returns (address[] memory) 
    {
        return reservationHistory[resourceId];
    }
    
    /**
     * @notice Gets the current reserver of a resource
     * @param resourceId The ID of the resource
     * @return Address of current reserver, or address(0) if not reserved
     */
    function getCurrentReserver(uint256 resourceId) external view returns (address) {
        Resource memory resource = resources[resourceId];
        if (resource.isReserved && block.timestamp < resource.reservationEnd) {
            return resource.currentReserver;
        }
        return address(0);
    }
    
    /**
     * @notice Gets time remaining on a reservation
     * @param resourceId The ID of the resource
     * @return Seconds remaining, or 0 if not reserved/expired
     */
    function getRemainingReservationTime(uint256 resourceId) 
        external 
        view 
        returns (uint256) 
    {
        Resource memory resource = resources[resourceId];
        if (resource.isReserved && block.timestamp < resource.reservationEnd) {
            return resource.reservationEnd - block.timestamp;
        }
        return 0;
    }
    
    /*//////////////////////////////////////////////////////////////
                        EIP-2771 OVERRIDES
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Returns the sender of the transaction (supports meta-transactions)
     * @dev Overrides both Context and ERC2771Context
     */
    function _msgSender() 
        internal 
        view 
        virtual 
        override(Context, ERC2771Context) 
        returns (address) 
    {
        return ERC2771Context._msgSender();
    }
    
    /**
     * @notice Returns the calldata of the transaction (supports meta-transactions)
     * @dev Overrides both Context and ERC2771Context
     */
    function _msgData() 
        internal 
        view 
        virtual 
        override(Context, ERC2771Context) 
        returns (bytes calldata) 
    {
        return ERC2771Context._msgData();
    }
    
    /**
     * @notice Checks interface support
     * @dev Overrides ERC1155 and AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @notice Returns the context suffix length for EIP-2771
     * @dev Required for proper meta-transaction handling
     */
    function _contextSuffixLength()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (uint256)
    {
        return ERC2771Context._contextSuffixLength();
    }
}
