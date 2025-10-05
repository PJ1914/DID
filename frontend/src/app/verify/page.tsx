"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Upload, Camera, FileText, DollarSign, Fingerprint, Scan } from "lucide-react";
import { useState } from "react";
import { MagneticCard } from "@/components/ui/magnetic-card";

const verificationTypes = [
  {
    id: "identity",
    icon: Fingerprint,
    title: "Identity Verification",
    description: "Verify with government ID",
    color: "#A78BFA",
  },
  {
    id: "face",
    icon: Camera,
    title: "Face Verification",
    description: "Biometric face scan",
    color: "#EC4899",
  },
  {
    id: "income",
    icon: DollarSign,
    title: "Income Verification",
    description: "Proof of income documents",
    color: "#8B5CF6",
  },
  {
    id: "document",
    icon: FileText,
    title: "Document Verification",
    description: "Additional documents",
    color: "#D946EF",
  },
];

export default function VerifyPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => setUploading(false), 2000);
  };

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
              <CheckCircle2 className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
            Verification Center
          </h1>
          <p className="text-gray-400 text-lg">Verify your identity with multiple verification methods</p>
        </motion.div>

        {/* Verification Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {verificationTypes.map((type, index) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MagneticCard>
                  <motion.button
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full p-6 rounded-3xl border transition-all text-left ${
                      isSelected
                        ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50"
                        : "backdrop-blur-xl bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${type.color}20, ${type.color}10)`,
                          border: `1px solid ${type.color}40`,
                        }}
                      >
                        <Icon className="w-6 h-6" style={{ color: type.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                        <p className="text-gray-400">{type.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                  </motion.button>
                </MagneticCard>
              </motion.div>
            );
          })}
        </div>

        {/* Upload Section */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MagneticCard>
              <div className="p-8 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Upload Documents</h2>
                
                {/* Upload Area */}
                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">Drop files here or click to upload</p>
                    <p className="text-gray-400 text-sm">Support for PDF, JPG, PNG (Max 10MB)</p>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                </label>

                {uploading && (
                  <div className="mt-6">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                    <p className="text-center text-gray-400 mt-2">Uploading...</p>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium text-lg"
                >
                  Submit for Verification
                </motion.button>

                {/* QR Code Option */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="text-center">
                    <Scan className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-2">Offline Verification</h3>
                    <p className="text-gray-400 mb-4">Scan QR code for offline verification</p>
                    <button className="px-6 py-2 rounded-xl border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-colors">
                      Generate QR Code
                    </button>
                  </div>
                </div>
              </div>
            </MagneticCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
