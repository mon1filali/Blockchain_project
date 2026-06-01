import { Link } from "react-router-dom";
import "../Style/Home.css";

function Home() {

  // la liste des exercices qui a ete donne dans le tp3 , avec le titre et le id pour le lien 
  const exercices = [
    { id: 1, titre: "Somme de deux nombres" },
    { id: 2, titre: "Conversion cryptomonnaies" },
    { id: 3, titre: "Gestion des chaînes" },
    { id: 4, titre: "Nombre positif" },
    { id: 5, titre: "Parité d'un nombre" },
    { id: 6, titre: "Gestion des tableaux" },
    { id: 7, titre: "POO - Formes" },
    { id: 8, titre: "Paiement et transactions" },
  ];

  return (
    <div className="home">
      <header className="header">
        <h1>Projet de Fin de Module</h1>
        <h2>Développement d'une dApp pour le TP 3</h2>
        <p>Solidity • Truffle • ReactJS</p>
      </header>

      <div className="cards-container">
        {exercices.map((exercice) => (
          <Link
            key={exercice.id}
            to={`/exercice${exercice.id}`}
            className="card"
          >
            <h3>Exercice {exercice.id}</h3>
            <p>{exercice.titre}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;