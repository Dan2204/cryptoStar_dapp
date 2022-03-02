import Web3 from 'web3';
import starNotaryArtifact from '../../build/contracts/StarNotary.json';

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    console.log('Here 1');
    const { web3 } = this;

    console.log('Here 2');
    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log('Here 3');
      console.log(networkId);
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(starNotaryArtifact.abi, deployedNetwork.address);
      console.log(this.meta);
      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error('Could not connect to contract or chain.');
    }
  },

  setStatus: function (message) {
    const status = document.getElementById('status');
    status.innerHTML = message;
  },

  createStar: async function () {
    const { createStar } = this.meta.methods;
    const name = document.getElementById('starName').value;
    const id = document.getElementById('starId').value;
    if (name.trim() !== '' && id.trim() !== '') {
      await createStar(name, id).send({ from: this.account });
      App.setStatus(`'${name}' is now owned by: ${this.account}`);
    } else {
      App.setStatus('Please fill in all fields');
    }
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo, ownerOf } = this.meta.methods;
    const starId = document.getElementById('lookid').value;
    let message;
    if (starId.trim() !== '') {
      try {
        const starName = await lookUptokenIdToStarInfo(starId).call();
        const starOwner = await ownerOf(starId).call();
        message = `id: '${starId}' => name: '${starName}' => owner: '${starOwner}'`;
      } catch (error) {
        console.log(error);
        message = `Star not found.`;
      }
    } else {
      message = 'Please fill in all fields';
    }
    App.setStatus(message);
  },
};

window.App = App;

window.addEventListener('load', async function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } else {
    console.warn('Please insatll MetaMask.');
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    // App.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'));
  }

  App.start();
});
