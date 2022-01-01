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
import { POSClient, use, setProofApi } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';

import {
  TOKEN_ABI,
  ROOT_TUNNEL_ABI,
  ROOT_TUNNEL,
  ROOT_TOKEN,
  CHILD_TOKEN,
  CHILD_TUNNEL,
  CHILD_TUNNEL_ABI,
  PROOF_API,
  GOERLI_RPC_URL,
  MUMBAI_RPC_URL,
} from './constants';

import { Web3Provider } from '@ethersproject/providers';
import { getChainData, isSupportedNetwork, toIpfsGatewayURI } from './helpers/utilities';
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

const SHeader1 = styled.h1`
  font-size: 30px;
`;

const SItemCollection = styled.div`
  display: flex;
  flex-direction: row;
`;

const SNoItems = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
  align-items: center;
  justify-content: center;
`;

const SItemContent = styled.div`
  height: 375px;
  padding: 10px;
  background-color: #f3f3f3;
  border: 1px solid lightgrey;
  border-radius: 10px;
`;

const SItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const SItem = styled.div`
  width: 350px;
  margin: 20px;
  padding: 10px;
  & h2 {
    font-size: 22px;
  }
`;

const STokenURI = styled.div`
  overflow-wrap: anywhere;
  text-align: start;
`;

const STransferButton = styled(Button)`
  align-self: center;
  margin: 10px;
