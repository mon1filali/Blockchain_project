import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo'; // Ton afficheur global
import Web3 from 'web3';


// Importation directe depuis le chemin synchronisé par Truffle
import AdditionABI from '../../../build/contracts/Addition.json'; 

function Exercice1() {
  const [result1, setResult1] = useState(null);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [result2, setResult2] = useState(null);

  // États pour injecter dans le composant d'infos requis [cite: 40, 41]
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [lastBlock, setLastBlock] = useState(null);

  useEffect(() => {
    initBlockchain();
  }, []);

  const initBlockchain = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        // Demande d'authentification MetaMask [cite: 103, 108]
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = AdditionABI.networks[networkId];
        
        if (deployedNetwork) {
          setContractAddress(deployedNetwork.address);
        } else {
          alert("Le contrat n'est pas déployé sur le réseau MetaMask actif.");
        }

        // Récupération du dernier bloc [cite: 40, 64]
        const block = await web3.eth.getBlock('latest');
        setLastBlock({
          number: block.number,
          hash: block.hash,
          timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
          gasUsed: block.gasUsed.toString()
        });

      } catch (error) {
        console.error("Erreur d'initialisation Web3", error);
      }
    } else {
      alert("Veuillez connecter l'extension MetaMask.");
    }
  };

  // Appel de la méthode 1 (View) [cite: 37, 38]
  const handleAddition1 = async () => {
    if (!contractAddress) return;
    const web3 = new Web3(window.ethereum);
    const instance = new web3.eth.Contract(AdditionABI.abi, contractAddress);
    const res = await instance.methods.addition1().call();
    setResult1(res.toString());
  };

  // Appel de la méthode 2 (Pure) [cite: 37, 38]
  const handleAddition2 = async (e) => {
    e.preventDefault();
    if (!contractAddress || !inputA || !inputB) return;
    const web3 = new Web3(window.ethereum);
    const instance = new web3.eth.Contract(AdditionABI.abi, contractAddress);
    const res = await instance.methods.addition2(inputA, inputB).call();
    setResult2(res.toString());
  };

  return (
    <div className="exo-page">
      <div className="exo-header">
        <Link to="/" className="back-link">← Sommaire</Link> {/* Conforme aux consignes [cite: 39] */}
        <h1>Exercice 1 : Somme de deux variables</h1>
      </div>

      <div className="exo-container">
        <div className="card-exo">
          <h3>Addition Globale (View)</h3>
          <p className="description">Additionne la valeur par défaut de num1 (10) et num2 (20) stockée dans le contrat.</p>
          <button className="btn-primary" onClick={handleAddition1}>Calculer la Somme</button>
          {result1 !== null && <div className="result-box">Résultat : <strong>{result1}</strong></div>}
        </div>

        <div className="card-exo">
          <h3>Addition Personnalisée (Pure)</h3>
          <p className="description">Fournit deux arguments arbitraires à faire calculer directement au smart contract.</p>
          <form onSubmit={handleAddition2} className="exo-form">
            <div className="input-group">
              <input type="number" placeholder="Nombre A" value={inputA} onChange={(e) => setInputA(e.target.value)} required />
              <input type="number" placeholder="Nombre B" value={inputB} onChange={(e) => setInputB(e.target.value)} required />
            </div>
            <button type="submit" className="btn-success">Additionner</button>
          </form>
          {result2 !== null && <div className="result-box">Résultat : <strong>{result2}</strong></div>}
        </div>
      </div>

      {/* Partie basse affichant l'état temps réel de ta blockchain [cite: 40, 41] */}
      <BlockchainInfo account={account} contractAddress={contractAddress} lastBlock={lastBlock} />
    </div>
  );
}

export default Exercice1;