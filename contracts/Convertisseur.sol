// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Convertisseur {
 
    // Convertion de les Ethers en Wei
    function etherEnWei(uint montantEther) public pure returns (uint) {
        return montantEther * 1 ether;
    }

    // Convertion de les Wei en Ether 
    function weiEnEther(uint montantWei) public pure returns (uint) {
        return montantWei / 1 ether;
    }
}

