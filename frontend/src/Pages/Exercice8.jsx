import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import Web3 from 'web3';
import PaymentABI from '../contracts/Payment.json';

function Exercice8() {
  const [recipient, setRecipient] = useState('');
  const [contractBalance, setContractBalance] = useState('0');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [actionError, setActionError] = useState('');

  // États Blockchain standardisés pour BlockchainInfo
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null); // Gère les reçus de transactions (Dépôt / Retrait)
  const [web3, setWeb3] = useState(null);

  // Met à jour la liste locale et le solde calculé par le contrat
  const refreshPaymentData = useCallback(async (address, web3Instance) => {
    if (!address || !web3Instance) return;
    try {
      const instance = new web3Instance.eth.Contract(PaymentABI.abi, address);
      const currentRecipient = await instance.methods.recipient().call();
      setRecipient(currentRecipient);

      // Lecture du solde du contrat en Wei, converti en Ether pour l'affichage
      const balance = await web3Instance.eth.getBalance(address);
      setContractBalance(web3Instance.utils.fromWei(balance, 'ether'));
    } catch (e) { 
      console.error("Erreur de rafraîchissement des soldes :", e); 
    }
  }, []);

  const initBlockchain = useCallback(async () => {
    try {
      // Connexion dynamique avec le provider MetaMask injecté
      const provider = window.ethereum ? window.ethereum : "http://127.0.0.1:7545";
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts.length > 0 ? accounts[0] : '');

      const id = await web3Instance.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = PaymentABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
        refreshPaymentData(deployedNetwork.address, web3Instance);
      }

      const block = await web3Instance.eth.getBlock('latest');
      setLastBlock({ 
        number: block.number.toString(), 
        hash: block.hash, 
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (e) { 
      console.error("Erreur d'initialisation de la dApp :", e); 
    }
  }, [refreshPaymentData]);

  useEffect(() => { 
    initBlockchain(); 

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts.length > 0 ? accounts[0] : '');
        initBlockchain();
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, [initBlockchain]);

  // Intercepte le clic et réveille MetaMask si déconnecté
  const checkAndConnectWallet = async () => {
    if (window.ethereum && !account) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await initBlockchain();
        return true;
      } catch (error) {
        console.log("Connexion au portefeuille refusée.");
        return false;
      }
    }
    return true;
  };

  // 🔥 ÉCRITURE 1 : Déposer de l'argent sur le contrat (payable)
  const handleSendFunds = async (e) => {
    e.preventDefault();
    const connected = await checkAndConnectWallet();
    if (!connected || !account || !contractAddress || paymentAmount === '' || !web3) return;
    
    setActionError('');
    try {
      const instance = new web3.eth.Contract(PaymentABI.abi, contractAddress);
      
      // Envoi de fonds via .send() et transfert de valeur en Ether converti en Wei
      const receipt = await instance.methods.receivePayment().send({
        from: account,
        value: web3.utils.toWei(paymentAmount, 'ether')
      });

      // Hydratation immédiate du panneau de contrôle de droite
      setTxDetails({
        hash: receipt.transactionHash,
        methodName: "receivePayment",
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString()
      });

      setPaymentAmount('');
      refreshPaymentData(contractAddress, web3);

      // Mettre à jour les informations du dernier bloc miné
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) {
      setActionError("❌ Échec du dépôt. Le montant doit être supérieur à 0 Wei.");
    }
  };

  // 🔥 ÉCRITURE 2 : Retirer l'argent (Soumis au require de msg.sender == recipient)
  const handleWithdraw = async () => {
    const connected = await checkAndConnectWallet();
    if (!connected || !account || !contractAddress || !web3) return;
    
    setActionError('');
    try {
      const instance = new web3.eth.Contract(PaymentABI.abi, contractAddress);
      
      // On exécute le retrait (.send) depuis le compte actif de MetaMask
      const receipt = await instance.methods.withdraw().send({ from: account });
      
      // Hydratation immédiate du panneau de contrôle de droite
      setTxDetails({
        hash: receipt.transactionHash,
        methodName: "withdraw",
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString()
      });

      refreshPaymentData(contractAddress, web3);

      // Mettre à jour les informations du dernier bloc miné
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) {
      setActionError("❌ Erreur de sécurité : Seul le destinataire (recipient) enregistré a le droit de retirer ces fonds !");
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Retour</Link>
      <h2>Exercice 8 : Système de Paiement Sécurisé</h2>

      <div className="exo-grid">
        {/* Boîte de gestion du Coffre-fort */}
        <div className="card">
          <h3>💰 Coffre-fort Électronique</h3>
          <div className="balance-box" style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0', margin: '15px 0' }}>
            <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>Solde bloqué sur le contrat :</p>
            <h2 style={{ margin: 0, color: '#10b981' }}>{contractBalance} ETH</h2>
          </div>
          <p className="recipient-info"><strong>Destinataire légal :</strong> <br /><code style={{ background: '#f1f5f9', padding: '4px 6px', borderRadius: '4px', display: 'block', wordBreak: 'break-all', marginTop: '5px' }}>{recipient}</code></p>
          
          <button className="btn-withdraw" onClick={handleWithdraw} style={{ backgroundColor: '#dc2626', color: '#fff', width: '100%', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            Déclencher le Retrait (withdraw)
          </button>
        </div>

        {/* Formulaire de Dépôt */}
        <div className="card">
          <h3>📥 Alimenter le Contrat</h3>
          <form onSubmit={handleSendFunds}>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              placeholder="Montant en ETH (ex: 0.5, 2)" 
              value={paymentAmount} 
              onChange={e => setPaymentAmount(e.target.value)} 
              required 
            />
            <button type="submit" className="btn-deposit" style={{ backgroundColor: '#2563eb', color: '#fff', width: '100%', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Envoyer des fonds (receivePayment)
            </button>
          </form>
          {actionError && <p className="result-error" style={{ marginTop: '15px', color: '#991b1b', fontWeight: 'bold' }}>{actionError}</p>}
        </div>
      </div>

      {/* Intégration globale et dynamique du module de diagnostic */}
      <BlockchainInfo 
        account={account} 
        contractAddress={contractAddress} 
        networkInfo={{ url: window.ethereum ? "MetaMask (Ganache RPC)" : "HTTP://127.0.0.1:7545", id: networkId }} 
        lastBlock={lastBlock} 
        lastTransaction={txDetails}
        triggerRefresh={initBlockchain}
      />
    </div>
  );
}

export default Exercice8;