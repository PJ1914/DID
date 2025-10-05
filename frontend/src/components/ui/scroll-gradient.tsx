'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface ScrollGradientProps {
    children: ReactNode
}

export function ScrollGradient({ children }: ScrollGradientProps) {
    const { scrollYProgress } = useScroll()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']) // Reduced from 50%
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.9, 0.8]) // More subtle
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]) // Reduced from 1.1

    // Prevent hydration mismatch - render without transforms on server
    if (!mounted) {
        return <div>{children}</div>
    }

    return (
        <motion.div
            style={{ y, opacity, scale }}
            className="will-change-transform"
        >
            {children}
        </motion.div>
    )
}
