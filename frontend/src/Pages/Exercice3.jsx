import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import Web3 from 'web3';
import GestionChainesABI from '../contracts/GestionChaines.json';

function Exercice3() {
  const [currentMessage, setCurrentMessage] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [strA, setStrA] = useState('');
  const [strB, setStrB] = useState('');
  const [concatResult, setConcatResult] = useState('');
  const [lenInput, setLenInput] = useState('');
  const [lenResult, setLenResult] = useState('');

  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  const refreshData = useCallback(async (address) => {
    if (!address) return;
    const instance = new web3.eth.Contract(GestionChainesABI.abi, address);
    const msg = await instance.methods.getMessage().call();
    setCurrentMessage(msg);
  }, []);

  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      const deployedNetwork = GestionChainesABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
        refreshData(deployedNetwork.address);
      }
      const block = await web3.eth.getBlock('latest');
      setLastBlock({ number: block.number.toString(), hash: block.hash, timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString() });
    } catch (e) { console.error(e); }
  }, [refreshData]);

  useEffect(() => { initBlockchain(); }, [initBlockchain]);

  // ATTENTION : Cette fonction modifie la blockchain, elle génère un reçu de transaction !
  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (!contractAddress || !inputMessage) return;
    try {
      const instance = new web3.eth.Contract(GestionChainesABI.abi, contractAddress);
      
      // On utilise .send() à la place de .call()
      const receipt = await instance.methods.setMessage(inputMessage).send({ from: account });
      
      // On stocke les détails pour le composant commun du prof
      setTxDetails({
        hash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString()
      });

      setInputMessage('');
      refreshData(contractAddress); // Met à jour l'affichage du message en direct
    } catch (error) {
      console.error(error);
    }
  };

  const handleConcat = async (e) => {
    e.preventDefault();
    const instance = new web3.eth.Contract(GestionChainesABI.abi, contractAddress);
    const res = await instance.methods.concatener(strA, strB).call();
    setConcatResult(res);
  };

  const handleLength = async (e) => {
    e.preventDefault();
    const instance = new web3.eth.Contract(GestionChainesABI.abi, contractAddress);
    const res = await instance.methods.longueur(lenInput).call();
    setLenResult(res.toString());
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Sommaire</Link>
      <h2>Exercice 3 : Gestion des Chaînes de Caractères</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Message Actuel</h3>
          <p className="current-state">"{currentMessage || "Aucun message enregistré"}"</p>
          <form onSubmit={handleUpdateMessage}>
            <input type="text" placeholder="Nouveau message" value={inputMessage} onChange={e => setInputMessage(e.target.value)} required />
            <button type="submit">Modifier le Message (Transaction)</button>
          </form>
        </div>

        <div className="card">
          <h3>Concaténation</h3>
          <form onSubmit={handleConcat}>
            <input type="text" placeholder="Chaîne A" value={strA} onChange={e => setStrA(e.target.value)} required />
            <input type="text" placeholder="Chaîne B" value={strB} onChange={e => setStrB(e.target.value)} required />
            <button type="submit">Concaténer</button>
          </form>
          {concatResult && <p className="result">Résultat : {concatResult}</p>}
        </div>

        <div className="card">
          <h3>Longueur d'une Chaîne</h3>
          <form onSubmit={handleLength}>
            <input type="text" placeholder="Texte" value={lenInput} onChange={e => setLenInput(e.target.value)} required />
            <button type="submit">Calculer la taille</button>
          </form>
          {lenResult && <p className="result">Longueur : {lenResult} octets</p>}
        </div>
      </div>

      <BlockchainInfo account={account} contractAddress={contractAddress} networkId={networkId} lastBlock={lastBlock} />
    </div>
  );
}

export default Exercice3;