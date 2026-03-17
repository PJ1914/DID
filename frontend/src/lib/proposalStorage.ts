// Proposal Storage for Validator Voting
// Stores proposals in localStorage for dynamic display

export interface StoredProposal {
  proposalId: number
  institutionName: string
  institutionAddress: string
  proposer: string
  documentHash: string
  approvalCount: number
  totalValidators: number
  proposedAt: string
  status: "active" | "executed" | "rejected"
  votedBy: string[] // Addresses of validators who voted
}

const STORAGE_KEY = "bc-cvs-proposals"

export function saveProposal(proposal: Omit<StoredProposal, "votedBy">) {
  try {
    const proposals = getAllProposals()
    
    // Check if proposal already exists
    const existingIndex = proposals.findIndex(p => p.proposalId === proposal.proposalId)
    
    const newProposal: StoredProposal = {
      ...proposal,
      votedBy: [],
    }
    
    if (existingIndex >= 0) {
      // Update existing proposal
      proposals[existingIndex] = { ...proposals[existingIndex], ...newProposal }
    } else {
      // Add new proposal
      proposals.push(newProposal)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals))
  } catch (error) {
    console.error("Error saving proposal:", error)
  }
}

export function updateProposalVote(proposalId: number, voterAddress: string) {
  try {
    const proposals = getAllProposals()
    const proposal = proposals.find(p => p.proposalId === proposalId)
    
    if (proposal && !proposal.votedBy.includes(voterAddress)) {
      proposal.votedBy.push(voterAddress)
      proposal.approvalCount = proposal.votedBy.length
      
      // Check if proposal should be executed (100% consensus)
      if (proposal.approvalCount >= proposal.totalValidators) {
        proposal.status = "executed"
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals))
    }
  } catch (error) {
    console.error("Error updating proposal vote:", error)
  }
}

export function getAllProposals(): StoredProposal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const proposals = JSON.parse(stored) as StoredProposal[]
    return Array.isArray(proposals) ? proposals : []
  } catch (error) {
    console.error("Error getting proposals:", error)
    return []
  }
}

export function getProposalsByStatus(status: "active" | "executed" | "rejected"): StoredProposal[] {
  const proposals = getAllProposals()
  return proposals.filter(p => p.status === status)
}

export function getProposal(proposalId: number): StoredProposal | undefined {
  const proposals = getAllProposals()
  return proposals.find(p => p.proposalId === proposalId)
}

export function hasVoted(proposalId: number, voterAddress: string): boolean {
  const proposal = getProposal(proposalId)
  return proposal ? proposal.votedBy.includes(voterAddress) : false
}

export function getProposalStats() {
  const proposals = getAllProposals()
  return {
    total: proposals.length,
    active: proposals.filter(p => p.status === "active").length,
    executed: proposals.filter(p => p.status === "executed").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
  }
}

export function clearProposals() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing proposals:", error)
  }
}
