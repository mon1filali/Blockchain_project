import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import Web3 from 'web3';
import PariteABI from '../contracts/Parite.json';

function Exercice5() {
  const [numberInput, setNumberInput] = useState('');
  const [result, setResult] = useState(null);

  // États Blockchain unifiés avec ton composant global
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);

  // CORRECTION : Instanciation directe et stable calée sur ton Ganache local (Port 7545)
  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  // Fonction d'initialisation de la Blockchain
  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts.length > 0 ? accounts[0] : '');

      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = PariteABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
      } else {
        console.warn(`Contrat Parite non trouvé sur le réseau ${id}`);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (e) { 
      console.error("Erreur d'initialisation Exo 5 :", e); 
    }
  }, []);

  useEffect(() => { 
    initBlockchain(); 
  }, [initBlockchain]);

  // Appel de la méthode pure (Sans frais d'écriture réseau)
  const handleCheckParite = async (e) => {
    e.preventDefault();
    if (!contractAddress || numberInput === '') return;

    try {
      const instance = new web3.eth.Contract(PariteABI.abi, contractAddress);
      
      // Conversion explicite en Entier pour Solidity
      const parsedNumber = parseInt(numberInput, 10);

      // Appel asynchrone de la méthode pure via .call()
      const isPair = await instance.methods.estPair(parsedNumber).call();
      setResult(isPair ? " Le nombre est PAIR" : " Le nombre est IMPAIR");
      
      // Rafraîchissement des informations du bloc pour maintenir l'interface à jour
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) { 
      console.error("Erreur d'exécution de la méthode estPair :", error); 
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Retour</Link>
      <h2>Exercice 5 : Vérification de la Parité</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Parité d'un Nombre</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Exécute une fonction <code>pure</code> pour déterminer la parité sans frais de gaz.
          </p>
          <form onSubmit={handleCheckParite}>
            <input 
              type="number" 
              min="0" 
              placeholder="Entrez un nombre entier positif" 
              value={numberInput} 
              onChange={e => setNumberInput(e.target.value)} 
              required 
            />
            <button type="submit">Calculer la Parité</button>
          </form>
          
          {/* CORRECTION : Utilisation de la classe .result globale pour le bandeau vert épuré */}
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

export default Exercice5;