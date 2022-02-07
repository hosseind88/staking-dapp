const addresses = require('../frontend/src/contracts/contract-address.json');

async function main() {
  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.attach(addresses.TokenFarm);
  await tokenFarm.issueTokens()
  console.log("Tokens issued!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });