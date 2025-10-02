import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-10 w-10" />
            </div>
            <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Manage your decentralized identity with confidence
                </h1>
                <p className="text-lg text-muted-foreground">
                    Register identities, visualize trust scores, issue verifications, and generate privacy-preserving
                    zero-knowledge proofs in a single unified dashboard.
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/dashboard" className={buttonVariants({ size: 'lg' })}>
                    Go to dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/verifications" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                    Manage verifications
                </Link>
            </div>
        </div>
    );
}
