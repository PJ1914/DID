"use client";

import { motion } from "framer-motion";
import { Building2, Plus, Users, Award, ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { MagneticCard } from "@/components/ui/magnetic-card";

const organizations = [
  {
    id: 1,
    name: "Tech University",
    type: "Educational",
    members: 15420,
    certificates: 3240,
    verified: true,
    color: "#A78BFA",
  },
  {
    id: 2,
    name: "Global Health Initiative",
    type: "Healthcare",
    members: 8930,
    certificates: 1850,
    verified: true,
    color: "#EC4899",
  },
  {
    id: 3,
    name: "Finance Corp",
    type: "Financial",
    members: 5670,
    certificates: 980,
    verified: true,
    color: "#8B5CF6",
  },
  {
    id: 4,
    name: "Skill Academy",
    type: "Training",
    members: 12340,
    certificates: 5670,
    verified: false,
    color: "#D946EF",
  },
];

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Building2 className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
            Organizations
          </h1>
          <p className="text-gray-400 text-lg">Browse and manage organization memberships</p>
        </motion.div>

        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            Create Organization
          </motion.button>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrgs.map((org, index) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MagneticCard>
                <div className="p-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-colors">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${org.color}20, ${org.color}10)`,
                          border: `1px solid ${org.color}40`,
                        }}
                      >
                        <Building2 className="w-6 h-6" style={{ color: org.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-white">{org.name}</h3>
                          {org.verified && (
                            <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs">
                              Verified
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{org.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Members
                      </div>
                      <p className="text-white font-bold text-lg">{org.members.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Award className="w-4 h-4" />
                        Certificates
                      </div>
                      <p className="text-white font-bold text-lg">{org.certificates.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm font-medium"
                    >
                      Join Organization
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  </div>
                </div>
              </MagneticCard>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrgs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No organizations found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
