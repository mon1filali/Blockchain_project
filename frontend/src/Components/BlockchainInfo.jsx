import React from 'react';
import "../Style/BlockchainInfo.css";


// ce composant est pour afficher les informations de la blockchain 

function BlockchainInfo({ networkInfo, contractAddress, account, lastBlock, lastTransaction }) {
  return (
    <div className="blockchain-info-container">
      <h2><span className="icon"></span> Informations de la Blockchain</h2>
      
      <div className="info-grid">
        {/* Section Réseau et Contrat */}
        <div className="info-card network-section">
          <h3>Blockchain & Contrat</h3>
          <div className="info-row">
            <span className="label">URL Réseau :</span>
            <span className="value code">{networkInfo?.url || "HTTP://127.0.0.1:7545"}</span>
          </div>
          <div className="info-row">
            <span className="label">ID Réseau :</span>
            <span className="value badge">{networkInfo?.id || "5777"}</span>
          </div>
          <div className="info-row">
            <span className="label">Adresse Contrat :</span>
            <span className="value code truncate" title={contractAddress}>{contractAddress || "Non déployé"}</span>
          </div>
          <div className="info-row">
            <span className="label">Compte Connecté :</span>
            <span className="value code truncate" title={account}>{account || "Aucun compte"}</span>
          </div>
        </div>

        {/* Section Dernier Bloc */}
        <div className="info-card block-section">
          <h3>Dernier Bloc</h3>
          <div className="info-row">
            <span className="label">Numéro :</span>
            <span className="value badge block-number">#{lastBlock?.number || "N/A"}</span>
          </div>
          <div className="info-row">
            <span className="label">Hash :</span>
            <span className="value code truncate" title={lastBlock?.hash}>{lastBlock?.hash || "N/A"}</span>
          </div>
          <div className="info-row">
            <span className="label">Horodatage :</span>
            <span className="value">{lastBlock?.timestamp || "N/A"}</span>
          </div>
          <div className="info-row">
            <span className="label">Gas Utilisé :</span>
            <span className="value">{lastBlock?.gasUsed || "0"}</span>
          </div>
        </div>

        {/* Section Dernière Transaction */}
        <div className="info-card tx-section">
          <h3>Dernière Transaction</h3>
          {lastTransaction ? (
            <>
              <div className="info-row">
                <span className="label">Hash :</span>
                <span className="value code truncate" title={lastTransaction.hash}>{lastTransaction.hash}</span>
              </div>
              <div className="info-row">
                <span className="label">Méthode :</span>
                <span className="value badge method-badge">{lastTransaction.methodName}</span>
              </div>
              <div className="info-row">
                <span className="label">Statut :</span>
                <span className={`value status-tag ${lastTransaction.status ? 'success' : 'failed'}`}>
                  {lastTransaction.status ? 'Succès' : 'Échec'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Gas Payé :</span>
                <span className="value">{lastTransaction.gasUsed} Gwei</span>
              </div>
            </>
          ) : (
            <p className="no-tx">Aucune transaction exécutée pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlockchainInfo;