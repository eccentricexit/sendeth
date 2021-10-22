import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Flex, Provider as BumbagProvider, Heading } from "bumbag";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

const getLibrary = (provider) => {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
};

ReactDOM.render(
  <React.StrictMode>
    <BumbagProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Flex
          alignX="center"
          flexDirection="column"
          style={{
            margin: "40px auto",
            maxWidth: "500px",
          }}
        >
          <Heading style={{ marginBottom: "30px" }}>Crypto Send</Heading>
          <App />
        </Flex>
      </Web3ReactProvider>
    </BumbagProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
