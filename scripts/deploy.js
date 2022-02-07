// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  console.log("Token address:", token.address);

  const DaiToken = await ethers.getContractFactory("DaiToken");
  const daiToken = await DaiToken.deploy();
  await daiToken.deployed();

  console.log("DaiToken address:", daiToken.address);

  const DappToken = await ethers.getContractFactory("DappToken");
  const dappToken = await DappToken.deploy();
  await dappToken.deployed();

  console.log("DappToken address:", dappToken.address);

  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.deploy(dappToken.address, daiToken.address);
  await tokenFarm.deployed();

  console.log("TokenFarm address:", tokenFarm.address);

  // Transfer all tokens to TokenFarm (1 million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // Transfer 100 Mock DAI tokens to investor
  await daiToken.transfer(await deployer.getAddress(), '100000000000000000000')

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token, daiToken, dappToken, tokenFarm);
}

function saveFrontendFiles(token, daiToken, dappToken, tokenFarm) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ 
      Token: token.address, 
      DaiToken: daiToken.address, 
      DappToken: dappToken.address, 
      TokenFarm: tokenFarm.address 
    }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");
  const DaiTokenArtifact = artifacts.readArtifactSync("DaiToken");
  const DappTokenArtifact = artifacts.readArtifactSync("DappToken");
  const TokenFarmArtifact = artifacts.readArtifactSync("TokenFarm");

  fs.writeFileSync(
    contractsDir + "/Token.json",
    JSON.stringify(TokenArtifact, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/DaiToken.json",
    JSON.stringify(DaiTokenArtifact, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/DappToken.json",
    JSON.stringify(DappTokenArtifact, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/TokenFarm.json",
    JSON.stringify(TokenFarmArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
