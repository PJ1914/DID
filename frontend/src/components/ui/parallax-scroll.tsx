'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface ParallaxScrollProps {
    children: ReactNode
    className?: string
    speed?: number
}

export function ParallaxScroll({
    children,
    className = '',
    speed = 0.5,
}: ParallaxScrollProps) {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed])

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    )
}
