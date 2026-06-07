const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Connexion directe à ton Ganache UI (visible sur ta capture d'écran)
const web3 = new Web3('http://127.0.0.1:7545');
const artifactsDir = path.join(__dirname, 'frontend', 'src', 'contracts');

// Liste exacte de tes fichiers d'artéfacts compilés par Truffle
const filesToDeploy = [
  { file: "Addition.json", args: [] },
  { file: "Convertisseur.json", args: [] },
  { file: "GestionChaines.json", args: [] },
  { file: "Positif.json", args: [] }, 
  { file: "Parite.json", args: [] },
  { file: "SommeListeNombre.json", args: [] }, 
  { file: "Rectangle.json", args: [10, 20, 5, 4] }, // Paramètres de Forme & Rectangle (Exo 7)
  { file: "Payment.json", args: [] }                 // Géré spécifiquement plus bas (Exo 8)
];

async function run() {
  try {
    // Récupération des comptes de ton Ganache
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0]; // 0x8dFF194... (le premier compte sur ta capture d'écran)
    const networkId = "5777";     // Ton Network ID Ganache

    console.log("Déploiement personnalisé des contrats sur Ganache...");
    console.log(`Compte de déploiement : ${deployer}\n`);

    for (let item of filesToDeploy) {
      const filePath = path.join(artifactsDir, item.file);
      
      // Si le fichier n'existe pas (vérification du nom exact)
      if (!fs.existsSync(filePath)) {
        console.log(`Fichier introuvable : ${item.file}, ignoré.`);
        continue;
      }

      const artifact = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // On s'assure que le bytecode est présent
      if (!artifact.bytecode || artifact.bytecode === "0x") {
        console.log(`Pas de bytecode pour ${item.file}.`);
        continue;
      }

      const contract = new web3.eth.Contract(artifact.abi);

      // Cas particulier Exo 8 : Le constructeur de Payment prend l'adresse du bénéficiaire
      let currentArgs = item.args;
      if (item.file === "Payment.json") {
        currentArgs = [accounts[1]]; // Deuxième adresse Ganache
        console.log(`[Exo 8] Destinataire défini sur le compte 2 : ${accounts[1]}`);
      }

      console.log(` -> Déploiement de ${item.file}...`);
      
      const instance = await contract.deploy({
        data: artifact.bytecode,
        arguments: currentArgs
      }).send({ from: deployer, gas: 3000000 });

      // Injection de l'adresse réseau au format exact lu par React/Truffle
      if (!artifact.networks) artifact.networks = {};
      artifact.networks[networkId] = {
        events: {},
        links: {},
        address: instance.options.address,
        transactionHash: instance.transactionHash
      };

      // Sauvegarde du fichier JSON mis à jour
      fs.writeFileSync(filePath, JSON.stringify(artifact, null, 2));
      console.log(` Déployé avec succès à l'adresse : ${instance.options.address}\n`);
    }

    console.log("Tous tes contrats sont déployés et synchronisés avec ton Frontend React !");
  } catch (e) {
    console.error("Erreur lors du déploiement :", e.message);
  }
}

run();