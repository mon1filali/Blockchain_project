import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import TransactionInfo from '../Components/TransactionInfo';
import Web3 from 'web3';
import RectangleABI from '../contracts/Rectangle.json';

function Exercice7() {
  const [posX, setPosX] = useState('');
  const [posY, setPosY] = useState('');
  const [dx, setDx] = useState('');
  const [dy, setDy] = useState('');
  
  const [dimensions, setDimensions] = useState({ lo: 0, la: 0 });
  const [surface, setSurface] = useState(0);
  const [infoMessage, setInfoMessage] = useState('');

  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  const refreshGeometrieData = useCallback(async (address) => {
    if (!address) return;
    try {
      const instance = new web3.eth.Contract(RectangleABI.abi, address);
      
      // Lecture de la position (x, y) hébergée sur le parent 'Forme'
      const coords = await instance.methods.afficheXY().call();
      setPosX(coords[0].toString());
      setPosY(coords[1].toString());

      // Lecture des dimensions spécifiques au Rectangle
      const dims = await instance.methods.afficheLoLa().call();
      setDimensions({ lo: dims[0].toString(), la: dims[1].toString() });

      // Lecture de la surface calculée par polymorphisme
      const surf = await instance.methods.surface().call();
      setSurface(surf.toString());

      // Lecture de la fonction surchargée (override)
      const msg = await instance.methods.afficheInfos().call();
      setInfoMessage(msg);
    } catch (e) { console.error(e); }
  }, []);

  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = RectangleABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
        refreshGeometrieData(deployedNetwork.address);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({ number: block.number.toString(), hash: block.hash, timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString() });
    } catch (e) { console.error(e); }
  }, [refreshGeometrieData]);

  useEffect(() => { initBlockchain(); }, [initBlockchain]);

  // ÉCRITURE : Déplace la forme (génère une transaction !)
  const handleDeplacer = async (e) => {
    e.preventDefault();
    if (!contractAddress || dx === '' || dy === '') return;
    try {
      const instance = new web3.eth.Contract(RectangleABI.abi, contractAddress);
      const receipt = await instance.methods.deplacerForme(dx, dy).send({ from: account });
      
      setTxDetails({
        hash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString()
      });

      setDx('');
      setDy('');
      refreshGeometrieData(contractAddress);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Sommaire</Link>
      <h2>Exercice 7 : Programmation Orientée Objet (Héritage)</h2>

      <div className="exo-grid">
        <div className="card">
          <h3>Caractéristiques du Rectangle</h3>
          <div className="info-display">
            <p><strong>Type identifié :</strong> <span className="badge-type">{infoMessage}</span></p>
            <p><strong>Dimensions (lo × la) :</strong> {dimensions.lo} × {dimensions.la} m</p>
            <p><strong>Surface totale calculée :</strong> <span className="highlight-text">{surface} m²</span></p>
          </div>
        </div>

        <div className="card">
          <h3>Position & Déplacement</h3>
          <p className="current-state">Position actuelle : <strong>X = {posX}</strong>, <strong>Y = {posY}</strong></p>
          <form onSubmit={handleDeplacer}>
            <input type="number" placeholder="Nouvelle coordonnée X" value={dx} onChange={e => setDx(e.target.value)} required />
            <input type="number" placeholder="Nouvelle coordonnée Y" value={dy} onChange={e => setDy(e.target.value)} required />
            <button type="submit">Déplacer la Forme (Transaction)</button>
          </form>
        </div>
      </div>

      <BlockchainInfo account={account} contractAddress={contractAddress} networkId={networkId} lastBlock={lastBlock} />
      <TransactionInfo txDetails={txDetails} />
    </div>
  );
}

export default Exercice7;