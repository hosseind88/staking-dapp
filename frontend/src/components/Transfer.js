import React from 'react';
import web3 from 'web3';
import dai from '../dai.png';

export function Transfer({
  stakeTokens,
  stakingBalance = '0',
  dappTokenBalance = '0',
  daiTokenBalance = '0',
  unstakeTokens
}) {
  const [amount, setAmount] = React.useState('');

  return (
    <div id="content" className="mt-3">
      <table className="table table-borderless text-muted text-center">
        <thead>
          <tr>
            <th scope="col">Staking Balance</th>
            <th scope="col">Reward Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{web3.utils.fromWei(stakingBalance, 'ether')} mDAI</td>
            <td>{web3.utils.fromWei(dappTokenBalance, 'ether')} DAPP</td>
          </tr>
        </tbody>
      </table>

      <div className="card mb-4">
        <div className="card-body">
          <form
            className="mb-3"
            onSubmit={event => {
              event.preventDefault();
              stakeTokens(web3.utils.toWei(amount, 'ether'));
            }}
          >
            <div>
              <label className="float-left">
                <b>Stake Tokens</b>
              </label>
              <span className="float-right text-muted">
                Balance: {web3.utils.fromWei(daiTokenBalance, 'ether')}
              </span>
            </div>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="0"
                onChange={e => setAmount(e.target.value)}
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <img src={dai} height="32" alt="" />
                  &nbsp;&nbsp;&nbsp; mDAI
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              STAKE!
            </button>
          </form>
          <button
            type="submit"
            className="btn btn-link btn-block btn-sm"
            onClick={event => {
              event.preventDefault();
              unstakeTokens();
            }}
          >
            UN-STAKE...
          </button>
        </div>
      </div>
    </div>
  );
}
