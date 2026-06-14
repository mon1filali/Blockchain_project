import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import BlockchainInfo from '../Components/BlockchainInfo';
import Web3 from 'web3';
import RectangleABI from '../contracts/Rectangle.json';

function Exercice7() {
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [dx, setDx] = useState('');
  const [dy, setDy] = useState('');
  
  const [dimensions, setDimensions] = useState({ lo: 0, la: 0 });
  const [surface, setSurface] = useState(0);
  const [infoMessage, setInfoMessage] = useState('');

  // États Blockchain standardisés pour BlockchainInfo
  const [account, setAccount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [txDetails, setTxDetails] = useState(null);

  // CORRECTION : Instanciation directe et stable calée sur ton Ganache local (Port 7545)
  const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  // Référence pour le Canvas de dessin
  const canvasRef = useRef(null);

  // Fonction de rafraîchissement des données depuis Solidity
  const refreshGeometrieData = useCallback(async (address) => {
    if (!address) return;
    try {
      const instance = new web3.eth.Contract(RectangleABI.abi, address);
      
      const coords = await instance.methods.afficheXY().call();
      setPosX(Number(coords[0]));
      setPosY(Number(coords[1]));

      const dims = await instance.methods.afficheLoLa().call();
      setDimensions({ lo: Number(dims[0]), la: Number(dims[1]) });

      const surf = await instance.methods.surface().call();
      setSurface(surf.toString());

      const msg = await instance.methods.afficheInfos().call();
      setInfoMessage(msg);
    } catch (e) { 
      console.error("Erreur de lecture des données Solidity :", e); 
    }
  }, []);

  const initBlockchain = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts.length > 0 ? accounts[0] : '');

      const id = await web3.eth.net.getId();
      setNetworkId(Number(id));
      
      const deployedNetwork = RectangleABI.networks[id];
      if (deployedNetwork) {
        setContractAddress(deployedNetwork.address);
        await refreshGeometrieData(deployedNetwork.address);
      } else {
        console.warn(`Contrat Rectangle non trouvé sur le réseau ${id}`);
      }

      const block = await web3.eth.getBlock('latest');
      setLastBlock({ 
        number: block.number.toString(), 
        hash: block.hash, 
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (e) { 
      console.error("Erreur d'initialisation Exo 7 :", e); 
    }
  }, [refreshGeometrieData]);

  useEffect(() => { 
    initBlockchain(); 
  }, [initBlockchain]);

  // Redessiner le Canvas compact adapté pour le thème sombre dApp
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;
    
    const originX = width / 4;   
    const originY = height / 1.25; 
    const scale = 4; // Échelle miniature réajustée

    // 1. Dessiner la Grille fine (adaptée au fond sombre)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 15) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 15) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // 2. Dessiner les Axes (X et Y)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(width, originY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, height); ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('X', width - 12, originY - 4);
    ctx.fillText('Y', originX + 6, 12);

    // 3. Dessiner le Rectangle
    if (dimensions.lo > 0 && dimensions.la > 0) {
      const rectWidth = dimensions.lo * scale;
      const rectHeight = dimensions.la * scale;
      const rectX = originX + (posX * scale);
      const rectY = originY - (posY * scale) - rectHeight;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

      ctx.fillStyle = '#60a5fa';
      ctx.font = '9px sans-serif';
      ctx.fillText(`${dimensions.lo}m`, rectX + (rectWidth / 2) - 8, rectY - 4);
      ctx.fillText(`${dimensions.la}m`, rectX + rectWidth + 4, rectY + (rectHeight / 2) + 3);
    }
  }, [posX, posY, dimensions]);

  // 🔥 ÉCRITURE : Déplacement géométrique (Transaction active)
  const handleDeplacer = async (e) => {
    e.preventDefault();
    if (!contractAddress || dx === '' || dy === '' || !account) return;

    try {
      const instance = new web3.eth.Contract(RectangleABI.abi, contractAddress);
      
      // Conversions explicites des deltas en entiers relatifs (int256 supporté)
      const parsedDx = parseInt(dx, 10);
      const parsedDy = parseInt(dy, 10);

      const receipt = await instance.methods.deplacerForme(parsedDx, parsedDy).send({ 
        from: account,
        gas: 300000 
      });
      
      setTxDetails({
        hash: receipt.transactionHash,
        methodName: "deplacerForme",
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString()
      });

      setDx('');
      setDy('');
      await refreshGeometrieData(contractAddress);

      // Mise à jour immédiate du dernier bloc miné sur le réseau local
      const block = await web3.eth.getBlock('latest');
      setLastBlock({
        number: block.number.toString(),
        hash: block.hash,
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        gasUsed: block.gasUsed?.toString() || "0"
      });
    } catch (error) { 
      console.error("Échec de la transaction deplacerForme :", error); 
    }
  };

  return (
    <div className="exo-page">
      <Link to="/" className="back-link">← Retour</Link>
      <h2>Exercice 7 : POO & Visualisation Graphique</h2>

      <div className="exo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', alignItems: 'start' }}>
        
        {/* COLONNE GAUCHE : CANVAS DESIGN NOIR GRAPHITE */}
        <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '14px' }}>Visualisation de la Forme</h3>
          <canvas 
            ref={canvasRef} 
            width={340}   
            height={180}  
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', background: '#111827', display: 'block', margin: '0 auto' }}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', marginTop: '6px', fontStyle: 'italic' }}>
            Modèle géométrique miniature (Échelle 1:4).
          </p>
        </div>

        {/* COLONNE DROITE : DONNÉES STRUCTURÉES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3>Caractéristiques (Héritage & Polymorphisme)</h3>
            <div className="info-display" style={{ lineHeight: '1.6' }}>
              <p><strong>Type de Contrat :</strong> <span className="badge-type" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>{infoMessage || 'Rectangle'}</span></p>
              <p><strong>Dimensions (Longueur × Largeur) :</strong> {dimensions.lo}m × {dimensions.la}m</p>
              <p><strong>Surface calculée (Solidity) :</strong> <span className="highlight-text" style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '16px' }}>{surface} m²</span></p>
            </div>
          </div>

          <div className="card">
            <h3>Position actuelle & Modification</h3>
            <p className="current-state" style={{ marginBottom: '12px' }}>
              Coordonnées actuelles : <strong>X = {posX}</strong>, <strong>Y = {posY}</strong>
            </p>
            <form onSubmit={handleDeplacer} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder="Delta X" value={dx} onChange={e => setDx(e.target.value)} required style={{ width: '100%' }} />
                <input type="number" placeholder="Delta Y" value={dy} onChange={e => setDy(e.target.value)} required style={{ width: '100%' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                Déplacer la Forme (Transaction)
              </button>
            </form>
          </div>
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

export default Exercice7;