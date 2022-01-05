import * as React from 'react';
import styled from 'styled-components';
import Loader from './Loader';
import Button from './Button';
import ProgressIndicator from './ProgressIndicator';
import TransferState from '../enums/TransferState';
import TransferType from '../enums/TransferType';
import EthereumLogo from '../assets/eth.svg';
import PolygonLogo from '../assets/polygon.svg';
import {
  ROOT_TUNNEL,
  ROOT_TOKEN,
  CHILD_TOKEN,
  MUMBAI_POLYGONSCAN_URL,
  GOERLI_ETHEREUMSCAN_URL,
  SEND_MESSAGE_EVENT_SIG,
} from '../constants';
import {
  ellipseAddress,
  showNotification,
  getMockTransaction,
  getMockBurnProof,
  getMockCheckpointResult,
} from '../helpers/utilities';

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
  height: 70px;
  font-size: 14px;
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
`;

const SLogo = styled.div<{ eth?: boolean }>`
  & img {
    max-width: 40px;
    ${({ eth }) => (eth ? 'margin-right: 6px;' : 'margin-left: -8px;')}
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

const debug = false;

interface ITransaction {
  status: string;
  hash: string;
}

interface ITransferFlowState {
  transferState: TransferState;
  transactions: ITransaction[];
  showTransactions: boolean;
  burnTxHash: string | null;
  verifyingCheckpoint: boolean;
}

interface ITransferFlowProps {
  onCancel: (refresh: boolean) => void;
  address: string;
  rootTokenContract: any;
  rootTunnelContract: any;
  childTunnelContract: any;
  posClient: any;
  symbol: string;
  tokenId: number;
  tokenURI: string;
  type: TransferType;
  getNetwork: () => string;
}

const INITIAL_STATE: ITransferFlowState = {
  transferState: TransferState.PendingUserConfirmation,
  transactions: [],
  showTransactions: false,
  burnTxHash: null,
  verifyingCheckpoint: false,
};

class TransferFlow extends React.Component<ITransferFlowProps, ITransferFlowState> {
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
    if (this.props.type === TransferType.Deposit) {
      this.onDepositConfirm();
    } else {
      this.onWithdrawConfirm();
    }
  };

  public onDepositConfirm = async () => {
    const { tokenId, tokenURI, rootTokenContract, rootTunnelContract, address } = this.props;

    this.setState({ transferState: TransferState.PendingApproval });

    const approveTransaction = debug
      ? await getMockTransaction(1)
      : await rootTokenContract.approve(ROOT_TUNNEL, tokenId);

    this.updateTransaction(0, {
      hash: approveTransaction.hash,
      status: 'Pending',
    });

    const approveTransactionReceipt = await approveTransaction.wait();

    if (approveTransactionReceipt.status === 1) {
      this.updateTransaction(0, { status: 'Success' });
      this.setState({ transferState: TransferState.Approved });

      const depositTransaction = debug
        ? await getMockTransaction(1)
        : await rootTunnelContract.deposit(ROOT_TOKEN, address, tokenId, tokenURI);
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
        showNotification('There was an error with your Deposit transaction!');
      }
    } else {
      this.updateTransaction(0, { status: 'Failed' });
      showNotification('There was an error with your Approval transaction!');
    }
  };

  public onWithdrawConfirm = async () => {
    const { tokenId, childTunnelContract } = this.props;

    this.setState({ transferState: TransferState.PendingApproval });

    const transaction = debug ? await getMockTransaction(1) : await childTunnelContract.withdraw(CHILD_TOKEN, tokenId);

    this.updateTransaction(0, {
      hash: transaction.hash,
      status: 'Pending',
    });

    const transactionReceipt = await transaction.wait();

    if (transactionReceipt.status === 1) {
      this.updateTransaction(0, { status: 'Success' });
      this.setState({
        transferState: TransferState.Approved,
        burnTxHash: transaction.hash,
      });
    } else {
      this.updateTransaction(0, { status: 'Failed' });
      showNotification('There was an error with your Withdrawal transaction!');
    }
  };

  public onVerifyCheckpoint = async () => {
    this.setState({ verifyingCheckpoint: true });

    const isCheckpointed = debug
      ? await getMockCheckpointResult(true)
      : await this.props.posClient.isCheckPointed(this.state.burnTxHash);

    this.setState({ verifyingCheckpoint: false });

    if (isCheckpointed) {
      this.setState({ transferState: TransferState.PendingConfirmation });
    } else {
      showNotification('The transaction is not checkpointed yet!');
    }
  };

  public onClaim = async () => {
    this.setState({ transferState: TransferState.Confirmed });

    const proof = debug
      ? await getMockBurnProof()
      : await this.props.posClient.exitUtil.buildPayloadForExit(this.state.burnTxHash, SEND_MESSAGE_EVENT_SIG, true);

    const transaction = debug
      ? await getMockTransaction(1)
      : await this.props.rootTunnelContract.receiveMessage(proof, {
          gasLimit: 12e6,
          maxPriorityFeePerGas: 12e6,
          maxFeePerGas: 12e6,
        });

    this.updateTransaction(1, {
      hash: transaction.hash,
      status: 'Pending',
    });

    const transactionReceipt = await transaction.wait();

    if (transactionReceipt.status === 1) {
      this.updateTransaction(1, { status: 'Success' });
      this.setState({ transferState: TransferState.Completed });
      showNotification('Transfer successful!');
    } else {
      this.updateTransaction(1, { status: 'Failed' });
      showNotification('There was an error with your Receive transaction!');
    }
  };

  public onCancel = (refresh: boolean) => {
    this.props.onCancel(refresh);
  };

  public render = () => {
    const { transferState, showTransactions, transactions, verifyingCheckpoint } = this.state;
    const { type, tokenId, symbol } = this.props;

    const ethereumLogo = (
      <SLogo eth={true}>
        <img src={EthereumLogo} />
        <span>{'Ethereum (Goerli)'}</span>
      </SLogo>
    );
    const polygonLogo = (
      <SLogo>
        <img src={PolygonLogo} />
        <span>{'Polygon (Mumbai)'}</span>
      </SLogo>
    );

    let progressInformation = '';
    if (type === TransferType.Deposit) {
      if (transferState === TransferState.Confirmed) {
        progressInformation =
          'Your transfer is en-route. It will take ~10-15 minutes for the deposit to get completed. On completion, your balance will be updated.';
      } else {
        progressInformation =
          'Ethereum transactions can take longer time to complete based upon network congestion. Please wait or increase the gas price of the transaction.';
      }
    } else {
      if (transferState === TransferState.Approved) {
        progressInformation =
          'Please wait until matic checkpoint arrive with your previous transaction. Checkpointing takes ~1 hour.';
      } else if (transferState === TransferState.PendingConfirmation) {
        progressInformation = 'Your token is now ready to claim on Ethereum Goerli.';
      } else {
        progressInformation = 'Your transaction will be confirmed in a few seconds.';
      }
    }

    let header2Text = '';
    if (type === TransferType.Deposit) {
      header2Text = 'Transaction in process';
    } else {
      if (transferState === TransferState.Approved) {
        header2Text = 'Waiting for Checkpoint';
      } else if (transferState === TransferState.PendingConfirmation) {
        header2Text = 'Checkpoint Reached';
      } else {
        header2Text = 'Transaction in process';
      }
    }

    return (
      <SFlowWrapper>
        <SHeader1>
          {transferState === TransferState.PendingUserConfirmation && 'Transfer Confirmation'}
          {(transferState === TransferState.PendingApproval || transferState === TransferState.Approved) &&
            'Transfer in Progress'}
          {type === TransferType.Deposit && transferState === TransferState.Confirmed && 'Transfer en route'}
          {type === TransferType.Withdraw && transferState === TransferState.PendingConfirmation && 'Transfer in Progress'}
          {type === TransferType.Withdraw && transferState === TransferState.Confirmed && 'Claiming token'}
          {type === TransferType.Withdraw && transferState === TransferState.Completed && 'Completed'}
        </SHeader1>
        <STransferDirection>
          {type === TransferType.Deposit ? ethereumLogo : polygonLogo}
          <div>
            <SArrowLine />
            <SArrowTip />
          </div>
          {type === TransferType.Deposit ? polygonLogo : ethereumLogo}
        </STransferDirection>
        <SSeparator />
        <STransferDetails>
          <STokenDetails>
            <div>{'Token ID'}</div>
            <div>{tokenId}</div>
          </STokenDetails>
          <STokenDetails>
            <div>{'Transfer Amount'}</div>
            <div>{`1 ${symbol}`}</div>
          </STokenDetails>
          <STokenDetails>
            <div>{'Service fee'}</div>
            <div>{`0.001 ETH`}</div>
          </STokenDetails>
        </STransferDetails>
        <SSeparator />
        <ProgressIndicator transferState={transferState} transferType={type} />
        {transferState === TransferState.PendingUserConfirmation ? (
          <SDetailsWrapper>
            <SDetailsText>{`Are you sure you wish to transfer your token to ${
              type === TransferType.Deposit ? 'Polygon Mumbai' : 'Ethereum Goerli'
            }?`}</SDetailsText>
            <SDetailsTextSmall>{`Approximate transfer time ~${
              type === TransferType.Deposit ? '15 minutes' : '1 hour'
            }.`}</SDetailsTextSmall>
            <SButtonWrapper>
              <Button onClick={() => this.onConfirm()}>{'Confirm'}</Button>
              <Button onClick={() => this.onCancel(false)}>{'Cancel'}</Button>
            </SButtonWrapper>
          </SDetailsWrapper>
        ) : (
          <SDetailsWrapper>
            {type === TransferType.Deposit && transferState !== TransferState.Confirmed && (
              <SLoaderContainer>
                <Loader />
              </SLoaderContainer>
            )}
            {type === TransferType.Withdraw &&
              (transferState < TransferState.Approved || transferState === TransferState.Confirmed) && (
                <SLoaderContainer>
                  <Loader />
                </SLoaderContainer>
              )}
            {transferState < TransferState.Confirmed && <SHeader2>{header2Text}</SHeader2>}
            {transferState !== TransferState.Completed && (
              <SProgressInformation margin={transferState === TransferState.Confirmed}>
                {progressInformation}
              </SProgressInformation>
            )}
            {transferState === TransferState.Approved && type === TransferType.Withdraw && (
              <>
                <SProgressInformation margin={true}>
                  {'To refresh checkpoint status, click Refresh.'}
                </SProgressInformation>
                <SButtonWrapper>
                  <Button onClick={() => this.onVerifyCheckpoint()} disabled={verifyingCheckpoint}>
                    {'Refresh'}
                  </Button>
                </SButtonWrapper>
              </>
            )}
            {type === TransferType.Withdraw && transferState === TransferState.PendingConfirmation && (
              <>
                {this.props.getNetwork() === 'mumbai' && (
                  <SProgressInformation margin={true}>{'Please switch your network.'}</SProgressInformation>
                )}
                <SButtonWrapper>
                  <Button onClick={() => this.onClaim()} disabled={this.props.getNetwork() === 'mumbai'}>
                    {'Claim'}
                  </Button>
                </SButtonWrapper>
              </>
            )}
            {((type === TransferType.Deposit && transferState === TransferState.Confirmed) ||
              (type === TransferType.Withdraw && transferState === TransferState.Completed)) && (
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
                  {transactions.map((t, index) => (
                    <STransaction key={`Transaction${index}`}>
                      <div>
                        <a
                          href={`${type === TransferType.Deposit ? GOERLI_ETHEREUMSCAN_URL : MUMBAI_POLYGONSCAN_URL}${
                            t.hash
                          }`}
                          target="_blank"
                        >
                          {ellipseAddress(t.hash, 10)}
                        </a>
                      </div>
                      <div>{t.status}</div>
                    </STransaction>
                  ))}
                </div>
              )}
            </STransactionLog>
          </SDetailsWrapper>
        )}
      </SFlowWrapper>
    );
  };
}

export default TransferFlow;
