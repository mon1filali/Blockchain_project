import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import Web3 from 'web3';
import GestionTableauABI from '../contracts/SommeListeNombre.json';

function Exercice6() {
  const [arrayElements, setArrayElements] = useState([]);
  const [inputNumber, setInputNumber] = useState('');
  const [totalSomme, setTotalSomme] = useState(0);
  
  const [indexInput, setIndexInput] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searchError, setSearchError] = useState('');

  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  // Met à jour la liste locale et la somme calculée par le contrat
  const refreshArrayData = useCallback(async (address) => {
    if (!address) return;
    try {
      const instance = new web3.eth.Contract(GestionTableauABI.abi, address);
      const currentTab = await instance.methods.afficheTableau().call();
      setArrayElements(currentTab.map(n => n.toString()));
      
      const currentSomme = await instance.methods.calculerSomme().call();
      setTotalSomme(currentSomme.toString());
    } catch (e) { console.error(e); }
  }, []);

  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = GestionTableauABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
        refreshArrayData(deployedNetwork.address);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({ number: block.number.toString(), hash: block.hash, timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString() });
    } catch (e) { console.error(e); }
  }, [refreshArrayData]);

  useEffect(() => { initBlockchain(); }, [initBlockchain]);

  // ÉCRITURE : Ajoute une valeur (génère une transaction !)
  const handleAddNumber = async (e) => {
    e.preventDefault();
    if (!contractAddress || inputNumber === '') return;
    try {
      const instance = new web3.eth.Contract(GestionTableauABI.abi, contractAddress);
      const receipt = await instance.methods.ajouterNombre(inputNumber).send({ from: account });
      
      setTxDetails({
        hash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString()
      });

      setInputNumber('');
      refreshArrayData(contractAddress);
    } catch (error) { console.error(error); }
  };

  // LECTURE SÉCURISÉE par index (Gère le require)
  const handleGetElement = async (e) => {
    e.preventDefault();
    if (!contractAddress || indexInput === '') return;
    setSearchResult('');
    setSearchError('');
    
    try {
      const instance = new web3.eth.Contract(GestionTableauABI.abi, contractAddress);
      const element = await instance.methods.getElement(indexInput).call();
      setSearchResult(`Élément à l'index ${indexInput} : ${element}`);
    } catch (error) {
      // Si l'index n'existe pas, Solidity lève une exception interceptée ici
      setSearchError(" Erreur : L'indice demandé n'existe pas dans le tableau !");
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Sommaire</Link>
      <h2>Exercice 6 : Gestion de Tableau Dynamique</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Ajouter un Élément</h3>
          <form onSubmit={handleAddNumber}>
            <input type="number" placeholder="Entrez un nombre" value={inputNumber} onChange={e => setInputNumber(e.target.value)} required />
            <button type="submit">Ajouter au Tableau</button>
          </form>
          <div className="array-display-box">
            <p><strong>Contenu actuel :</strong> [ {arrayElements.join(', ')} ]</p>
            <p><strong>Somme totale (Blockchain) :</strong> {totalSomme}</p>
          </div>
        </div>

        <div className="card">
          <h3>Rechercher par Index (Test du require)</h3>
          <form onSubmit={handleGetElement}>
            <input type="number" placeholder="Entrez un index (ex: 0, 1, 2)" value={indexInput} onChange={e => setIndexInput(e.target.value)} required />
            <button type="submit">Chercher l'élément</button>
          </form>
          {searchResult && <p className="result-success">{searchResult}</p>}
          {searchError && <p className="result-error">{searchError}</p>}
        </div>
      </div>

      <BlockchainInfo account={account} contractAddress={contractAddress} networkId={networkId} lastBlock={lastBlock} />
      
    </div>
  );
}

export default Exercice6;