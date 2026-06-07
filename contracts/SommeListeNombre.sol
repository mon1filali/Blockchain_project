// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SommeListeNombre {

    uint[] public nombres;

    // Initialisation du tableau dans le constructeur
    constructor() {
        nombres = new uint[](0);
    }
    //ajouer un nombre dans le tableau

    function ajouterNombre(uint nombre) public {
        nombres.push(nombre);
    }

    // recuperation de element du tableau a partir de son indice
    function getElement(uint index) public view returns (uint) {
        require(index < nombres.length, "Erreur : L'indice n'existe pas dans le tableau ");
        return nombres[index];
    }
    //affichage

    function afficheTableau() public view returns (uint[] memory) {
        return nombres;
    }
    //calcul de la somme de la liste de nombres

    function calculerSomme() public view returns (uint) {
        uint somme = 0;
        for (uint i = 0; i < nombres.length; i++) {
            somme += nombres[i];
        }
        return somme;
    }
}

