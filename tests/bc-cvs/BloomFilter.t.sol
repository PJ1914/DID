// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/bc-cvs/BloomFilter.sol";
import "../../src/libs/Roles.sol";
import "../../src/libs/Errors.sol";

contract BloomFilterTest is Test {
    BloomFilter public bloomFilter;

    address public admin = address(0x1);
    address public manager = address(0x2);
    address public user = address(0x3);

    bytes32 public testHash1 = keccak256("test1");
    bytes32 public testHash2 = keccak256("test2");
    bytes32 public testHash3 = keccak256("test3");

    function setUp() public {
        vm.startPrank(admin);

        bloomFilter = new BloomFilter(admin);
        bloomFilter.grantManagerRole(manager);

        vm.stopPrank();
    }

    // ============================================
    // Constructor Tests
    // ============================================

    function test_Constructor() public {
        assertTrue(bloomFilter.hasRole(Roles.ADMINISTRATOR, admin));
        assertTrue(bloomFilter.hasRole(Roles.BLOOM_FILTER_MANAGER, admin));
    }

    function test_Constructor_RevertZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new BloomFilter(address(0));
    }

    // ============================================
    // Add Tests
    // ============================================

    function test_Add_Success() public {
        vm.prank(manager);
        vm.expectEmit(true, true, false, true);
        emit IBloomFilter.ElementAdded(testHash1, bloomFilter.getIndex(testHash1), block.timestamp);
        bloomFilter.add(testHash1);

        assertTrue(bloomFilter.check(testHash1));
        assertEq(bloomFilter.getTotalElements(), 1);
    }

    function test_Add_RevertZeroHash() public {
        vm.prank(manager);
        vm.expectRevert(Errors.InvalidCertificateHash.selector);
        bloomFilter.add(bytes32(0));
    }

    function test_Add_RevertNotManager() public {
        vm.prank(user);
        vm.expectRevert();
        bloomFilter.add(testHash1);
    }

    function test_Add_Duplicate() public {
        vm.startPrank(manager);

        bloomFilter.add(testHash1);
        assertEq(bloomFilter.getTotalElements(), 1);

        // Adding again should not increase count
        bloomFilter.add(testHash1);
        assertEq(bloomFilter.getTotalElements(), 1);

        vm.stopPrank();
    }

    // ============================================
    // AddBatch Tests
    // ============================================

    function test_AddBatch_Success() public {
        bytes32[] memory hashes = new bytes32[](3);
        hashes[0] = testHash1;
        hashes[1] = testHash2;
        hashes[2] = testHash3;

        vm.prank(manager);
        bloomFilter.addBatch(hashes);

        assertTrue(bloomFilter.check(testHash1));
        assertTrue(bloomFilter.check(testHash2));
        assertTrue(bloomFilter.check(testHash3));
        assertEq(bloomFilter.getTotalElements(), 3);
    }

    function test_AddBatch_RevertEmpty() public {
        bytes32[] memory hashes = new bytes32[](0);

        vm.prank(manager);
        vm.expectRevert(Errors.EmptyBatchOperation.selector);
        bloomFilter.addBatch(hashes);
    }

    // ============================================
    // Check Tests
    // ============================================

    function test_Check_NotExists() public {
        assertFalse(bloomFilter.check(testHash1));
    }

    function test_Check_Exists() public {
        vm.prank(manager);
        bloomFilter.add(testHash1);

        assertTrue(bloomFilter.check(testHash1));
    }

    function test_Check_ZeroHash() public {
        assertFalse(bloomFilter.check(bytes32(0)));
    }

    // ============================================
    // CheckBatch Tests
    // ============================================

    function test_CheckBatch_Success() public {
        // Add some hashes
        vm.startPrank(manager);
        bloomFilter.add(testHash1);
        bloomFilter.add(testHash2);
        vm.stopPrank();

        // Check batch
        bytes32[] memory hashes = new bytes32[](3);
        hashes[0] = testHash1;
        hashes[1] = testHash2;
       hashes[2] = testHash3;

        bool[] memory results = bloomFilter.checkBatch(hashes);

        assertTrue(results[0]); // testHash1 exists
        assertTrue(results[1]); // testHash2 exists
        assertFalse(results[2]); // testHash3 does not exist
    }

    // ============================================
    // Reset Tests
    // ============================================

    function test_Reset_Success() public {
        // Add elements
        vm.startPrank(manager);
        bloomFilter.add(testHash1);
        bloomFilter.add(testHash2);
        vm.stopPrank();

        assertEq(bloomFilter.getTotalElements(), 2);

        // Reset
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit IBloomFilter.BloomFilterReset(admin, block.timestamp);
        bloomFilter.reset();

        assertEq(bloomFilter.getTotalElements(), 0);
        assertFalse(bloomFilter.check(testHash1));
        assertFalse(bloomFilter.check(testHash2));
    }

    function test_Reset_RevertNotAdmin() public {
        vm.prank(manager);
        vm.expectRevert();
        bloomFilter.reset();
    }

    // ============================================
    // View Function Tests
    // ============================================

    function test_GetBitArraySize() public {
        assertEq(bloomFilter.getBitArraySize(), 8_388_608);
    }

    function test_GetIndex() public {
        uint256 index = bloomFilter.getIndex(testHash1);
        assertLt(index, 8_388_608);
    }

    function test_GetStatistics() public {
        vm.startPrank(manager);
        bloomFilter.add(testHash1);
        bloomFilter.add(testHash2);
        vm.stopPrank();

        (uint256 totalBits, uint256 elementsAdded, uint256 fillRate) = bloomFilter
            .getStatistics();

        assertEq(totalBits, 8_388_608);
        assertEq(elementsAdded, 2);
        assertGt(fillRate, 0);
    }

    function test_WasExplicitlyAdded() public {
        assertFalse(bloomFilter.wasExplicitlyAdded(testHash1));

        vm.prank(manager);
        bloomFilter.add(testHash1);

        assertTrue(bloomFilter.wasExplicitlyAdded(testHash1));
    }

    // ============================================
    // Admin Function Tests
    // ============================================

    function test_GrantManagerRole_Success() public {
        address newManager = address(0x99);

        vm.prank(admin);
        bloomFilter.grantManagerRole(newManager);

        assertTrue(bloomFilter.hasRole(Roles.BLOOM_FILTER_MANAGER, newManager));
    }

    function test_RevokeManagerRole_Success() public {
        vm.prank(admin);
        bloomFilter.revokeManagerRole(manager);

        assertFalse(bloomFilter.hasRole(Roles.BLOOM_FILTER_MANAGER, manager));
    }

    // ============================================
    // Collision Tests
    // ============================================

    function test_NoFalseNegatives() public {
        // Add 100 elements
        vm.startPrank(manager);
        for (uint256 i = 0; i < 100; i++) {
            bytes32 hash = keccak256(abi.encodePacked(i));
            bloomFilter.add(hash);
        }
        vm.stopPrank();

        // Check all added elements are found (no false negatives)
        for (uint256 i = 0; i < 100; i++) {
            bytes32 hash = keccak256(abi.encodePacked(i));
            assertTrue(bloomFilter.check(hash), "False negative detected");
        }
    }
}
