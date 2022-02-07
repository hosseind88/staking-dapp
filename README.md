# A Staking Dapp built by hardhat & solidity & react

to test the project you should do these steps:

```sh
git clone https://github.com/hosseind88/staking-dapp.git
cd staking-dapp
npm install
```

Once installed, let's run Hardhat's testing network:

```sh
npx hardhat node
```

Then, on a new terminal, go to the repository's root folder and run this to deploy your contract:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

then we can run the frontend with:
```sh
cd frontend
npm install
npm start
```

then on your metamask, please import the first account that hardhat shows you by importing it by account private-key

then you can stake some mDAI tokens and after that you can run this script:
```sh
npx hardhat run scripts/issue-token.js --network localhost
```
to get your staking reward by AMS token
