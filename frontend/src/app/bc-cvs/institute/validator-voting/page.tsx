"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Vote, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ValidatorConsensusABI } from "@/contracts/abis/bc-cvs"
import { getContractAddress } from "@/contracts/addresses"
import {
  saveProposal,
  updateProposalVote,
  getProposalsByStatus,
  hasVoted as checkHasVoted,
} from "@/lib/proposalStorage"

export default function ValidatorVotingPage() {
  const { address, isConnected, chain } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const [activeProposals, setActiveProposals] = useState<any[]>([])
  const [executedProposals, setExecutedProposals] = useState<any[]>([])
  const [rejectedProposals, setRejectedProposals] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const [newProposal, setNewProposal] = useState({
    institutionAddress: "",
    name: "",
    documentHash: "",
  })

  const isSupportedChain = chain?.id === 11155111 || chain?.id === 31337 || chain?.id === 1337
  const consensusAddress = isSupportedChain && chain?.id
    ? getContractAddress(chain.id as 11155111 | 31337 | 1337, "validatorConsensus")
    : "0x0000000000000000000000000000000000000000"

  // Read proposal count
  const { data: proposalCount } = useReadContract({
    address: consensusAddress,
    abi: ValidatorConsensusABI,
    functionName: "getProposalCount",
  })

  // Read validator count for consensus calculation
  const { data: validatorCount } = useReadContract({
    address: consensusAddress,
    abi: ValidatorConsensusABI,
    functionName: "getValidatorCount",
  })

  // Load proposals from localStorage
  useEffect(() => {
    setActiveProposals(getProposalsByStatus("active"))
    setExecutedProposals(getProposalsByStatus("executed"))
    setRejectedProposals(getProposalsByStatus("rejected"))
  }, [isSuccess])

  // Save proposal when successfully submitted
  useEffect(() => {
    if (isSuccess && newProposal.name && proposalCount) {
      const proposalId = Number(proposalCount) - 1 // Latest proposal ID
      saveProposal({
        proposalId,
        institutionName: newProposal.name,
        institutionAddress: newProposal.institutionAddress,
        proposer: address || "",
        documentHash: newProposal.documentHash,
        approvalCount: 0,
        totalValidators: Number(validatorCount || 3),
        proposedAt: new Date().toISOString(),
        status: "active",
      })

      // Reload proposals
      setActiveProposals(getProposalsByStatus("active"))
      
      // Close dialog and reset form
      setDialogOpen(false)
      setNewProposal({ institutionAddress: "", name: "", documentHash: "" })
    }
  }, [isSuccess, newProposal, proposalCount, address, validatorCount])

  // Read validator status (moved after validatorCount)
  const { data: isValidator } = useReadContract({
    address: consensusAddress,
    abi: ValidatorConsensusABI,
    functionName: "isValidator",
    args: address ? [address] : undefined,
  })

  const handleProposeInstitution = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address || !chain?.id) {
      alert("Please connect your wallet")
      return
    }

    try {
      writeContract({
        address: consensusAddress,
        abi: ValidatorConsensusABI,
        functionName: "proposeInstitution",
        args: [
          newProposal.institutionAddress as `0x${string}`,
          newProposal.name,
          newProposal.documentHash as `0x${string}`,
        ],
      })
    } catch (err) {
      console.error("Error proposing institution:", err)
    }
  }

  const handleVote = async (proposalId: number) => {
    if (!address || !chain?.id) {
      alert("Please connect your wallet")
      return
    }

    try {
      writeContract({
        address: consensusAddress,
        abi: ValidatorConsensusABI,
        functionName: "voteForInstitution",
        args: [BigInt(proposalId)],
      })

      // Update proposal vote in localStorage
      updateProposalVote(proposalId, address)
      
      // Reload proposals
      setActiveProposals(getProposalsByStatus("active"))
      setExecutedProposals(getProposalsByStatus("executed"))
    } catch (err) {
      console.error("Error voting:", err)
    }
  }

  if (!isConnected) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to access validator voting.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Note: Blockchain features require Sepolia or Localhost network
  // For now, pages are accessible regardless of network

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Validator Voting
              </h1>
              <p className="text-muted-foreground">
                Vote on institutional onboarding proposals (Requires 100% unanimous approval)
              </p>
            </div>

            {/* Propose New Institution Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Propose Institution
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Propose New Institution</DialogTitle>
                  <DialogDescription>
                    Submit a proposal to onboard a new institution to the network
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProposeInstitution} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution-address">Institution Wallet Address</Label>
                    <Input
                      id="institution-address"
                      placeholder="0x..."
                      value={newProposal.institutionAddress}
                      onChange={(e) =>
                        setNewProposal({ ...newProposal, institutionAddress: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution-name">Institution Name</Label>
                    <Input
                      id="institution-name"
                      placeholder="Harvard University"
                      value={newProposal.name}
                      onChange={(e) =>
                        setNewProposal({ ...newProposal, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document-hash">Document Hash (Verification Documents)</Label>
                    <Input
                      id="document-hash"
                      placeholder="0x..."
                      value={newProposal.documentHash}
                      onChange={(e) =>
                        setNewProposal({ ...newProposal, documentHash: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Hash of supporting documentation (accreditation certificates, licenses, etc.)
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isPending || isConfirming}>
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isPending ? "Preparing..." : "Confirming..."}
                      </>
                    ) : (
                      "Submit Proposal"
                    )}
                  </Button>

                  {isSuccess && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Proposal submitted successfully! Validators can now vote.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Validator Status */}
          <Card className="mb-8">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Vote className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Validator Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isValidator
                      ? "You are an authorized validator"
                      : "You are not a validator"}
                  </p>
                </div>
              </div>
              {isValidator ? (
                <Badge variant="default">Active Validator</Badge>
              ) : (
                <Badge variant="secondary">Observer</Badge>
              )}
            </CardContent>
          </Card>

          {/* Proposals Tabs */}
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active Proposals ({proposalCount ? Number(proposalCount) : 0})
              </TabsTrigger>
              <TabsTrigger value="executed">Executed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeProposals.length === 0 && Number(proposalCount || 0) === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>No Proposals Yet:</strong> Create a new proposal to onboard an institution. 
                    Proposals you create will be stored and displayed here.
                  </AlertDescription>
                </Alert>
              )}

              {activeProposals.length > 0 && (
                <Alert variant="default">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Live Data:</strong> Showing {activeProposals.length} active proposal{activeProposals.length !== 1 ? "s" : ""}. 
                    Proposals are stored locally and synced with blockchain votes.
                  </AlertDescription>
                </Alert>
              )}

              {/* Dynamic Proposals from localStorage */}
              {activeProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.proposalId}
                  proposalId={proposal.proposalId}
                  institutionName={proposal.institutionName}
                  institutionAddress={proposal.institutionAddress}
                  proposer={proposal.proposer}
                  approvalCount={proposal.approvalCount}
                  totalValidators={proposal.totalValidators}
                  proposedAt={proposal.proposedAt}
                  canVote={Boolean(isValidator)}
                  hasVoted={checkHasVoted(proposal.proposalId, address || "")}
                  onVote={handleVote}
                />
              ))}

              {Number(proposalCount || 0) === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No active proposals. Create a new proposal to onboard an institution.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="executed" className="space-y-4">
              {executedProposals.length > 0 ? (
                executedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.proposalId}
                    proposalId={proposal.proposalId}
                    institutionName={proposal.institutionName}
                    institutionAddress={proposal.institutionAddress}
                    proposer={proposal.proposer}
                    approvalCount={proposal.approvalCount}
                    totalValidators={proposal.totalValidators}
                    proposedAt={proposal.proposedAt}
                    canVote={false}
                    hasVoted={true}
                    onVote={handleVote}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No executed proposals yet.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedProposals.length > 0 ? (
                rejectedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.proposalId}
                    proposalId={proposal.proposalId}
                    institutionName={proposal.institutionName}
                    institutionAddress={proposal.institutionAddress}
                    proposer={proposal.proposer}
                    approvalCount={proposal.approvalCount}
                    totalValidators={proposal.totalValidators}
                    proposedAt={proposal.proposedAt}
                    canVote={false}
                    hasVoted={false}
                    onVote={handleVote}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No rejected proposals.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Voting Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>1. Proposal:</strong> Anyone can propose a new institution for onboarding
              </p>
              <p>
                <strong>2. Voting:</strong> Only authorized validators can vote on proposals
              </p>
              <p>
                <strong>3. Consensus:</strong> Requires 100% unanimous approval from all validators
              </p>
              <p>
                <strong>4. Execution:</strong> Proposal auto-executes when final vote is cast
              </p>
              <p className="text-xs mt-4">
                ⚠️ This ensures maximum security against Sybil attacks and fraudulent institutions
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Proposal Card Component
function ProposalCard({
  proposalId,
  institutionName,
  institutionAddress,
  proposer,
  approvalCount,
  totalValidators,
  proposedAt,
  canVote,
  hasVoted,
  onVote,
}: {
  proposalId: number
  institutionName: string
  institutionAddress: string
  proposer: string
  approvalCount: number
  totalValidators: number
  proposedAt: string
  canVote: boolean
  hasVoted: boolean
  onVote: (proposalId: number) => void
}) {
  const percentage = (approvalCount / totalValidators) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{institutionName}</CardTitle>
            <CardDescription className="mt-1">
              Proposed by: <code className="text-xs">{proposer}</code>
            </CardDescription>
            <CardDescription>
              Institution: <code className="text-xs">{institutionAddress}</code>
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(proposedAt).toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Approval Progress</span>
            <span className="font-semibold">
              {approvalCount}/{totalValidators} votes ({percentage.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Vote Button */}
        <div className="flex items-center gap-3">
          <Button
            className="flex-1"
            onClick={() => onVote(proposalId)}
            disabled={!canVote || hasVoted}
          >
            {hasVoted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Voted
              </>
            ) : (
              <>
                <Vote className="w-4 h-4 mr-2" />
                Cast Vote (Approve)
              </>
            )}
          </Button>

          {percentage === 100 && (
            <Badge variant="default" className="whitespace-nowrap">
              ✓ Unanimous
            </Badge>
          )}
        </div>

        {!canVote && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Only authorized validators can vote on proposals
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
