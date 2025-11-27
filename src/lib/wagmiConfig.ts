"use client";

import { http, createConfig } from "wagmi";
import { base, mainnet, polygon, arbitrum, optimism } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [base, mainnet, polygon, arbitrum, optimism],
  connectors: [injected(), metaMask()],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});
