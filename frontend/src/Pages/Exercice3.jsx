import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import Web3 from 'web3';
import ChaineABI from '../contracts/GestionChaines.json'; 

function Exercice3() {
  const [currentMessage, setCurrentMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [chainA, setChainA] = useState('');
  const [chainB, setChainB] = useState('');
  const [concatResult, setConcatResult] = useState('');
  const [textLength, setTextLength] = useState('');
  const [lengthResult, setLengthResult] = useState(null);

  // États Blockchain standardisés pour le composant BlockchainInfo
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  // CORRECTION 1 : Instanciation directe et stable calée sur ton Ganache local (Port 7545)
  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  // Initialisation des données de la Blockchain
  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) setAccount(accounts[0]);

      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));

      const deployedNetwork = ChaineABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
        
        const instance = new web3.eth.Contract(ChaineABI.abi, deployedNetwork.address);
        // Lecture du message initial stocké dans le Smart Contract
        const msg = await instance.methods.message().call(); 
        setCurrentMessage(msg);
      } else {
        console.warn(`Contrat GestionChaines non trouvé sur le réseau ${id}`);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) {
      console.error("Erreur initBlockchain Exo 3:", error);
    }
  }, []);

  useEffect(() => {
    initBlockchain();
  }, [initBlockchain]);

  // Écriture : Modification du message (Transaction active)
  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (!contractAddress || !newMessage || !account) return;

    try {
      const instance = new web3.eth.Contract(ChaineABI.abi, contractAddress);
      
      // Envoi de la transaction à Ganache
      const receipt = await instance.methods.setMessage(newMessage).send({ 
        from: account,
        gas: 300000 
      });
      
      setTxDetails({
        hash: receipt.transactionHash,
        methodName: "setMessage",
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString()
      });

      setCurrentMessage(newMessage);
      setNewMessage('');
      
      // Rafraîchissement immédiat du bloc après minage de la transaction
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });

    } catch (error) {
      console.error("Échec de la transaction setMessage:", error);
    }
  };

  // Lecture : Concaténation (Pure / View)
  const handleConcat = async () => {
    if (!contractAddress) return;
    try {
      const instance = new web3.eth.Contract(ChaineABI.abi, contractAddress);
      const res = await instance.methods.concatener(chainA, chainB).call();
      setConcatResult(res);

      // Rafraîchissement des informations du bloc
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) {
      console.error("Erreur Concaténation:", error);
    }
  };

  // Lecture : Longueur de la chaîne (Pure / View)
  const handleLength = async () => {
    if (!contractAddress) return;
    try {
      const instance = new web3.eth.Contract(ChaineABI.abi, contractAddress);
      const res = await instance.methods.tailleChaine(textLength).call();
      setLengthResult(res.toString() + " caractères");

      // Rafraîchissement des informations du bloc
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) {
      console.error("Erreur Longueur:", error);
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Retour</Link>
      <h2>Exercice 3 : Gestion des Chaînes de Caractères</h2>

      <div className="exo-grid">
        {/* Bloc Écriture (Transaction) */}
        <div className="card">
          <h3>Message Actuel (Stocké sur la dApp)</h3>
          <p className="current-state" style={{ margin: '15px 0', fontSize: '1rem' }}>
            {currentMessage ? `"${currentMessage}"` : "Aucun message enregistré"}
          </p>
          <form onSubmit={handleUpdateMessage}>
            <input 
              type="text" 
              placeholder="Nouveau message" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
              required 
            />
            <button type="submit">Modifier le Message (Transaction)</button>
          </form>
        </div>

        {/* Bloc Lecture : Concaténation */}
        <div className="card">
          <h3>Concaténation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fusionner deux chaînes distantes</p>
          <form onSubmit={(e) => { e.preventDefault(); handleConcat(); }} style={{ marginTop: '0' }}>
            <input 
              type="text" 
              placeholder="Chaîne A" 
              value={chainA} 
              onChange={e => setChainA(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              placeholder="Chaîne B" 
              value={chainB} 
              onChange={e => setChainB(e.target.value)} 
              required 
            />
            <button type="submit">Concaténer</button>
          </form>
          {concatResult && <p className="result">{concatResult}</p>}
        </div>

        {/* Bloc Lecture : Longueur */}
        <div className="card">
          <h3>Longueur de la Chaîne</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Calculer le nombre de caractères</p>
          <form onSubmit={(e) => { e.preventDefault(); handleLength(); }} style={{ marginTop: '0' }}>
            <input 
              type="text" 
              placeholder="Texte à analyser" 
              value={textLength} 
              onChange={e => setTextLength(e.target.value)} 
              required 
            />
            <button type="submit">Calculer la taille</button>
          </form>
          {lengthResult !== null && <p className="result">{lengthResult}</p>}
        </div>
      </div>

      {/* Panneau d'informations Blockchain unifié */}
      <BlockchainInfo 
        account={account} 
        contractAddress={contractAddress} 
        networkId={networkId} 
        lastBlock={lastBlock} 
        lastTransaction={txDetails}
      />
    </div>
  );
}

export default Exercice3;