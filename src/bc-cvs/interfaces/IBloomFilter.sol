// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IBloomFilter
 * @notice Interface for the Sajjan Bloom Filter optimization layer
 * @dev Provides fast pre-verification check to reduce blockchain queries and gas costs
 * @dev 1 MB bit array = 8,388,608 bits for efficient certificate lookup
 */
interface IBloomFilter {
    /// @notice Emitted when an element is added to the Bloom filter
    event ElementAdded(bytes32 indexed element, uint256 indexed index, uint256 timestamp);

    /// @notice Emitted when the Bloom filter is reset
    event BloomFilterReset(address indexed admin, uint256 timestamp);

    /// @notice Emitted when statistics are updated
    event StatisticsUpdated(uint256 totalElements, uint256 timestamp);

    /**
     * @notice Add a certificate hash to the Bloom filter
     * @param _hash Certificate hash to add
     */
    function add(bytes32 _hash) external;

    /**
     * @notice Batch add multiple certificate hashes
     * @param _hashes Array of certificate hashes to add
     */
    function addBatch(bytes32[] memory _hashes) external;

    /**
     * @notice Check if a certificate hash might exist in the filter
     * @param _hash Certificate hash to check
     * @return mightExist True if the hash might exist (possible false positive),
     *                     False if definitely does not exist (no false negatives)
     */
    function check(bytes32 _hash) external view returns (bool mightExist);

    /**
     * @notice Batch check multiple certificate hashes
     * @param _hashes Array of certificate hashes to check
     * @return results Array of boolean results
     */
    function checkBatch(bytes32[] memory _hashes)
        external
        view
        returns (bool[] memory results);

    /**
     * @notice Get the total number of elements added
     * @return count Total elements added to the filter
     */
    function getTotalElements() external view returns (uint256 count);

    /**
     * @notice Get the bit array size
     * @return size Total bits in the filter
     */
    function getBitArraySize() external pure returns (uint256 size);

    /**
     * @notice Reset the Bloom filter (admin only)
     * @dev WARNING: This clears all data. Use with extreme caution.
     */
    function reset() external;

    /**
     * @notice Get the index for a given hash
     * @param _hash Hash to compute index for
     * @return index The computed index
     */
    function getIndex(bytes32 _hash) external pure returns (uint256 index);
}
