import React from 'react';
import { ethers } from 'ethers';

import TokenArtifact from '../contracts/Token.json';
import DaiTokenArtifact from '../contracts/DaiToken.json';
import AMSTokenArtifact from '../contracts/AMSToken.json';
import TokenFarmArtifact from '../contracts/TokenFarm.json';
import contractAddress from '../contracts/contract-address.json';

import { NoWalletDetected } from './NoWalletDetected';
import { ConnectWallet } from './ConnectWallet';
import { Loading } from './Loading';
import { Transfer } from './Transfer';
import { TransactionErrorMessage } from './TransactionErrorMessage';

const HARDHAT_NETWORK_ID = '31337';
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      tokenFarmData: undefined,
      selectedAddress: undefined,
      balance: undefined,
      transactionError: undefined,
      networkError: undefined,
      // balances
      daiTokenBalance: '0',
      amsTokenBalance: '0',
      stakingBalance: '0',
      // loading
      loading: false,
    };

    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (!this.state.tokenFarmData || this.state.loading) {
      return <Loading />;
    }

    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>{this.state.tokenFarmData.name}</h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>.
            </p>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-12">
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <Transfer
              transferTokens={(to, amount) => this._transferTokens(to, amount)}
              daiTokenBalance={this.state.daiTokenBalance}
              amsTokenBalance={this.state.amsTokenBalance}
              stakingBalance={this.state.stakingBalance}
              stakeTokens={this._stakeTokens}
              unstakeTokens={this._unstakeTokens}
            />
          </div>
        </div>
      </div>
    );
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.enable();

    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    window.ethereum.on('accountsChanged', ([newAddress]) => {
      if (newAddress === undefined) {
        return this._resetState();
      }
      this._initialize(newAddress);
    });

    window.ethereum.on('networkChanged', ([networkId]) => {
      this._resetState();
    });
  }

  _initialize(userAddress) {
    this.setState({
      selectedAddress: userAddress
    });

    this._intializeEthers();
    this._getTokenFarmData();
    this._initializeBalances();
  }

  async _intializeEthers() {
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this._token = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );
    this._daiToken = new ethers.Contract(
      contractAddress.DaiToken,
      DaiTokenArtifact.abi,
      this._provider.getSigner(0)
    );
    this._amsToken = new ethers.Contract(
      contractAddress.AMSToken,
      AMSTokenArtifact.abi,
      this._provider.getSigner(0)
    );
    this._tokenFarm = new ethers.Contract(
      contractAddress.TokenFarm,
      TokenFarmArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  async _getTokenFarmData() {
    const name = await this._tokenFarm.name();
    this.setState({ tokenFarmData: { name } });
  }

  async _initializeBalances() {
    const daiTokenBalance = await this._daiToken.balanceOf(this.state.selectedAddress);
    const amsTokenBalance = await this._amsToken.balanceOf(this.state.selectedAddress);
    const stakingBalance = await this._tokenFarm.stakingBalance(this.state.selectedAddress);
    this.setState({
      daiTokenBalance: daiTokenBalance.toString(),
      amsTokenBalance: amsTokenBalance.toString(),
      stakingBalance: stakingBalance.toString(),
    })
  }

  _stakeTokens = async (amount) => {
    this.setState({ loading: true })
    await this._daiToken.approve(this._tokenFarm.address, amount);
    await this._tokenFarm.stakeTokens(amount);
    this.setState({ loading: false })
  }

  _unstakeTokens = async (amount) => {
    this.setState({ loading: true })
    await this._tokenFarm.unstakeTokens();
    this.setState({ loading: false })
  }

  async _transferTokens(to, amount) {
    try {
      this._dismissTransactionError();
      const tx = await this._token.transfer(to, amount);
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }

      await this._updateBalance();
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      console.error(error);
      this.setState({ transactionError: error });
    }
  }

  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }
    return error.message;
  }

  _resetState() {
    this.setState(this.initialState);
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect Metamask to Localhost:8545'
    });

    return false;
  }
}
