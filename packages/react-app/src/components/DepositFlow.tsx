import * as React from 'react';
import styled from 'styled-components';
import Loader from './Loader';
import Button from './Button';
import ProgressIndicator from './ProgressIndicator';
import TransferState from '../enums/TransferState';
import EthereumLogo from '../assets/eth.svg';
import PolygonLogo from '../assets/polygon.svg';
import { ROOT_TUNNEL, ROOT_TOKEN } from '../constants';
import { ellipseAddress } from '../helpers/utilities';

const SFlowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 500px;
  background-color: #f3f3f3;
  padding-top: 15px;
  padding-bottom: 15px;
  border: 1px solid lightgrey;
  border-radius: 10px;
  box-shadow: 0 10px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`;

const SHeader1 = styled.h1`
  color: #394f8a;
  font-size: 30px;
`;

const SHeader2 = styled.h2`
  color: #394f8a;
  font-size: 20px;
`;

const SLoaderContainer = styled.div`
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const STokenDetails = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 400px;
`;

const STransferDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60px;
`;

const SSeparator = styled.div`
  height: 1px;
  background-color: lightgrey;
  width: 100%;
`;

const SProgressInformation = styled.div<{ margin: boolean }>`
  ${props => props.margin && 'margin-top: 20px'};
  font-size: 14px;
`;

const SDetailsWrapper = styled.div`
  width: 400px;
  margin-bottom: 30px;
`;

const SDetailsText = styled.div`
  margin-top: 50px;
  margin-bottom: 10px;
  font-weight: 400;
  color: #394f8a;
`;

const SDetailsTextSmall = styled.div`
  opacity: 0.5;
  font-size: 13px;
`;

const SButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 25px;

  & button {
    margin: 0px 10px;
  }
`;

const STransferDirection = styled.div`
  height: 50px;
  width: 400px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 20px;

  & div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & img {
    max-width: 40px;
  }
  & div:first-of-type {
    margin-right: 10px;

    & img {
      margin-right: 6px;
    }
  }
`;

const SArrowLine = styled.span`
  width: 30px;
  height: 3px;
  margin-right: -7px;
  display: inline-block;
  background-color: #4a5fc1;
`;

const SArrowTip = styled.span`
  border: solid #4a5fc1;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
`;

const STransactionLog = styled.div`
  font-size: 14px;

  & > div:first-of-type {
    text-decoration: underline;
    margin-top: 30px;
    margin-bottom: 10px;
    color: #4a5fc1;
    cursor: pointer;
    &:hover {
      opacity: 0.75;
    }
  }
`;

const STransaction = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 13px;

  a {
    text-decoration: underline;
    color: #4a5fc1;
    cursor: pointer;
  }
  a:hover {
    opacity: 0.75;
  }
`;

interface ITransaction {
  status: string;
  hash: string;
}

interface IDepositFlowState {
  transferState: TransferState;
  transactions: ITransaction[];
  showTransactions: boolean;
}

interface IDepositFlowProps {
  onCancel: (refresh: boolean) => void;
  address: string;
  rootTokenContract: any;
  rootTunnelContract: any;
  symbol: string;
  tokenId: number;
  tokenURI: string;
}

const INITIAL_STATE: IDepositFlowState = {
  transferState: TransferState.PendingUserConfirmation,
  transactions: [],
  showTransactions: false,
};

