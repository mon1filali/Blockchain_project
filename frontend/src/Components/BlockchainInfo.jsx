import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import "../Style/BlockchainInfo.css";

function BlockchainInfo({ networkInfo, contractAddress, account, lastBlock, lastTransaction, triggerRefresh }) {
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  useEffect(() => {
    const checkMetaMaskStatus = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          setIsMetaMaskConnected(accounts.length > 0);
        } catch (error) {
          setIsMetaMaskConnected(false);
        }
      }
    };
    checkMetaMaskStatus();
  }, [account]);

  const handleConnectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsMetaMaskConnected(true);
        if (triggerRefresh) await triggerRefresh();
      } catch (error) {
        console.log("Connexion refusée.");
      }
    } else {
      alert("Veuillez installer MetaMask.");
    }
  };

  return (
    <div className="blockchain-info-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}><span className="icon"></span> Informations de la Blockchain</h2>
        
        {window.ethereum ? (
          !isMetaMaskConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef3c7', border: '1px solid #f59e0b', padding: '6px 12px', borderRadius: '6px', color: '#b45309', fontSize: '0.85rem' }}>
              <span>⚠️ MetaMask déconnecté</span>
              <button onClick={handleConnectMetaMask} style={{ backgroundColor: '#e25c1d', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                Se connecter
              </button>
            </div>
          ) : (
            <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '6px 12px', borderRadius: '6px', color: '#065f46', fontSize: '0.85rem', fontWeight: 'bold' }}>
               MetaMask Synchronisé
            </div>
          )
        ) : (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', color: '#991b1b', fontSize: '0.85rem' }}>
            ❌ MetaMask non détecté
          </div>
        )}
      </div>
      
      <div className="info-grid">
        {/* Blockchain & Contrat */}
        <div className="info-card network-section">
          <h3>Blockchain & Contrat</h3>
          <div className="info-row"><span className="label">URL Réseau :</span><span className="value code">{networkInfo?.url || "HTTP://127.0.0.1:7545"}</span></div>
          <div className="info-row"><span className="label">ID Réseau :</span><span className="value badge">{networkInfo?.id || "5777"}</span></div>
          <div className="info-row"><span className="label">Adresse Contrat :</span><span className="value code truncate" title={contractAddress}>{contractAddress || "Non déployé"}</span></div>
          <div className="info-row"><span className="label">Compte Connecté :</span><span className="value code truncate" title={account}>{account || "Aucun compte"}</span></div>
        </div>

        {/* Dernier Bloc */}
        <div className="info-card block-section">
          <h3>Dernier Bloc</h3>
          <div className="info-row"><span className="label">Numéro :</span><span className="value badge block-number">{lastBlock?.number ? `#${lastBlock.number}` : "N/A"}</span></div>
          <div className="info-row"><span className="label">Hash :</span><span className="value code truncate" title={lastBlock?.hash}>{lastBlock?.hash || "N/A"}</span></div>
          <div className="info-row"><span className="label">Horodatage :</span><span className="value">{lastBlock?.timestamp || "N/A"}</span></div>
          <div className="info-row"><span className="label">Gas Utilisé :</span><span className="value">{lastBlock?.gasUsed || "0"}</span></div>
        </div>

        {/* Dernière Transaction ACTIVE */}
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
                <span className="value">{lastTransaction.gasUsed} gas</span>
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