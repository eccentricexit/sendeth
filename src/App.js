import { Input, Button, Stack, Card, Flex, Alert, Text } from 'bumbag';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useDebounce, useWallet } from './hooks';
import { UnsupportedChainIdError } from '@web3-react/core';

const App = () => {
  const {
    account,
    onConnectWallet,
    active,
    chainId,
    library,
    error: walletError,
  } = useWallet();
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    if (walletError) setError(walletError);
    if (!walletError && error && error instanceof UnsupportedChainIdError)
      setError(undefined);
  }, [error, walletError]);

  const signer = useMemo(() => library?.getSigner(), [library]);

  const [destinationAddress, setDestinationAddress] = useState('');
  const onDestinationAddressReceived = useCallback((event) => {
    setDestinationAddress(event.target.value || '');
  }, []);

  const [amount, setAmount] = useState('');
  const onAmountReceived = useCallback((event) => {
    setAmount(event.target.value || '');
  }, []);

  const onSend = useCallback(() => {
    try {
      if (
        !signer ||
        !account ||
        !chainId ||
        !library ||
        !destinationAddress ||
        !amount
      )
        return;

      signer.sendTransaction({
        to: destinationAddress,
        value: ethers.utils.parseEther(amount)
      })

    } catch (error) {
      console.error(
        `Failure!${error && error.message ? `\n\n${error.message}` : ''}`
      );
    }
  }, [account, amount, chainId, destinationAddress, library, signer]);

  return (
    <Flex alignX="center" flexDirection="column">
      <Text>Send ETH</Text>
      <Card>
        <Stack>
          <Input
            placeholder="Destination address"
            onChange={onDestinationAddressReceived}
            value={destinationAddress}
          />
          <Input
            placeholder="Amount"
            onChange={onAmountReceived}
            value={amount}
          />
          <Flex alignX="right">
            {active && library && account ? (
              <Button palette="primary" onClick={onSend}>
                Send
              </Button>
            ) : (
              <Button palette="primary" onClick={onConnectWallet}>
                Connect
              </Button>
            )}
          </Flex>
        </Stack>
      </Card>
    </Flex>
  );
};

export default App;
