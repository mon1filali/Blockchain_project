// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract GestionChaines {
  
    string public message;

    function setMessage(string memory _message) public {
        message = _message;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    // Concatenation de  deux chaines passe en parametres
    function concatener(string memory a, string memory b) public pure returns (string memory) {
        return string.concat(a, b);
    }

    // Concatenation de la variable d'etat message avec une autre chaine
    function concatenerAvec(string memory a) public view returns (string memory) {
        return string.concat(message, a);
    }

    // Retourne la longueur d'une chaine
    function longueur(string memory s) public pure returns (uint) {
        return bytes(s).length;
    }

    // Comparaison de deux chaines de caracteres et retourne un boolean
    function comparer(string memory a, string memory b) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

}
