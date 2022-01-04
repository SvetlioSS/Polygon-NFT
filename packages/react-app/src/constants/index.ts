export * from './contracts';
export { default as TOKEN_ABI } from './abis/FxLimeGameItem.json';
export { default as ROOT_TUNNEL_ABI } from './abis/RootTunnel.json';
export { default as CHILD_TUNNEL_ABI } from './abis/ChildTunnel.json';

const PROOF_API = 'https://apis.matic.network/';
const IPFS_GATEWAY = 'https://dweb.link/ipfs/';
const GOERLI_RPC_URL = 'https://eth-goerli.alchemyapi.io/v2/kbgkxIOiGn6EE2p5JKCDUQ6XIuZ0S3Gb';
const MUMBAI_RPC_URL = 'https://polygon-mumbai.g.alchemy.com/v2/W6txy-iufqn51fzpLTwAw3fzd2l5J6i4';
const MUMBAI_POLYGONSCAN_URL = 'https://mumbai.polygonscan.com/tx/';
const GOERLI_ETHEREUMSCAN_URL = 'https://goerli.etherscan.io/tx/';
const SEND_MESSAGE_EVENT_SIG = '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036';

export {
  PROOF_API,
  IPFS_GATEWAY,
  GOERLI_RPC_URL,
  MUMBAI_RPC_URL,
  MUMBAI_POLYGONSCAN_URL,
  GOERLI_ETHEREUMSCAN_URL,
  SEND_MESSAGE_EVENT_SIG,
};
