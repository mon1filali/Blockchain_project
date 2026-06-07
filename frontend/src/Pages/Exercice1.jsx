import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import TransactionInfo from '../Components/TransactionInfo';
import Web3 from 'web3';
import AdditionABI from '../contracts/Addition.json';

function Exercice1() {
  const [result1, setResult1] = useState(null);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [result2, setResult2] = useState(null);

  // États pour les composants communs
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));

      const deployedNetwork = AdditionABI.networks[id];
      if (deployedNetwork) setContractAddress(deployedNetwork.address);

      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
      });
    } catch (error) {
      console.error("Erreur d'initialisation :", error);
    }
  }, []);

  useEffect(() => {
    initBlockchain();
  }, [initBlockchain]);

  // Les appels .call() ne génèrent pas de hash de transaction (car pas d'écriture sur le réseau)
  const handleAddition1 = async () => {
    if (!contractAddress) return;
    const instance = new web3.eth.Contract(AdditionABI.abi, contractAddress);
    const res = await instance.methods.addition1().call();
    setResult1(res.toString());
    setTxDetails(null); // Pas de transaction pour une fonction view
  };

  const handleAddition2 = async (e) => {
    e.preventDefault();
    if (!contractAddress || !inputA || !inputB) return;
    const instance = new web3.eth.Contract(AdditionABI.abi, contractAddress);
    const res = await instance.methods.addition2(inputA, inputB).call();
    setResult2(res.toString());
    setTxDetails(null); // Pas de transaction pour une fonction pure
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Sommaire</Link>
      <h2>Exercice 1 : Somme de deux variables</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Addition Globale (View)</h3>
          <p>Calcule la somme des variables d'état (10 + 20)</p>
          <button onClick={handleAddition1}>Calculer addition1()</button>
          {result1 && <p className="result">Résultat : {result1}</p>}
        </div>

        <div className="card">
          <h3>Addition Personnalisée (Pure)</h3>
          <form onSubmit={handleAddition2}>
            <input type="number" placeholder="Nombre A" value={inputA} onChange={e => setInputA(e.target.value)} required />
            <input type="number" placeholder="Nombre B" value={inputB} onChange={e => setInputB(e.target.value)} required />
            <button type="submit">Calculer addition2()</button>
          </form>
          {result2 && <p className="result">Résultat : {result2}</p>}
        </div>
      </div>

      <BlockchainInfo account={account} contractAddress={contractAddress} networkId={networkId} lastBlock={lastBlock} />
      <TransactionInfo txDetails={txDetails} />
    </div>
  );
}

export default Exercice1;