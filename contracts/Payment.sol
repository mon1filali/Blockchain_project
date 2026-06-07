// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Payment {
  

   address public recipient;

    constructor(address _recipient) {
        recipient = _recipient;
    }

    // Permet au contrat de recevoir des Ethers
    function receivePayment() public payable {
        // On refuse les transactions vides (0 Wei)
        require(msg.value > 0, "Le montant envoye doit etre superieur a 0 Wei");
    }

    // Permet au destinataire de recuperer les fonds accumules
    function withdraw() public {
        // Verification de l'identite de l'appelant
        require(msg.sender == recipient, "Erreur : Seul le destinataire peut retirer les fonds");

        // Transfert moderne de tout le solde du contrat pour eviter le Warning de transfer()
        (bool succes, ) = payable(recipient).call{value: address(this).balance}("");
        require(succes, "Erreur : Le transfert des fonds a echoue");
    }
}

