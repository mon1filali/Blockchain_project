import React from 'react';

function TransactionInfo({ txDetails }) {
  if (!txDetails) {
    return (
      <div className="info-card tx-info">
        <h3>📄 Dernière Transaction</h3>
        <p className="no-data">Aucune transaction effectuée pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="info-card tx-info">
      <h3>📄 Dernière Transaction</h3>
      <p><strong>Hash :</strong> <span className="hash-text">{txDetails.hash}</span></p>
      <p><strong>Gas utilisé :</strong> {txDetails.gasUsed}</p>
      <p><strong>Bloc d'inclusion :</strong> #{txDetails.blockNumber}</p>
    </div>
  );
}

export default TransactionInfo;