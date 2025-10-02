import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IdentityProfile, IdentityStatus, IdentityActivity } from '@/types/identity';

interface IdentityState {
    identity?: IdentityProfile;
    activities: IdentityActivity[];
    setIdentity: (identity?: IdentityProfile) => void;
    addActivity: (activity: IdentityActivity) => void;
    reset: () => void;
}

export const useIdentityStore = create<IdentityState>()(
    persist(
        (set) => ({
            identity: undefined,
            activities: [],
            setIdentity: (identity) => set({ identity }),
            addActivity: (activity) =>
                set((state) => ({
                    activities: [activity, ...state.activities].slice(0, 25)
                })),
            reset: () => set({ identity: undefined, activities: [] })
        }),
        {
            name: 'did-identity-store'
        }
    )
);

export const identityStatusOptions: { label: string; value: IdentityStatus }[] = [
    { label: 'Pending', value: IdentityStatus.Pending },
    { label: 'Active', value: IdentityStatus.Active },
    { label: 'Suspended', value: IdentityStatus.Suspended },
    { label: 'Revoked', value: IdentityStatus.Revoked }
];
