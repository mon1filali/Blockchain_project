import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import Web3 from 'web3';
import VerifPositifABI from '../contracts/Positif.json';

function Exercice4() {
  const [numberInput, setNumberInput] = useState('');
  const [result, setResult] = useState(null);

  // États Blockchain standardisés pour le composant BlockchainInfo
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);

  // CORRECTION : Instanciation directe et stable calée sur ton Ganache local (Port 7545)
  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  // Initialisation des données de la Blockchain
  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts.length > 0 ? accounts[0] : '');

      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = VerifPositifABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
      } else {
        console.warn(`Contrat Positif non trouvé sur le réseau ${id}`);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (e) { 
      console.error("Erreur d'initialisation Exo 4 :", e); 
    }
  }, []);

  useEffect(() => { 
    initBlockchain(); 
  }, [initBlockchain]);

  // Appel de la méthode pure (Sans frais de gaz)
  const handleCheckPositif = async (e) => {
    e.preventDefault();
    if (!contractAddress || numberInput === '') return;

    try {
      const instance = new web3.eth.Contract(VerifPositifABI.abi, contractAddress);
      
      // Conversion explicite en Entier (int256 ou uint256 selon ton contrat)
      const parsedNumber = parseInt(numberInput, 10);

      // Appel de la méthode pure via .call()
      const res = await instance.methods.estPositif(parsedNumber).call();
      
      setResult(res ? " Le nombre est Positif (ou nul)" : " Le nombre est Négatif");

      // Rafraîchissement des informations du bloc pour maintenir l'interface à jour
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) { 
      console.error("Erreur lors de l'appel de estPositif :", error); 
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Retour </Link>
      <h2>Exercice 4 : Vérification de Signe</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Analyse du nombre</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Exécute une fonction <code>pure</code> pour déterminer le signe sans frais de gaz.
          </p>
          <form onSubmit={handleCheckPositif}>
            <input 
              type="number" 
              placeholder="Entrez un entier (ex: -5, 12)" 
              value={numberInput} 
              onChange={e => setNumberInput(e.target.value)} 
              required 
            />
            <button type="submit">Vérifier le signe</button>
          </form>
          
          {/* Bandeau vert épuré du thème sombre */}
          {result && <p className="result">{result}</p>}
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

export default Exercice4;