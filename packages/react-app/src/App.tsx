import * as React from 'react';
import styled from 'styled-components';

import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
import Column from './components/Column';
import Wrapper from './components/Wrapper';
import Header from './components/Header';
import Loader from './components/Loader';
import Button from './components/Button';
import ConnectButton from './components/ConnectButton';
import { POSClient, use, setProofApi } from "@maticnetwork/maticjs";
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';

import {
  TOKEN_ABI,
  ROOT_TUNNEL_ABI,
  ROOT_TUNNEL,
  ROOT_TOKEN,
  CHILD_TOKEN,
  CHILD_TUNNEL,
  CHILD_TUNNEL_ABI,
} from './constants';

import { Web3Provider } from '@ethersproject/providers';
import { getChainData } from './helpers/utilities';
import { getContract } from './helpers/ethers';

use(Web3ClientPlugin);

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 600px;
`;

// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

interface IAppState {
  fetching: boolean;
  address: string;
  library: any;
  connected: boolean;
  chainId: number;
  pendingRequest: boolean;
  result: any | null;
  rootTokenContract: any | null;
  rootTunnelContract: any | null;
  childTunnelContract: any | null;
  info: any | null;
  proof: any | null;
  posClient: any | null;
  burnTxHash: string;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: '',
  library: null,
  connected: false,
  chainId: 1,
  pendingRequest: false,
  result: null,
  rootTokenContract: null,
  rootTunnelContract: null,
  childTunnelContract: null,
  info: null,
  proof: null,
  posClient: new POSClient(),
  burnTxHash: '',
};

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;
  public provider: any;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };

    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions(),
    });
  }

  public componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.onConnect();
    }
    setProofApi('https://apis.matic.network/');
  }

  public setContracts(library: any, address: string) {
    const rootTokenContract = getContract(
      ROOT_TOKEN,
      TOKEN_ABI.abi,
      library,
      address
    );

    const rootTunnelContract = getContract(
      ROOT_TUNNEL,
      ROOT_TUNNEL_ABI.abi,
      library,
      address
    );

    const childTunnelContract = getContract(
      CHILD_TUNNEL,
      CHILD_TUNNEL_ABI.abi,
      library,
      address
    );

    this.setState({
      rootTokenContract,
      rootTunnelContract,
      childTunnelContract,
    });
  }

  public async initPoSClient(from: string) {
    await this.state.posClient.init({
      network: "testnet",
      version: "mumbai",
      parent: {
        provider: 'https://eth-goerli.alchemyapi.io/v2/kbgkxIOiGn6EE2p5JKCDUQ6XIuZ0S3Gb',
        defaultConfig: {
          from
        }
      },
      child: {
        provider: 'https://polygon-mumbai.g.alchemy.com/v2/W6txy-iufqn51fzpLTwAw3fzd2l5J6i4',
        defaultConfig: {
          from
        }
      }
    });
  }

  public onConnect = async () => {
    this.provider = await this.web3Modal.connect();

    const library = new Web3Provider(this.provider);

    const network = await library.getNetwork();

    const address = this.provider.selectedAddress
      ? this.provider.selectedAddress
      : this.provider?.accounts[0];

    await this.initPoSClient(address);

    this.setContracts(library, address);

    await this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true,
    });

    await this.subscribeToProviderEvents(this.provider);
  };

  public onDeposit = async () => {
    const tokenId = 1;
    const tokenURI = await this.state.rootTokenContract.tokenURI(tokenId);
    console.log('Awaiting deposit approval...');
    const transaction = await this.state.rootTokenContract.approve(
      ROOT_TUNNEL,
      tokenId
    );
    const transactionReceipt = await transaction.wait();
    if (transactionReceipt.status === 1) {
      console.log('Deposit approval successful!');
      console.log('Depositing...');
      const depositTransaction = await this.state.rootTunnelContract.deposit(
        ROOT_TOKEN,
        this.state.address,
        tokenId,
        tokenURI
      );
      const depositTransactionReceipt = await depositTransaction.wait();
      if (depositTransactionReceipt.status === 1) {
        console.log('Deposit successful!');
      }
    }
  };

  public onWithdraw = async () => {
    const tokenId = 1;
    console.log('Awaiting withdrawal...');
    const transaction = await this.state.childTunnelContract.withdraw(
      CHILD_TOKEN,
      tokenId
    );
    const transactionReceipt = await transaction.wait();
    this.setState({ burnTxHash: transactionReceipt.transactionHash });
    console.log(transactionReceipt.transactionHash);
    console.log('Withdrawal successful');
  };

  public onClaim = async () => {
    const txHash = '0x011ecc205086581515a3e8d72de31bf357a888c486d54878f0f699647e945877';
                    
    const isCheckpointed = await this.state.posClient.isCheckPointed(txHash);

    // const signature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    // const signature2 = '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036';
    // const signature3 = '0xf871896b17e9cb7a64941c62c188a4f5c621b86800e3d15452ece01ce56073df';
    // const signature4 = '0xf94915c6d1fd521cee85359239227480c7e8776d7caf1fc3bacad5c269b66a14';

    if (!isCheckpointed) {
      alert('The transaction is not checkpointed yet!');
      return;
    }

    console.log('Preparing proof...');

    // const proof = await exitUtil.buildPayloadForExit(
    //   txHash,
    //   '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036', // SEND_MESSAGE_EVENT_SIG, do not change
    //   true
    // );

    const proof = await this.state.posClient.exitUtil.buildPayloadForExit(
      txHash,
      '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036',
      true
    );

    // const proof = await this.state.posClient['posRootChainManager']
    //   .customPayload(
    //     txHash, // replace with txn hash of sendMessageToRoot
    //     "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036" // SEND_MESSAGE_EVENT_SIG, do not change
    //   )
console.log(proof);
    // const proof = await this.state.posClient['rootChainManager']
    //   .customPayload(
    //     txHash, // replace with txn hash of sendMessageToRoot
    //     "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036" // SEND_MESSAGE_EVENT_SIG, do not change
    //   );
    console.log('Claiming...');
    await this.state.rootTunnelContract.receiveMessage(proof, { 
      gasLimit: 12e6,
      maxPriorityFeePerGas: 12e6,
      maxFeePerGas: 12e6,
    });
    console.log('Claimed.');
  };

  public subscribeToProviderEvents = async (provider: any) => {
    if (!provider.on) {
      return;
    }

    provider.on('accountsChanged', this.changedAccount);
    provider.on('networkChanged', this.networkChanged);
    provider.on('close', this.close);

    await this.web3Modal.off('accountsChanged');
  };

  public async unSubscribe(provider: any) {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    // @ts-ignore
    window.location.reload(false);
    if (!provider.off) {
      return;
    }

    provider.off('accountsChanged', this.changedAccount);
    provider.off('networkChanged', this.networkChanged);
    provider.off('close', this.close);
  }

  public changedAccount = async (accounts: string[]) => {
    if (!accounts.length) {
      // Metamask Lock fire an empty accounts array
      await this.resetApp();
    } else {
      await this.setState({ address: accounts[0] });
    }
  };

  public networkChanged = async (networkId: number) => {
    const library = new Web3Provider(this.provider);
    const network = await library.getNetwork();
    const chainId = network.chainId;
    this.setContracts(library, this.state.address);
    await this.setState({ chainId, library });
  };

  public close = async () => {
    this.resetApp();
  };

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '40c2813049e44ec79cb4d7e0d18de173',
        },
      },
    };
    return providerOptions;
  };

  public resetApp = async () => {
    await this.web3Modal.clearCachedProvider();
    localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
    localStorage.removeItem('walletconnect');
    await this.unSubscribe(this.provider);

    this.setState({ ...INITIAL_STATE });
  };

  public render = () => {
    const { address, connected, chainId, fetching } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
          />
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : (
              <SLanding center>
                {!this.state.connected && (
                  <ConnectButton onClick={this.onConnect} />
                )}
                {this.state.connected && (
                  <Button onClick={this.onDeposit}>{'Deposit (Goerli)'}</Button>
                )}
                {this.state.connected && (
                  <Button onClick={this.onWithdraw}>
                    {'Withdraw (Mumbai)'}
                  </Button>
                )}
                {this.state.connected && (
                  <Button onClick={this.onClaim}>{'Claim (Goerli)'}</Button>
                )}
              </SLanding>
            )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
