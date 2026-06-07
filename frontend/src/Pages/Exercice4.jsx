import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import TransactionInfo from '../Components/TransactionInfo';
import Web3 from 'web3';
import VerifPositifABI from '../contracts/Positif.json';

function Exercice4() {
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
      
      const deployedNetwork = VerifPositifABI.networks[id];
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

  const handleCheckPositif = async (e) => {
    e.preventDefault();
    if (!contractAddress || numberInput === '') return;
    try {
      const instance = new web3.eth.Contract(VerifPositifABI.abi, contractAddress);
      // Appel de la méthode pure (prend en compte les entiers négatifs via 'int' côté Solidity)
      const res = await instance.methods.estPositif(numberInput).call();
      setResult(res ? "✅ Le nombre est Positif (ou nul)" : "❌ Le nombre est Négatif");
    } catch (error) { console.error(error); }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Sommaire</Link>
      <h2>Exercice 4 : Vérification de Signe</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Est-ce Positif ?</h3>
          <form onSubmit={handleCheckPositif}>
            <input type="number" placeholder="Entrez un entier (ex: -5, 12)" value={numberInput} onChange={e => setNumberInput(e.target.value)} required />
            <button type="submit">Vérifier le signe</button>
          </form>
          {result && <p className="result-box-text">{result}</p>}
        </div>
      </div>

      <BlockchainInfo account={account} contractAddress={contractAddress} networkId={networkId} lastBlock={lastBlock} />
      <TransactionInfo txDetails={null} />
    </div>
  );
}

export default Exercice4;