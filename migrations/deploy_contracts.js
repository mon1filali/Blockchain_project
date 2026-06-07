// Importation des artefacts de tes 8 contrats
const Addition = artifacts.require("Addition");
const Convertisseur = artifacts.require("Convertisseur");
const GestionChaines = artifacts.require("GestionChaines");
const Positif = artifacts.require("Positif");
const Parite = artifacts.require("Parite");
const GestionTableau = artifacts.require("SommeListeNombre"); // Exercice 6
const Rectangle = artifacts.require("Rectangle"); // Exercice 7 (Hérite de Forme)
const Payment = artifacts.require("Payment");     // Exercice 8

module.exports = async function (deployer, network, accounts) {
  // Déploiement des exercices simples (sans paramètres au constructeur)
  await deployer.deploy(Addition);
  await deployer.deploy(Convertisseur);
  await deployer.deploy(GestionChaines);
  await deployer.deploy(Positif);
  await deployer.deploy(Parite);
  await deployer.deploy(GestionTableau);

  // Exercice 7 : Le constructeur de Rectangle attend (x, y, longueur, largeur)
  // On lui passe par exemple : x=10, y=20, longueur=5, largeur=4
  await deployer.deploy(Rectangle, 10, 20, 5, 4);

  // Exercice 8 : Le constructeur de Payment attend l'adresse du bénéficiaire (recipient)
  // On utilise le deuxième compte fourni par Ganache : accounts[1]
  const beneficiaire = accounts[1];
  await deployer.deploy(Payment, beneficiaire);
};