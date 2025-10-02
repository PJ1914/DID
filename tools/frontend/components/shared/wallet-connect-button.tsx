"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnectButton() {
    return <ConnectButton accountStatus={{ smallScreen: 'avatar', largeScreen: 'address' }} chainStatus="icon" />;
}
