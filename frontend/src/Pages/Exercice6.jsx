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

  // États Blockchain standardisés pour BlockchainInfo
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  // CORRECTION : Instanciation directe et stable calée sur ton Ganache local (Port 7545)
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
    } catch (e) { 
      console.error("Erreur de rafraîchissement des données :", e); 
    }
  }, []);

  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts.length > 0 ? accounts[0] : '');

      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = GestionTableauABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
        await refreshArrayData(deployedNetwork.address);
      } else {
        console.warn(`Contrat SommeListeNombre non trouvé sur le réseau ${id}`);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({ 
        number: block.number.toString(), 
        hash: block.hash, 
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (e) { 
      console.error("Erreur d'initialisation :", e); 
    }
  }, [refreshArrayData]);

  useEffect(() => { 
    initBlockchain(); 
  }, [initBlockchain]);

  // 🔥 ÉCRITURE : Ajoute une valeur (Génère une transaction visible à droite !)
  const handleAddNumber = async (e) => {
    e.preventDefault();
    if (!contractAddress || inputNumber === '' || !account) return;

    try {
      const instance = new web3.eth.Contract(GestionTableauABI.abi, contractAddress);
      
      // Conversion explicite en entier
      const parsedValue = parseInt(inputNumber, 10);

      // .send() pour enregistrer sur Ganache avec le premier compte émetteur
      const receipt = await instance.methods.ajouterNombre(parsedValue).send({ 
        from: account,
        gas: 300000
      });
      
      // Hydratation de txDetails pour le composant global BlockchainInfo
      setTxDetails({
        hash: receipt.transactionHash,
        methodName: "ajouterNombre",
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString()
      });

      setInputNumber('');
      await refreshArrayData(contractAddress);

      // Rafraîchir les données du dernier bloc miné après l'écriture
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) { 
      console.error("Échec de la transaction ajouterNombre :", error); 
    }
  };

  // 🔍 LECTURE SEULE : Recherche par index (Pas de transaction)
  const handleGetElement = async (e) => {
    e.preventDefault();
    if (!contractAddress || indexInput === '') return;

    setSearchResult('');
    setSearchError('');
    
    try {
      const instance = new web3.eth.Contract(GestionTableauABI.abi, contractAddress);
      
      const parsedIndex = parseInt(indexInput, 10);
      const element = await instance.methods.getElement(parsedIndex).call();
      
      setSearchResult(`Élément à l'index ${parsedIndex} : ${element}`);
      
      // Récupération du dernier bloc
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) {
      setSearchError("❌ Erreur : L'indice demandé n'existe pas dans le tableau !");
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Retour</Link>
      <h2>Exercice 6 : Gestion de Tableau Dynamique</h2>

      <div className="exo-grid">
        {/* Formulaire d'Écriture */}
        <div className="card">
          <h3>Ajouter un Élément</h3>
          <form onSubmit={handleAddNumber}>
            <input 
              type="number" 
              placeholder="Entrez un nombre" 
              value={inputNumber} 
              onChange={e => setInputNumber(e.target.value)} 
              required 
            />
            <button type="submit" style={{ backgroundColor: '#10b981' }}>Ajouter au Tableau</button>
          </form>
          
          {/* Section d'affichage mise aux normes du thème sombre */}
          <div className="array-display-box" style={{ marginTop: '15px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: '1px solid var(--border-color, #444)' }}>
            <p style={{ margin: '0 0 8px 0' }}><strong>Contenu actuel :</strong> [ {arrayElements.join(', ')} ]</p>
            <p style={{ margin: 0, color: '#3b82f6' }}><strong>Somme totale (Blockchain) :</strong> {totalSomme}</p>
          </div>
        </div>

        {/* Formulaire de Lecture */}
        <div className="card">
          <h3>Rechercher par Index (Test du require)</h3>
          <form onSubmit={handleGetElement}>
            <input 
              type="number" 
              placeholder="Entrez un index (ex: 0, 1, 2)" 
              value={indexInput} 
              onChange={e => setIndexInput(e.target.value)} 
              required 
            />
            <button type="submit">Chercher l'élément</button>
          </form>
          {searchResult && <p className="result">{searchResult}</p>}
          {searchError && <p className="result" style={{ background: '#451a03', border: '1px solid #9a3412', color: '#f97316' }}>{searchError}</p>}
        </div>
      </div>

      {/* Panneau d'informations Blockchain unifié */}
      <BlockchainInfo 
        account={account} 
        contractAddress={contractAddress} 
        networkId={networkId} 
        lastBlock={lastBlock} 
        lastTransaction={txDetails}
      />
    </div>
  );
}

export default Exercice6;