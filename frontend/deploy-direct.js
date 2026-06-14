const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Connexion à ton Ganache UI (Port 7545)
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
const contractsDir = path.join(__dirname, 'src', 'contracts');

const files = [
  { name: "Addition.json", args: [] },
  { name: "Convertisseur.json", args: [] },
  { name: "GestionChaines.json", args: [] },
  { name: "Positif.json", args: [] },
  { name: "Parite.json", args: [] },
  { name: "SommeListeNombre.json", args: [] },
  { name: "Rectangle.json", args: [10, 20, 5, 4] }, // Constructeur de Rectangle (Exo 7)
  { name: "Payment.json", args: null }              // Traité dynamiquement (Exo 8)
];

async function deployAll() {
  try {
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0]; // Ton premier compte Ganache
    
    // CORRECTION 1 : Récupération DYNAMIQUE du Network ID réel de ton Ganache au lieu de forcer "5777"
    const currentNetworkId = await web3.eth.net.getId();
    const networkIdStr = currentNetworkId.toString();

    console.log("🚀 Lancement du déploiement direct depuis le Frontend...");
    console.log(`Compte émetteur : ${deployer}`);
    console.log(`ID Réseau détecté sur Ganache : ${networkIdStr}\n`);

    for (let contractFile of files) {
      const filePath = path.join(contractsDir, contractFile.name);
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Fichier introuvable : ${contractFile.name}`);
        continue;
      }

      const artifact = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      let bytecode = artifact.bytecode;
      if (!bytecode.startsWith('0x')) {
        bytecode = '0x' + bytecode;
      }

      let deployArgs = contractFile.args;
      if (contractFile.name === "Payment.json") {
        deployArgs = [accounts[1]]; // Deuxième compte Ganache comme bénéficiaire
        console.log(`[Exo 8] Attribution du bénéficiaire au compte 2 : ${accounts[1]}`);
      }

      console.log(`-> Instanciation et déploiement de ${contractFile.name}...`);

      const contractObject = new web3.eth.Contract(artifact.abi);
      
      // Envoi de la transaction brute de déploiement
      const instance = await contractObject.deploy({
        data: bytecode,
        arguments: deployArgs
      }).send({
        from: deployer,
        gas: 4000000,
        gasPrice: '20000000000'
      });

      // CORRECTION 2 : Injection propre à l'ID réseau actif détecté
      if (!artifact.networks) artifact.networks = {};
      artifact.networks[networkIdStr] = {
        events: {},
        links: {},
        address: instance.options.address,
        transactionHash: instance.transactionHash
      };

      // Sauvegarde de l'artéfact mis à jour
      fs.writeFileSync(filePath, JSON.stringify(artifact, null, 2));
      console.log(`✅ Déployé avec succès à l'adresse : ${instance.options.address}\n`);
    }

    console.log("🎉 Opération réussie ! Tous les contrats sont liés à ton interface React.");
  } catch (error) {
    console.error("❌ Erreur de déploiement :", error.message);
  }
}

deployAll();