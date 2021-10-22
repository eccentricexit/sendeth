import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import useEagerConnect from "./eager-connect";
import useInactiveListener from "./inactive-listener";
import { injected } from "../connectors";

// Requires web3-react in the context.
const useWallet = () => {
  const web3ReactContext = useWeb3React();
  const { activate, connector } = web3ReactContext;
  const library = web3ReactContext.library;

  // Handle logic to recognize the connector currently being activated.
  const [activatingConnector, setActivatingConnector] = useState();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector)
      setActivatingConnector(undefined);
  }, [activatingConnector, connector]);

  // Handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already.
  const triedEager = useEagerConnect();

  // Handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists.
  useInactiveListener(!triedEager || !!activatingConnector);

  const onConnectWallet = useCallback(() => {
    setActivatingConnector(injected);
    activate(injected);
  }, [activate]);

  return {
    ...web3ReactContext,
    onConnectWallet,
    library,
  };
};

export default useWallet;
