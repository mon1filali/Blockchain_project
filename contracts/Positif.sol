// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Positif {
 
    // fct qui permet de verifier si un nombre est positif ou non et retourne un boolean
    function estPositif(int nombre) public pure returns (bool) {
        return nombre >= 0;
    }
}

