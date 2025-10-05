'use client'

import { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { FloatingSidebar } from './FloatingSidebar'
import { Footer } from './Footer'

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-navy-950">
            <Navbar />
            <div className="flex">
                <FloatingSidebar />
                <main className="flex-1 min-h-screen md:ml-[60px]">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    )
}