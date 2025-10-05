"use client";

import { motion } from "framer-motion";
import { KeyRound, Shield, Users, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { MagneticCard } from "@/components/ui/magnetic-card";

const guardians = [
  {
    id: 1,
    name: "Alice Johnson",
    address: "0x1234...5678",
    verified: true,
    addedDate: "March 2024",
  },
  {
    id: 2,
    name: "Bob Smith",
    address: "0xabcd...efgh",
    verified: true,
    addedDate: "February 2024",
  },
  {
    id: 3,
    name: "Carol White",
    address: "0x9876...5432",
    verified: false,
    addedDate: "March 2024",
  },
];

export default function RecoveryPage() {
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const [recoveryThreshold, setRecoveryThreshold] = useState(2);

  return (
    <div className="min-h-screen pt-20 pb-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <KeyRound className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
            Account Recovery
          </h1>
          <p className="text-gray-400 text-lg">Manage your guardians and recovery settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recovery Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <MagneticCard>
              <div className="p-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl border border-white/10 h-full">
                <Shield className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-6">Recovery Settings</h3>

                {/* Recovery Threshold */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-3 block">
                    Recovery Threshold
                  </label>
                  <div className="space-y-3">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => setRecoveryThreshold(num)}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${
                          recoveryThreshold === num
                            ? "bg-purple-500/20 border-purple-500/50 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            Require {num} of {guardians.length} guardians
                          </span>
                          {recoveryThreshold === num && (
                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Recovery Active</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Your account is protected by {guardians.filter(g => g.verified).length} verified guardians
                  </p>
                </div>

                {/* Emergency Recovery */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  Initiate Recovery
                </motion.button>
              </div>
            </MagneticCard>
          </motion.div>

          {/* Guardians List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <MagneticCard>
              <div className="p-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Your Guardians</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddGuardian(!showAddGuardian)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Guardian
                  </motion.button>
                </div>

                {/* Add Guardian Form */}
                {showAddGuardian && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <input
                      type="text"
                      placeholder="Guardian Name"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none mb-3"
                    />
                    <input
                      type="text"
                      placeholder="Ethereum Address (0x...)"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none mb-3"
                    />
                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                        Add Guardian
                      </button>
                      <button
                        onClick={() => setShowAddGuardian(false)}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Guardians List */}
                <div className="space-y-4">
                  {guardians.map((guardian, index) => (
                    <motion.div
                      key={guardian.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">{guardian.name}</h4>
                            {guardian.verified && (
                              <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified
                              </div>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm font-mono">{guardian.address}</p>
                          <p className="text-gray-500 text-xs mt-1">Added {guardian.addedDate}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-blue-400 font-medium mb-1">How Recovery Works</h4>
                      <p className="text-gray-400 text-sm">
                        If you lose access to your account, your guardians can help you recover it. 
                        The number of guardians required is based on your recovery threshold setting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </MagneticCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
