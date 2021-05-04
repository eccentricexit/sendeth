import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { ethers } from 'ethers';
import useEagerConnect from './eager-connect';
import useInactiveListener from './inactive-listener';
import { injected } from '../connectors';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';

enum ConnectorNames {
  Injected = 'Injected',
}

const connectorsByName: {
  [connectorName in ConnectorNames]: AbstractConnector;
} = {
  [ConnectorNames.Injected]: injected,
};

interface Properties extends Web3ReactContextInterface {
  onConnectWallet: () => void;
  library?: ethers.providers.JsonRpcProvider;
}

// Requires web3-react in the context.
const useWallet = (): Properties => {
  const web3ReactContext = useWeb3React();
  const { activate, connector } = web3ReactContext;
  const library: ethers.providers.JsonRpcProvider = web3ReactContext.library;

  // Handle logic to recognize the connector currently being activated.
  const [activatingConnector, setActivatingConnector] = useState<unknown>();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector)
      setActivatingConnector(undefined);
  }, [activatingConnector, connector]);

  // Handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already.
  const triedEager = useEagerConnect();

  // Handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists.
  useInactiveListener(!triedEager || !!activatingConnector);

  const onConnectWallet = useCallback(() => {
    setActivatingConnector(connectorsByName[ConnectorNames.Injected]);
    activate(connectorsByName[ConnectorNames.Injected]);
  }, [activate]);

  return {
    ...web3ReactContext,
    onConnectWallet,
    library,
  };
};

export default useWallet;
