async function main() {
  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.attach(
    "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"
  );
  await tokenFarm.issueTokens()
  console.log("Tokens issued!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });