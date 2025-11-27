"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <div className="text-sm">
          <p className="font-semibold">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <p className="text-xs text-muted-foreground">
            {chain?.name || "Unknown Network"}
          </p>
        </div>
        <Button onClick={() => disconnect()} variant="destructive" size="sm">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          variant="outline"
          className="w-full"
        >
          Connect {connector.name}
        </Button>
      ))}
    </div>
  );
}
