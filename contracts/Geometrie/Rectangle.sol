// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// On importe le contrat parent 
import "./Forme.sol";


contract Rectangle is Forme {
    uint public lo; // longueur
    uint public la; // largeur

    // Le constructeur appelle explicitement le constructeur du fichier importe Forme
    constructor(uint _x, uint _y, uint _longueur, uint _largeur) Forme(_x, _y) {
        lo = _longueur;
        la = _largeur;
    }

    function surface() public view override returns (uint) {
        return lo * la;
    }


    function afficheInfos()  public pure override returns (string memory) {
        return "je suis Rectangle";
    }
    //fct pour afficher la longueur et la largeur du rectangle

    function afficheLoLa() public view returns (uint, uint) {
        return (lo, la);
    }
}