// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;



abstract contract Forme {
    uint public x;
    uint public y;

    constructor(uint _x, uint _y) {
        x = _x;
        y = _y;
    }
    //fct pour deplacer la forme en changeant les coordonnees x et y

    function deplacerForme(uint dx, uint dy) public {
        x = dx;
        y = dy;
    }

    function afficheXY() public view returns (uint, uint) {
        return (x, y);
    }

    function afficheInfos() public view virtual returns (string memory) {
        return "je suis une forme";
    }

    //fct pour calculer la surface de la forme, elle est declaree comme virtuelle pour etre redefinie dans les contrats qui heritent de ce contrat(commw class abstraite en java)

    function surface() public view virtual returns (uint);
}