`;

interface IAppState {
  fetching: boolean;
  address: string;
  library: any;
  connected: boolean;
  chainId: number;
  tokenName: string;
  tokenSymbol: string;
  tokenTotalSupply: number | null,
  pendingRequest: boolean;
  result: any | null;
  childTokenContract: any | null;
  rootTokenContract: any | null;
  rootTunnelContract: any | null;
  childTunnelContract: any | null;
  info: any | null;
  proof: any | null;
  posClient: any | null;
  burnTxHash: string;
  collection: any;
  loadingCollection: boolean;
  collectionLoaded: boolean;
  isSupportedNetwork: boolean;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: '',
  library: null,
  connected: false,
  chainId: 1,
  tokenName: '',
  tokenSymbol: '',
  tokenTotalSupply: null,
  pendingRequest: false,
  result: null,
  childTokenContract: null,
  rootTokenContract: null,
  rootTunnelContract: null,
  childTunnelContract: null,
  info: null,
  proof: null,
  posClient: new POSClient(),
  burnTxHash: '',
  collection: [],
  loadingCollection: false,
  collectionLoaded: false,
  isSupportedNetwork: false,
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
    setProofApi(PROOF_API);
  }

  public componentDidUpdate() {
    if (
      this.state.connected &&
      this.state.isSupportedNetwork &&
      !this.state.collectionLoaded &&
      !this.state.loadingCollection
    ) {
      this.setState({ loadingCollection: true });
      this.loadCollection();
    }
  }

  public async loadCollection() {
    const contract = this.getNetwork() === 'goerli' ? this.state.rootTokenContract : this.state.childTokenContract;
    const tokenName = await contract.name();
    const tokenSymbol = await contract.symbol();
    const tokenTotalSupply = await contract.totalSupply();
    let collection: any[] = [];

    const balance = await contract.balanceOf(this.state.address);

    if (balance > 0) {
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(this.state.address, i);
        const tokenURI = await contract.tokenURI(tokenId);
        const tokenMetadataURI = toIpfsGatewayURI(tokenURI);
        const metadata = await fetch(tokenMetadataURI).then(response => response.json());
        const tokenImgURI = toIpfsGatewayURI(metadata.image);

        collection.push({
          tokenId,
          tokenURI,
          name: metadata.name,
          description: metadata.description,
          src: tokenImgURI,
        });
      }
    }

    this.setState({
      tokenName,
      tokenSymbol,
      tokenTotalSupply,
      collection,
      loadingCollection: false,
      collectionLoaded: true,
    });
  }

  public async setContracts(library: any, address: string) {
    const childTokenContract = getContract(CHILD_TOKEN, TOKEN_ABI.abi, library, address);

    const rootTokenContract = getContract(ROOT_TOKEN, TOKEN_ABI.abi, library, address);

    const rootTunnelContract = getContract(ROOT_TUNNEL, ROOT_TUNNEL_ABI.abi, library, address);

    const childTunnelContract = getContract(CHILD_TUNNEL, CHILD_TUNNEL_ABI.abi, library, address);

    this.setState({
      childTokenContract,
      rootTokenContract,
      rootTunnelContract,
      childTunnelContract,
    });
  }

  public async initPoSClient(from: string) {
    await this.state.posClient.init({
      network: 'testnet',
      version: 'mumbai',
      parent: {
        provider: GOERLI_RPC_URL,
        defaultConfig: {
          from,
        },
      },
      child: {
        provider: MUMBAI_RPC_URL,
        defaultConfig: {
          from,
        },
      },
    });
  }

  public onConnect = async () => {
    this.provider = await this.web3Modal.connect();

    const library = new Web3Provider(this.provider);

    const network = await library.getNetwork();

    const address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider?.accounts[0];

    await this.initPoSClient(address);

    this.setContracts(library, address);

    await this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true,
      isSupportedNetwork: isSupportedNetwork(network.name),
    });

    await this.subscribeToProviderEvents(this.provider);
  };

  public onDeposit = async () => {
    const tokenId = 2;
    const tokenURI = await this.state.rootTokenContract.tokenURI(tokenId);
    console.log('Awaiting deposit approval...');
    const transaction = await this.state.rootTokenContract.approve(ROOT_TUNNEL, tokenId);
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
    const tokenId = 0;
    console.log('Awaiting withdrawal...');
    const transaction = await this.state.childTunnelContract.withdraw(CHILD_TOKEN, tokenId);
    const transactionReceipt = await transaction.wait();
    this.setState({ burnTxHash: transactionReceipt.transactionHash });
    console.log(transactionReceipt.transactionHash);
    console.log('Withdrawal successful');
  };

  public onCheckDepositResult = async () => {
    const txHash = '0x0fd1d13d5bb1a741b64f4d050fe098eedff5c37cdfc714af8fbfe27b346bea32';
    const message = 'Is Deposited: ' + (await this.state.posClient.isDeposited(txHash));
    alert(message);
  };

  public onClaim = async () => {
    const txHash = '0x9abc2e344af7466550ce5f01e9128cb41510d14df65916ce5e8b81654ff4c0db';

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
    await this.setState({
      chainId,
      library,
      isSupportedNetwork: isSupportedNetwork(network.name),
      collection: [],
      loadingCollection: false,
      collectionLoaded: false,
    });
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
    const {
      address,
      connected,
      chainId,
      tokenName,
      tokenSymbol,
      tokenTotalSupply,
      collection,
      isSupportedNetwork,
      loadingCollection,
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header connected={connected} address={address} chainId={chainId} killSession={this.resetApp} />
          <SContent>
            {loadingCollection ? (
              <Column center maxWidth={1000}>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : connected ? (
              isSupportedNetwork ? (
                <Column center maxWidth={1000}>
                  <SHeader1>{`${tokenName} (${tokenSymbol}) Collection of NFTs you can transfer between Polygon Mumbai and Ethereum Goerli:`}</SHeader1>
                  {tokenTotalSupply && <p>{`Total supply of tokens: ${tokenTotalSupply}`}</p>}
                  {collection.length ? (
                    <SItemCollection>
                      {collection.map((item: any, index: number) => (
                        <SItem key={'Item' + index}>
                          <SItemContent>
                            <img src={item.src} alt={item.name} />
                            <h2>{item.name}</h2>
                            <p>{item.description}</p>
                          </SItemContent>
                          <SItemDetails>
                            <div>{'Token ID: ' + item.tokenId}</div>
                            <STokenURI>{'Token URI: ' + item.tokenURI}</STokenURI>
                            <STransferButton>{'Transfer'}</STransferButton>
                          </SItemDetails>
                        </SItem>
                      ))}
                    </SItemCollection>
                  ) : (
                    <SNoItems>{'There are no items in your collection'}</SNoItems>
                  )}
                  {/* <Button onClick={this.onDeposit}>{'Deposit (Goerli)'}</Button>
                      <Button onClick={this.onWithdraw}>
                        {'Withdraw (Mumbai)'}
                      </Button>
                      <Button onClick={this.onClaim}>{'Claim (Goerli)'}</Button>
                      <Button onClick={this.onCheckDepositResult}>{'Check Deposit result'}</Button> */}
                </Column>
              ) : (
                <div>{'Unsupported Network! Please connect to Polygon Mumbai or Ethereum Goerli'}</div>
              )
            ) : (
              <SLanding center>
                <ConnectButton onClick={this.onConnect} />
              </SLanding>
            )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
