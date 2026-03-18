// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IBloomFilter.sol";
import "../../libs/Roles.sol";
import "../../libs/Errors.sol";

/**
 * @title BloomFilter
 * @notice Sajjan Bloom Filter implementation for certificate verification optimization
 * @dev Provides O(1) pre-verification check to reduce blockchain queries and gas costs
 * @dev 1 MB bit array = 8,388,608 bits for efficient certificate lookup
 * @dev False positives possible, but NO false negatives (security maintained)
 */
contract BloomFilter is IBloomFilter, AccessControl {
    // ============================================
    // State Variables
    // ============================================

    /// @notice Total bits in the filter (1 MB = 8,388,608 bits)
    uint256 public constant TOTAL_BITS = 8_388_608;

    /// @notice Array size (TOTAL_BITS / 256 bits per uint256)
    uint256 public constant ARRAY_SIZE = 32_768; // 8,388,608 / 256

    /// @notice Bit array for bloom filter
    uint256[32768] private bitArray;

    /// @notice Total elements added to the filter
    uint256 private totalElements;

    /// @notice Mapping to track if an element was explicitly added (for statistics)
    mapping(bytes32 => bool) private addedElements;

    // ============================================
    // Constructor
    // ============================================

    /// @notice Constructor initializes the contract with admin role
    /// @param _admin Address of the administrator
    constructor(address _admin) {
        if (_admin == address(0)) revert Errors.ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(Roles.ADMINISTRATOR, _admin);
        _grantRole(Roles.BLOOM_FILTER_MANAGER, _admin);
    }

    // ============================================
    // External Functions
    // ============================================

    /**
     * @notice Add a certificate hash to the Bloom filter
     * @param _hash Certificate hash to add
     */
    function add(bytes32 _hash)
        external
        override
        onlyRole(Roles.BLOOM_FILTER_MANAGER)
    {
        if (_hash == bytes32(0)) revert Errors.InvalidCertificateHash();

        uint256 index = _computeIndex(_hash);
        _setBit(index);

        // Track if this is a new element
        if (!addedElements[_hash]) {
            addedElements[_hash] = true;
            totalElements++;
        }

        emit ElementAdded(_hash, index, block.timestamp);
    }

    /**
     * @notice Batch add multiple certificate hashes
     * @param _hashes Array of certificate hashes to add
     */
    function addBatch(bytes32[] memory _hashes)
        external
        override
        onlyRole(Roles.BLOOM_FILTER_MANAGER)
    {
        if (_hashes.length == 0) revert Errors.EmptyBatchOperation();

        for (uint256 i = 0; i < _hashes.length; i++) {
            if (_hashes[i] == bytes32(0)) revert Errors.InvalidCertificateHash();

            uint256 index = _computeIndex(_hashes[i]);
            _setBit(index);

            // Track if this is a new element
            if (!addedElements[_hashes[i]]) {
                addedElements[_hashes[i]] = true;
                totalElements

++;
            }

            emit ElementAdded(_hashes[i], index, block.timestamp);
        }

        emit StatisticsUpdated(totalElements, block.timestamp);
    }

    /**
     * @notice Check if a certificate hash might exist in the filter
     * @param _hash Certificate hash to check
     * @return mightExist True if the hash might exist (possible false positive),
     *                     False if definitely does not exist (no false negatives)
     */
    function check(bytes32 _hash) external view override returns (bool mightExist) {
        if (_hash == bytes32(0)) return false;

        uint256 index = _computeIndex(_hash);
        return _checkBit(index);
    }

    /**
     * @notice Batch check multiple certificate hashes
     * @param _hashes Array of certificate hashes to check
     * @return results Array of boolean results
     */
    function checkBatch(bytes32[] memory _hashes)
        external
        view
        override
        returns (bool[] memory results)
    {
        results = new bool[](_hashes.length);

        for (uint256 i = 0; i < _hashes.length; i++) {
            if (_hashes[i] == bytes32(0)) {
                results[i] = false;
                continue;
            }

            uint256 index = _computeIndex(_hashes[i]);
            results[i] = _checkBit(index);
        }

        return results;
    }

    /**
     * @notice Get the total number of elements added
     * @return count Total elements added to the filter
     */
    function getTotalElements() external view override returns (uint256 count) {
        return totalElements;
    }

    /**
     * @notice Get the bit array size
     * @return size Total bits in the filter
     */
    function getBitArraySize() external pure override returns (uint256 size) {
        return TOTAL_BITS;
    }

    /**
     * @notice Reset the Bloom filter (admin only)
     * @dev WARNING: This clears all data. Use with extreme caution.
     */
    function reset() external override onlyRole(Roles.ADMINISTRATOR) {
        // Clear bit array
        for (uint256 i = 0; i < ARRAY_SIZE; i++) {
            bitArray[i] = 0;
        }

        // Reset counter
        totalElements = 0;

        emit BloomFilterReset(msg.sender, block.timestamp);
        emit StatisticsUpdated(0, block.timestamp);
    }

    /**
     * @notice Get the index for a given hash
     * @param _hash Hash to compute index for
     * @return index The computed index
     */
    function getIndex(bytes32 _hash) external pure override returns (uint256 index) {
        return _computeIndex(_hash);
    }

    // ============================================
    // Internal Functions
    // ============================================

    /**
     * @dev Compute the bit index for a hash
     * @param _hash Hash to compute index for
     * @return index Bit index (0 to TOTAL_BITS-1)
     */
    function _computeIndex(bytes32 _hash) internal pure returns (uint256 index) {
        // Use modulo to map hash to bit array index
        // Formula: Index = (Certificate Hash) mod Total Index
        return uint256(_hash) % TOTAL_BITS;
    }

    /**
     * @dev Set a bit in the bit array
     * @param _bitIndex Index of the bit to set (0 to TOTAL_BITS-1)
     */
    function _setBit(uint256 _bitIndex) internal {
        if (_bitIndex >= TOTAL_BITS) revert Errors.InvalidBitIndex(_bitIndex);

        // Calculate array index and bit position
        uint256 arrayIndex = _bitIndex / 256; // Which uint256 in the array
        uint256 bitPosition = _bitIndex % 256; // Position within that uint256

        // Set the bit using bitwise OR
        bitArray[arrayIndex] |= (uint256(1) << bitPosition);
    }

    /**
     * @dev Check if a bit is set in the bit array
     * @param _bitIndex Index of the bit to check (0 to TOTAL_BITS-1)
     * @return isSet Whether the bit is set
     */
    function _checkBit(uint256 _bitIndex) internal view returns (bool isSet) {
        if (_bitIndex >= TOTAL_BITS) return false;

        // Calculate array index and bit position
        uint256 arrayIndex = _bitIndex / 256;
        uint256 bitPosition = _bitIndex % 256;

        // Check the bit using bitwise AND
        return (bitArray[arrayIndex] & (uint256(1) << bitPosition)) != 0;
    }

    // ============================================
    // Admin Functions
    // ============================================

    /**
     * @notice Grant BLOOM_FILTER_MANAGER role to an address
     * @param _manager Address to grant the role to
     */
    function grantManagerRole(address _manager)
        external
        onlyRole(Roles.ADMINISTRATOR)
    {
        if (_manager == address(0)) revert Errors.ZeroAddress();
        _grantRole(Roles.BLOOM_FILTER_MANAGER, _manager);
    }

    /**
     * @notice Revoke BLOOM_FILTER_MANAGER role from an address
     * @param _manager Address to revoke the role from
     */
    function revokeManagerRole(address _manager)
        external
        onlyRole(Roles.ADMINISTRATOR)
    {
        if (_manager == address(0)) revert Errors.ZeroAddress();
        _revokeRole(Roles.BLOOM_FILTER_MANAGER, _manager);
    }

    /**
     * @notice Get statistics about the Bloom filter
     * @return totalBits Total bits in the filter
     * @return elementsAdded Total elements added
     * @return fillRate Approximate fill rate (elements/total_bits * 100)
     */
    function getStatistics()
        external
        view
        returns (
            uint256 totalBits,
            uint256 elementsAdded,
            uint256 fillRate
        )
    {
        totalBits = TOTAL_BITS;
        elementsAdded = totalElements;

        // Calculate approximate fill rate (percentage)
        // Fill rate = (elements added / total bits) * 100
        // Note: This is an approximation as multiple elements can map to same bit
        if (totalElements == 0) {
            fillRate = 0;
        } else if (totalElements > TOTAL_BITS) {
            fillRate = 100;
        } else {
            fillRate = (totalElements * 100) / TOTAL_BITS;
        }

        return (totalBits, elementsAdded, fillRate);
    }

    /**
     * @notice Check if an element was explicitly added (for debugging)
     * @param _hash Hash to check
     * @return wasAdded Whether the element was explicitly added
     */
    function wasExplicitlyAdded(bytes32 _hash)
        external
        view
        returns (bool wasAdded)
    {
        return addedElements[_hash];
    }
}
