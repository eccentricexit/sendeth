import { Input, Button, Stack, Card, Flex, Text } from 'bumbag';
import React, { useCallback, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './hooks';

const App = () => {
  const {
    account,
    onConnectWallet,
    active,
    chainId,
    library,
  } = useWallet();
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
            {console.info(active, library, account)}
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
      Source: https://github.com/mtsalenc/sendeth
    </Flex>
  );
};

export default App;
