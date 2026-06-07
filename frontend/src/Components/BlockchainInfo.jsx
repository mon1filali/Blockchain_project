import React from 'react';

function BlockchainInfo({ account, contractAddress, networkId, lastBlock }) {
  return (
    <div className="info-card blockchain-info">
      <h3>🌐 Informations Blockchain</h3>
      <p><strong>Compte connecté :</strong> {account || "Non connecté"}</p>
      <p><strong>Adresse du Contrat :</strong> {contractAddress}</p>
      <p><strong>ID Réseau :</strong> {networkId}</p>
      {lastBlock && (
        <div className="block-details">
          <p><strong>Dernier Bloc :</strong> #{lastBlock.number}</p>
          <p><strong>Horodatage :</strong> {lastBlock.timestamp}</p>
        </div>
      )}
    </div>
  );
}

export default BlockchainInfo;