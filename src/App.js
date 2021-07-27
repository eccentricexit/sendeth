import {
  Input,
  Button,
  Stack,
  Card,
  Flex,
  Autosuggest,
  Paragraph,
  Divider,
  Group,
} from 'bumbag'
import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { ethers } from 'ethers'

import { useWallet } from './hooks'

const ethToken = {
  address: '',
  chainId: 1,
  decimals: 18,
  logoURI: 'ipfs://QmbNx3LvKhXzLypCzZ5ez7u9TUVgmPdwQmV8FQbfjDJ3Uo',
  name: 'Ether',
  symbol: 'ETH',
  tags: [],
  isNativeCurrency: true,
}

const erc20Abi = [
  {
    constant: true,
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'dst', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const App = () => {
  const { account, onConnectWallet, active, chainId, library } = useWallet()
  const signer = useMemo(() => library?.getSigner(), [library])

  const [destinationAddress, setDestinationAddress] = useState('')
  const [selectedCoinOption, setSelectedCoinOption] = useState({ label: '' })
  const selectedCoin = useMemo(() => selectedCoinOption.value, [
    selectedCoinOption.value,
  ])

  const erc20 = useMemo(
    () =>
      account &&
      selectedCoin &&
      !selectedCoin.isNativeCurrency &&
      new ethers.Contract(selectedCoin.address, erc20Abi, signer),
    [account, selectedCoin, signer],
  )

  const onDestinationAddressReceived = useCallback((event) => {
    setDestinationAddress(event.target.value || '')
  }, [])

  const onSwitchToMainnet = useCallback(() => {
    library?.send('wallet_addEthereumChain', [
      {
        chainId: `0x${Number(1).toString(16)}`,
        nativeCurrency: 'ETH',
        chainName: 'mainnet',
        blockExplorerUrls: ['https://etherscan.io'],
      },
    ])
  }, [library])

  const [amount, setAmount] = useState('')
  const onAmountReceived = useCallback((event) => {
    setAmount(event.target.value || '')
  }, [])

  // Fetch token list.
  const [tokenList, setTokenList] = useState()
  const [fetchingTokenlist, setFetchingTokenlist] = useState(false)
  useEffect(() => {
    ;(async () => {
      if (tokenList) return

      try {
        setFetchingTokenlist(true)
        const receivedTokenList = await (
          await fetch('https://t2crtokens.eth.link')
        ).json()
        setTokenList([...receivedTokenList.tokens, ethToken])
      } catch (error) {
        console.error(error)
      } finally {
        setFetchingTokenlist(false)
      }
    })()
  }, [tokenList])

  // Fetch coin balance
  const [parsedBalance, setParsedBalance] = useState()
  useEffect(() => {
    ;(async () => {
      if (!selectedCoin) return
      if (!selectedCoin.isNativeCurrency && !erc20) return

      let balanceReceived
      if (selectedCoin.isNativeCurrency) {
        balanceReceived = await library.getBalance(account)
      } else {
        balanceReceived = await erc20.balanceOf(account)
      }

      setParsedBalance(
        ethers.utils.formatUnits(balanceReceived, selectedCoin.decimals),
      )
    })()
  }, [account, erc20, library, selectedCoin])
  const setMax = useCallback(() => {
    if (!parsedBalance) return
    setAmount(parsedBalance.toString())
  }, [parsedBalance])

  const onSend = useCallback(() => {
    try {
      if (
        !signer ||
        !account ||
        !chainId ||
        !library ||
        !destinationAddress ||
        !amount ||
        !selectedCoin
      )
        return

      if (selectedCoin.isNativeCurrency)
        signer.sendTransaction({
          to: destinationAddress,
          value: ethers.utils.parseEther(amount),
        })
      else
        erc20.transfer(
          destinationAddress,
          ethers.utils.parseUnits(amount, selectedCoin.decimals),
        )
    } catch (error) {
      console.error(
        `Failure!${error && error.message ? `\n\n${error.message}` : ''}`,
      )
    }
  }, [
    account,
    amount,
    chainId,
    destinationAddress,
    erc20,
    library,
    selectedCoin,
    signer,
  ])

  if (!chainId)
    return (
      <>
        <Button palette="primary" onClick={onConnectWallet}>
          Connect
        </Button>
      </>
    )

  if (chainId !== 1)
    return (
      <>
        <Paragraph style={{ marginBottom: '10px' }}>
          Unsupported Network
        </Paragraph>
        <Button palette="primary" onClick={onSwitchToMainnet}>
          Switch to Mainnet
        </Button>
      </>
    )

  return (
    <>
      <Divider style={{ marginBottom: '20px' }} />
      {tokenList && <Paragraph>Token List: {tokenList.name}</Paragraph>}
      <Autosuggest
        isLoading={fetchingTokenlist}
        onChange={setSelectedCoinOption}
        restrictToOptions
        options={
          tokenList
            ? tokenList.map((t, i) => ({
                key: i,
                label: `${t.symbol} - ${t.name}`,
                value: t,
              }))
            : [ethToken]
        }
        placeholder="Search for an eth currency..."
        value={selectedCoinOption}
        style={{ marginBottom: '20px' }}
      />
      <Card style={{ marginBottom: '20px' }}>
        <Stack>
          {parsedBalance && (
            <Paragraph>
              Balance: {Number(parsedBalance.toString()).toFixed(2)}
            </Paragraph>
          )}
          <Input
            placeholder="Destination address"
            onChange={onDestinationAddressReceived}
            value={destinationAddress}
          />
          <Group>
            <Input
              placeholder="Amount"
              onChange={onAmountReceived}
              value={amount}
              width="100%"
            />
            <Button onClick={setMax}>Max</Button>
          </Group>

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
      Source: https://github.com/mtsalenc/sendeth
    </>
  )
}

export default App
