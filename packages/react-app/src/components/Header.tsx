import React, { useState } from 'react';
import styled from 'styled-components';
import * as PropTypes from 'prop-types';
import Blockie from './Blockie';
import { ellipseAddress, getChainData, showNotification } from '../helpers/utilities';
import { transitions } from '../styles';
import Button from './Button';
import { MINT_URL } from '../constants';

const SHeader = styled.div`
  margin-top: -1px;
  margin-bottom: 1px;
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const SActiveAccount = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  font-weight: 500;
`;

const SActiveChain = styled(SActiveAccount)`
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  & p {
    font-size: 0.8em;
    margin: 0;
    padding: 0;
  }
  & p:nth-child(2) {
    font-weight: bold;
  }
`;

const SBlockie = styled(Blockie)`
  margin-right: 10px;
`;

interface IHeaderStyle {
  connected: boolean;
}

const SAddress = styled.p<IHeaderStyle>`
  transition: ${transitions.base};
  font-weight: bold;
  margin: ${({ connected }) => (connected ? '-2px auto 0.7em' : '0')};
`;

const SDisconnect = styled.div<IHeaderStyle>`
  transition: ${transitions.button};
  font-size: 12px;
  font-family: monospace;
  position: absolute;
  right: 0;
  top: 20px;
  opacity: 0.7;
  cursor: pointer;

  opacity: ${({ connected }) => (connected ? 1 : 0)};
  visibility: ${({ connected }) => (connected ? 'visible' : 'hidden')};
  pointer-events: ${({ connected }) => (connected ? 'auto' : 'none')};

  &:hover {
    transform: translateY(-1px);
    opacity: 0.5;
  }
`;

interface IHeaderProps {
  killSession: () => void;
  connected: boolean;
  address: string;
  chainId: number;
}

const Header = (props: IHeaderProps) => {
  const { connected, address, chainId, killSession } = props;
  const chainData = chainId ? getChainData(chainId) : null;

  const [minting, setMinting] = useState(false);

  const onMint = () => {
    setMinting(true);
    const key = window.prompt('Please provide the Security Key...');
    const url = `${MINT_URL}?key=${key}&address=${address}`;
    fetch(url)
      .then(response => {
        if (response.status === 200) {
          showNotification('3 NFTs were successfully minted. Please reload the page to see them...');
        } else {
          showNotification('There was an error minting NFTs...');
        }
      })
      .catch(() => {
        showNotification('There was an error minting NFTs...');
      })
      .finally(() => setMinting(false));
  };

  return (
    <SHeader {...props}>
      {connected && chainData ? (
        <SActiveChain>
          <p>{`Connected to`}</p>
          <p>{chainData.name}</p>
        </SActiveChain>
      ) : (
        'Not Connected'
      )}
      {connected && chainData && chainData.network === 'goerli' && address && (
        <Button onClick={onMint} disabled={minting}>{'Mint me 3 NFTs'}</Button>
      )}
      {address && (
        <SActiveAccount>
          <SBlockie address={address} />
          <SAddress connected={connected}>{ellipseAddress(address)}</SAddress>
          <SDisconnect connected={connected} onClick={killSession}>
            {'Disconnect'}
          </SDisconnect>
        </SActiveAccount>
      )}
    </SHeader>
  );
};

Header.propTypes = {
  killSession: PropTypes.func.isRequired,
  address: PropTypes.string,
};

export default Header;
