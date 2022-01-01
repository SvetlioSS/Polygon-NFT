export * from './contracts';
export { default as TOKEN_ABI } from './abis/FxLimeGameItem.json';
export { default as ROOT_TUNNEL_ABI } from './abis/RootTunnel.json';
export { default as CHILD_TUNNEL_ABI } from './abis/ChildTunnel.json';

const PROOF_API = 'https://apis.matic.network/';
const IPFS_GATEWAY = 'https://dweb.link/ipfs/';
const GOERLI_RPC_URL = 'https://eth-goerli.alchemyapi.io/v2/kbgkxIOiGn6EE2p5JKCDUQ6XIuZ0S3Gb';
const MUMBAI_RPC_URL = 'https://polygon-mumbai.g.alchemy.com/v2/W6txy-iufqn51fzpLTwAw3fzd2l5J6i4';

export { PROOF_API, IPFS_GATEWAY, GOERLI_RPC_URL, MUMBAI_RPC_URL };