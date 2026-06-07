// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Positif {
 
    // fct qui permet de verifier si un nombre est positif ou non et retourne un boolean
    function estPositif(int nombre) public pure returns (bool) {
        return nombre >= 0;
    }
}

