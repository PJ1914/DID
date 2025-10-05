"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, ChevronDown, LogOut, Copy, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ConnectWallet() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [showDropdown, setShowDropdown] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <div className="relative" suppressHydrationWarning>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white font-medium transition-all flex items-center gap-2"
                >
                    <Wallet className="w-4 h-4" />
                    {formatAddress(address)}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-56 bg-[#0A0B0D]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                            suppressHydrationWarning
                        >
                            <div className="p-3 border-b border-white/10">
                                <div className="text-xs text-white/60 mb-1">Connected Address</div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white font-mono">{formatAddress(address)}</span>
                                    <button
                                        onClick={copyAddress}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        {copied ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-white/60" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    disconnect();
                                    setShowDropdown(false);
                                }}
                                className="w-full p-3 flex items-center gap-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Disconnect
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative" suppressHydrationWarning>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
                <Wallet className="w-4 h-4" />
                Connect Wallet
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-[#0A0B0D]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                        suppressHydrationWarning
                    >
                        <div className="p-3 border-b border-white/10">
                            <div className="text-sm font-medium text-white">Select Wallet</div>
                        </div>
                        <div className="p-2">
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => {
                                        connect({ connector });
                                        setShowDropdown(false);
                                    }}
                                    className="w-full p-3 flex items-center gap-3 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Wallet className="w-5 h-5" />
                                    {connector.name}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
