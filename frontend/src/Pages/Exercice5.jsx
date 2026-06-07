import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import TransactionInfo from '../Components/TransactionInfo';
import Web3 from 'web3';
import PariteABI from '../contracts/Parite.json';

function Exercice5() {
  const [numberInput, setNumberInput] = useState('');
  const [result, setResult] = useState(null);

  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);

  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = PariteABI.networks[id];
      if (deployedNetwork) setContractAddress(deployedNetwork.address);

      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
      });
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { initBlockchain(); }, [initBlockchain]);

  const handleCheckParite = async (e) => {
    e.preventDefault();
    if (!contractAddress || numberInput === '') return;
    try {
      const instance = new web3.eth.Contract(PariteABI.abi, contractAddress);
      const isPair = await instance.methods.estPair(numberInput).call();
      setResult(isPair ? "🔢 Le nombre est PAIR" : "🔢 Le nombre est IMPAIR");
    } catch (error) { console.error(error); }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Sommaire</Link>
      <h2>Exercice 5 : Vérification de la Parité</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Parité d'un Nombre</h3>
          <form onSubmit={handleCheckParite}>
            <input type="number" min="0" placeholder="Entrez un nombre entier positif" value={numberInput} onChange={e => setNumberInput(e.target.value)} required />
            <button type="submit">Calculer la Parité</button>
          </form>
          {result && <p className="result-box-text">{result}</p>}
        </div>
      </div>

      <BlockchainInfo account={account} contractAddress={contractAddress} networkId={networkId} lastBlock={lastBlock} />
      <TransactionInfo txDetails={null} />
    </div>
  );
}

export default Exercice5;