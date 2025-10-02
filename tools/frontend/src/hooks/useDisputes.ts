export const useDisputes = () => ({
    disputes: [] as never[],
    isLoading: false,
    refetch: async () => ({ data: [] as never[] }),
    fileDispute: async () => {
        throw new Error('Dispute resolution module has been removed.');
    },
    resolveDispute: async () => {
        throw new Error('Dispute resolution module has been removed.');
    }
});
