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

  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  const refreshPaymentData = useCallback(async (address) => {
    if (!address) return;
    try {
      const instance = new web3.eth.Contract(PaymentABI.abi, address);
      const currentRecipient = await instance.methods.recipient().call();
      setRecipient(currentRecipient);

      // Lecture du solde du contrat en Wei, converti en Ether pour l'affichage
      const balance = await web3.eth.getBalance(address);
      setContractBalance(web3.utils.fromWei(balance, 'ether'));
    } catch (e) { console.error(e); }
  }, []);

  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]); // Par défaut, l'utilisateur est le compte 1
      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = PaymentABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
        refreshPaymentData(deployedNetwork.address);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({ number: block.number.toString(), hash: block.hash, timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString() });
    } catch (e) { console.error(e); }
  }, [refreshPaymentData]);

  useEffect(() => { initBlockchain(); }, [initBlockchain]);

  // FONCTION 1 : Déposer de l'argent sur le contrat (payable)
  const handleSendFunds = async (e) => {
    e.preventDefault();
    if (!contractAddress || paymentAmount === '') return;
    setActionError('');
    try {
      const instance = new web3.eth.Contract(PaymentABI.abi, contractAddress);
      const receipt = await instance.methods.receivePayment().send({
        from: account,
        value: web3.utils.toWei(paymentAmount, 'ether') // Conversion automatique en Wei
      });

      setTxDetails({
        hash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString()
      });

      setPaymentAmount('');
      refreshPaymentData(contractAddress);
    } catch (error) {
      setActionError(" Échec du dépôt. Le montant doit être supérieur à 0 Wei.");
    }
  };

  // FONCTION 2 : Retirer l'argent (Soumis au require de msg.sender == recipient)
  const handleWithdraw = async () => {
    if (!contractAddress) return;
    setActionError('');
    try {
      const instance = new web3.eth.Contract(PaymentABI.abi, contractAddress);
      
      // On exécute l'appel depuis le compte actif pour tester la sécurité
      const receipt = await instance.methods.withdraw().send({ from: account });
      
      setTxDetails({
        hash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString()
      });

      refreshPaymentData(contractAddress);
    } catch (error) {
      setActionError("Erreur de sécurité : Seul le destinataire (recipient) enregistré a le droit de retirer ces fonds !");
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Sommaire</Link>
      <h2>Exercice 8 : Système de Paiement Sécurisé</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>💰 Coffre-fort Électronique</h3>
          <div className="balance-box">
            <p>Solde bloqué sur le contrat :</p>
            <h2>{contractBalance} ETH</h2>
          </div>
          <p className="recipient-info"><strong>Destinataire légal :</strong> <br /><code>{recipient}</code></p>
          
          <button className="btn-withdraw" onClick={handleWithdraw}>Déclencher le Retrait (withdraw)</button>
        </div>

        <div className="card">
          <h3>📥 Alimenter le Contrat</h3>
          <form onSubmit={handleSendFunds}>
            <input type="number" step="0.01" min="0" placeholder="Montant en ETH (ex: 0.5, 2)" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required />
            <button type="submit" className="btn-deposit">Envoyer des fonds (receivePayment)</button>
          </form>
          {actionError && <p className="result-error">{actionError}</p>}
        </div>
      </div>

      <BlockchainInfo account={account} contractAddress={contractAddress} networkId={networkId} lastBlock={lastBlock} />
    </div>
  );
}

export default Exercice8;