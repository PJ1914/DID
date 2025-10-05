"use client";

import { motion } from "framer-motion";
import { Award, Download, Share2, Eye, Plus, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { MagneticCard } from "@/components/ui/magnetic-card";

const certificates = [
  {
    id: 1,
    title: "Blockchain Development Certificate",
    issuer: "Tech University",
    issueDate: "March 2024",
    verified: true,
    color: "#A78BFA",
    type: "Education",
  },
  {
    id: 2,
    title: "Advanced Smart Contracts",
    issuer: "Skill Academy",
    issueDate: "February 2024",
    verified: true,
    color: "#EC4899",
    type: "Professional",
  },
  {
    id: 3,
    title: "Web3 Security Specialist",
    issuer: "Global Security Institute",
    issueDate: "January 2024",
    verified: true,
    color: "#8B5CF6",
    type: "Certification",
  },
];

export default function CertificatesPage() {
  const [selectedCert, setSelectedCert] = useState<number | null>(null);

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
              <Award className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
            Your Certificates
          </h1>
          <p className="text-gray-400 text-lg">View and manage your verified certificates</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Certificates", value: certificates.length, icon: Award },
            { label: "Verified", value: certificates.filter(c => c.verified).length, icon: CheckCircle2 },
            { label: "Shared", value: "12", icon: Share2 },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MagneticCard>
                  <div className="p-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl border border-white/10">
                    <Icon className="w-8 h-8 text-purple-400 mb-3" />
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </MagneticCard>
              </motion.div>
            );
          })}
        </div>

        {/* Add Certificate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 rounded-3xl border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-colors backdrop-blur-xl bg-white/5 flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6 text-purple-400" />
            <span className="text-white font-medium">Request New Certificate</span>
          </motion.button>
        </motion.div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <MagneticCard>
                <div
                  className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                    selectedCert === cert.id
                      ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50"
                      : "backdrop-blur-xl bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                  onClick={() => setSelectedCert(cert.id)}
                >
                  {/* Certificate Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${cert.color}20, ${cert.color}10)`,
                        border: `1px solid ${cert.color}40`,
                      }}
                    >
                      <Award className="w-6 h-6" style={{ color: cert.color }} />
                    </div>
                    {cert.verified && (
                      <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Certificate Details */}
                  <h3 className="text-xl font-bold text-white mb-2">{cert.title}</h3>
                  <p className="text-gray-400 mb-1">Issued by {cert.issuer}</p>
                  <p className="text-gray-500 text-sm mb-4">{cert.issueDate}</p>

                  <div className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-purple-400 text-xs mb-6">
                    {cert.type}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-gray-400">View</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 transition-colors"
                    >
                      <Download className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-gray-400">Download</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-gray-400">Share</span>
                    </motion.button>
                  </div>
                </div>
              </MagneticCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
