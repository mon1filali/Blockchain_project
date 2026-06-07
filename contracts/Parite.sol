// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Parite {
  //fct qui permet de verifier si un nombre est pair ou impair et retourne un boolean
    function estPair(uint nombre) public pure returns (bool) {
        return (nombre % 2 == 0);
  }
}
