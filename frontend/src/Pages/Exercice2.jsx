import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import TransactionInfo from '../Components/TransactionInfo';
import Web3 from 'web3';
import ConvertisseurABI from '../contracts/Convertisseur.json';

function Exercice2() {
  const [ethInput, setEthInput] = useState('');
  const [weiResult, setWeiResult] = useState('');
  const [weiInput, setWeiInput] = useState('');
  const [ethResult, setEthResult] = useState('');

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
      const deployedNetwork = ConvertisseurABI.networks[id];
      if (deployedNetwork) setContractAddress(deployedNetwork.address);
      const block = await web3.eth.getBlock('latest');
      setLastBlock({ number: block.number.toString(), hash: block.hash, timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString() });
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { initBlockchain(); }, [initBlockchain]);

  const handleToWei = async (e) => {
    e.preventDefault();
    if (!contractAddress) return;
    const instance = new web3.eth.Contract(ConvertisseurABI.abi, contractAddress);
    const res = await instance.methods.etherEnWei(ethInput).call();
    setWeiResult(res.toString() + " Wei");
  };

  const handleToEth = async (e) => {
    e.preventDefault();
    if (!contractAddress) return;
    const instance = new web3.eth.Contract(ConvertisseurABI.abi, contractAddress);
    const res = await instance.methods.weiEnEther(weiInput).call();
    setEthResult(res.toString() + " Ether");
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Sommaire</Link>
      <h2>Exercice 2 : Convertisseur Cryptomonnaies</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Ether vers Wei</h3>
          <form onSubmit={handleToWei}>
            <input type="number" placeholder="Montant en Ether" value={ethInput} onChange={e => setEthInput(e.target.value)} required />
            <button type="submit">Convertir en Wei</button>
          </form>
          {weiResult && <p className="result">{weiResult}</p>}
        </div>

        <div className="card">
          <h3>Wei vers Ether (Bonus)</h3>
          <form onSubmit={handleToEth}>
            <input type="number" placeholder="Montant en Wei" value={weiInput} onChange={e => setWeiInput(e.target.value)} required />
            <button type="submit">Convertir en Ether</button>
          </form>
          {ethResult && <p className="result">{ethResult}</p>}
        </div>
      </div>

      <BlockchainInfo account={account} contractAddress={contractAddress} networkId={networkId} lastBlock={lastBlock} />
      <TransactionInfo txDetails={null} />
    </div>
  );
}

export default Exercice2;