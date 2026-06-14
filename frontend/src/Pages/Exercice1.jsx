import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import Web3 from 'web3';
import AdditionABI from '../contracts/Addition.json';

function Exercice1() {
  const [result1, setResult1] = useState(null);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [result2, setResult2] = useState(null);

  // États Blockchain standardisés pour le composant BlockchainInfo
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);

  // Instanciation directe et stable calée sur ton Ganache local (Port 7545)
  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  // Initialisation des données de la Blockchain
  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) setAccount(accounts[0]);

      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));

      const deployedNetwork = AdditionABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
      } else {
        console.warn(`Contrat Addition non trouvé sur le réseau ${id}`);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
      });
    } catch (error) {
      console.error("Erreur d'initialisation Exo 1:", error);
    }
  }, []);

  useEffect(() => {
    initBlockchain();
  }, [initBlockchain]);

  // Gestion du calcul Statique (View)
  const handleAddition1 = async () => {
    if (!contractAddress) return;
    try {
      const instance = new web3.eth.Contract(AdditionABI.abi, contractAddress);
      const res = await instance.methods.addition1().call();
      setResult1(res.toString());

      // Rafraîchissement des infos du bloc
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution de addition1:", error);
    }
  };

  // Gestion du calcul Dynamique (Pure)
  const handleAddition2 = async (e) => {
    e.preventDefault();
    if (!contractAddress || !inputA || !inputB) return;
    try {
      const instance = new web3.eth.Contract(AdditionABI.abi, contractAddress);
      
      // Conversion explicite des chaînes de l'input en Entiers (Solidity uint256)
      const valA = parseInt(inputA, 10);
      const valB = parseInt(inputB, 10);

      const res = await instance.methods.addition2(valA, valB).call();
      setResult2(res.toString());

      // Rafraîchissement des infos du bloc
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
      });
    } catch (error) {
      console.error("Erreur lors de l'exécution de addition2:", error);
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Retour </Link>
      <h2>Exercice 1 : Somme de deux variables</h2>

      <div className="exo-grid">
        {/* Section de l'Addition Statique */}
        <div className="card">
          <h3>Addition Statique (View)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Calcule la somme prédéfinie stockée dans le contrat (10 + 20).
          </p>
          <button onClick={handleAddition1}>Calculer addition1()</button>
          {result1 && <p className="result">{result1}</p>}
        </div>

        {/* Section de l'Addition Dynamique */}
        <div className="card">
          <h3>Addition Dynamique (Pure)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Envoie deux nombres personnalisés à la fonction Pure.
          </p>
          <form onSubmit={handleAddition2}>
            <input 
              type="number" 
              placeholder="Nombre A" 
              value={inputA} 
              onChange={e => setInputA(e.target.value)} 
              required 
            />
            <input 
              type="number" 
              placeholder="Nombre B" 
              value={inputB} 
              onChange={e => setInputB(e.target.value)} 
              required 
            />
            <button type="submit">Calculer addition2()</button>
          </form>
          {result2 && <p className="result">{result2}</p>}
        </div>
      </div>

      {/* Panneau d'informations Blockchain unifié */}
      <BlockchainInfo 
        account={account} 
        contractAddress={contractAddress} 
        networkId={networkId} 
        lastBlock={lastBlock} 
      />
    </div>
  );
}

export default Exercice1;