import { MainLayout } from '@/components/layout/MainLayout'
import { HeroSection } from '@/components/features/HeroSection'
import { StatsSection } from '@/components/features/StatsSection'

export default function HomePage() {
    return (
        <MainLayout>
            <div className="flex flex-col">
                <HeroSection />
                <StatsSection />
            </div>
        </MainLayout>
    )
}