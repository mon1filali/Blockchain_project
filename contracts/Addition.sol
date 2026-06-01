// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Addition {
    // Variables d'etat
    uint public num1 = 10;
    uint public num2 = 20;

    // la premiere fonction  de type vierw qui permet de calculer la somme des deux nombres stocker dans des variables d'etat 
    function addition1() public view returns (uint) {
        return num1 + num2;
    }

    // la deuxiemme fontion de type pure qui permet de calculer la somme de deux nombres passer en parametre sans utiliser les variables d'etat
    function addition2(uint a, uint b) public pure returns (uint) {
        return a + b;
    }
}
