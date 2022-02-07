async function main() {
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

  const DaiToken = await ethers.getContractFactory("DaiToken");
  const daiToken = await DaiToken.deploy();
  await daiToken.deployed();

  console.log("DaiToken address:", daiToken.address);

  const AMSToken = await ethers.getContractFactory("AMSToken");
  const amsToken = await AMSToken.deploy();
  await amsToken.deployed();

  console.log("AMSToken address:", amsToken.address);

  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.deploy(amsToken.address, daiToken.address);
  await tokenFarm.deployed();

  console.log("TokenFarm address:", tokenFarm.address);

  // Transfer all tokens to TokenFarm (1 million)
  await amsToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // Transfer 100 Mock DAI tokens to investor
  await daiToken.transfer(await deployer.getAddress(), '100000000000000000000')

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(daiToken, amsToken, tokenFarm);
}

function saveFrontendFiles(daiToken, amsToken, tokenFarm) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ 
      DaiToken: daiToken.address, 
      AMSToken: amsToken.address, 
      TokenFarm: tokenFarm.address 
    }, undefined, 2)
  );

  const DaiTokenArtifact = artifacts.readArtifactSync("DaiToken");
  const AMSTokenArtifact = artifacts.readArtifactSync("AMSToken");
  const TokenFarmArtifact = artifacts.readArtifactSync("TokenFarm");

  fs.writeFileSync(
    contractsDir + "/DaiToken.json",
    JSON.stringify(DaiTokenArtifact, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/AMSToken.json",
    JSON.stringify(AMSTokenArtifact, null, 2)
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