class DepositFlow extends React.Component<IDepositFlowProps, IDepositFlowState> {

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };
  }

  public updateTransaction = (id: number, obj: any) => {
    const newTransactions = this.state.transactions.map((el, i) => (id === i ? { ...el, ...obj } : el));
    if (!newTransactions[id]) {
      newTransactions[id] = obj;
    }
    this.setState({
      transactions: newTransactions,
    });
  };

  public onConfirm = async () => {
    const { tokenId, tokenURI, rootTokenContract, rootTunnelContract, address } = this.props;

    this.setState({ transferState: TransferState.PendingApproval });

    const approveTransaction = await rootTokenContract.approve(ROOT_TUNNEL, tokenId);

    this.updateTransaction(0, {
      hash: approveTransaction.hash,
      status: 'Pending',
    });
    this.setState({ transferState: TransferState.PendingApproval });

    const approveTransactionReceipt = await approveTransaction.wait();

    if (approveTransactionReceipt.status === 1) {
      this.updateTransaction(0, { status: 'Success' });
      this.setState({ transferState: TransferState.Approved });

      const depositTransaction = await rootTunnelContract.deposit(ROOT_TOKEN, address, tokenId, tokenURI);
      this.updateTransaction(1, {
        hash: depositTransaction.hash,
        status: 'Pending',
      });

      const depositTransactionReceipt = await depositTransaction.wait();

      if (depositTransactionReceipt.status === 1) {
        this.updateTransaction(1, { status: 'Success' });
        this.setState({ transferState: TransferState.Confirmed });
      } else {
        this.updateTransaction(1, { status: 'Failed' });
        this.setState({ transferState: TransferState.Confirmed });
        alert('There was an error with your Deposit transaction!');
      }
    } else {
      this.updateTransaction(0, { status: 'Failed' });
      alert('There was an error with your Approval transaction!');
    }
  };

  public onCancel = (refresh: boolean) => {
    this.props.onCancel(refresh);
  };

  public render = () => {
    const { transferState, showTransactions, transactions } = this.state;

    return (
      <SFlowWrapper>
        <SHeader1>
          {transferState === TransferState.PendingUserConfirmation && 'Transfer Confirmation'}
          {(transferState === TransferState.PendingApproval || transferState === TransferState.Approved) &&
            'Transfer in Progress'}
          {transferState === TransferState.Confirmed && 'Transfer en route'}
        </SHeader1>
        <STransferDirection>
          <div>
            <img src={EthereumLogo} />
            <span>{'Ethereum (Goerli)'}</span>
          </div>
          <div>
            <SArrowLine />
            <SArrowTip />
          </div>
          <div>
            <img src={PolygonLogo} />
            <span>{'Polygon (Mumbai)'}</span>
          </div>
        </STransferDirection>
        <SSeparator />
        <STransferDetails>
          <STokenDetails>
            <div>{'Token ID'}</div>
            <div>{this.props.tokenId}</div>
          </STokenDetails>
          <STokenDetails>
            <div>{'Transfer Amount'}</div>
            <div>{`1 ${this.props.symbol}`}</div>
          </STokenDetails>
        </STransferDetails>
        <SSeparator />
        <ProgressIndicator transferState={transferState} />
        {transferState === TransferState.PendingUserConfirmation ? (
          <SDetailsWrapper>
            <SDetailsText>{'Are you sure you wish to transfer your token to Polygon Mumbai?'}</SDetailsText>
            <SDetailsTextSmall>{'Approximate transfer time ~15 minutes.'}</SDetailsTextSmall>
            <SButtonWrapper>
              <Button onClick={() => this.onConfirm()}>{'Confirm'}</Button>
              <Button onClick={() => this.onCancel(false)}>{'Cancel'}</Button>
            </SButtonWrapper>
          </SDetailsWrapper>
        ) : (
          <SDetailsWrapper>
            {transferState !== TransferState.Confirmed && (
              <SLoaderContainer>
                <Loader />
              </SLoaderContainer>
            )}
            {transferState !== TransferState.Confirmed && <SHeader2>{'Transaction in process'}</SHeader2>}
            <SProgressInformation margin={transferState === TransferState.Confirmed}>
              {transferState === TransferState.Confirmed
                ? 'Your transfer is en-route. It will take ~10-15 minutes for the deposit to get completed. On completion, your balance will be updated.'
                : 'Ethereum transactions can take longer time to complete based upon network congestion. Please wait or increase the gas price of the transaction.'}
            </SProgressInformation>
            {transferState === TransferState.Confirmed && (
              <SButtonWrapper>
                <Button onClick={() => this.onCancel(true)}>{'Go to your Collection'}</Button>
              </SButtonWrapper>
            )}
            <STransactionLog>
              <div onClick={() => this.setState({ showTransactions: !showTransactions })}>
                {showTransactions ? 'Hide Transactions' : 'Show Transactions'}
              </div>
              {showTransactions && (
                <div>
                  {transactions.map((t, index) => 
                    <STransaction key={`Transaction${index}`}>
                      <div><a href={`https://goerli.etherscan.io/tx/${t.hash}`} target='_blank'>{ellipseAddress(t.hash, 10)}</a></div>
                      <div>{t.status}</div>
                    </STransaction>
                  )}
                </div>
              )}
            </STransactionLog>
          </SDetailsWrapper>
        )}
      </SFlowWrapper>
    );
  };
}

export default DepositFlow;
