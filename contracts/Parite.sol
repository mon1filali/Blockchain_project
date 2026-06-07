// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Parite {
  //fct qui permet de verifier si un nombre est pair ou impair et retourne un boolean
    function estPair(uint nombre) public pure returns (bool) {
        return (nombre % 2 == 0);
  }
}
