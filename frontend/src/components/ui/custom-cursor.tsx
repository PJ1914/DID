'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false)
    const [isClicking, setIsClicking] = useState(false)
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 700 }
    const cursorXSpring = useSpring(cursorX, springConfig)
    const cursorYSpring = useSpring(cursorY, springConfig)

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16)
            cursorY.set(e.clientY - 16)
        }

        const handleMouseDown = () => setIsClicking(true)
        const handleMouseUp = () => setIsClicking(false)

        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer')
            ) {
                setIsHovering(true)
            }
        }

        const handleMouseLeave = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer')
            ) {
                setIsHovering(false)
            }
        }

        window.addEventListener('mousemove', moveCursor)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        // Add hover detection
        document.addEventListener('mouseover', handleMouseEnter)
        document.addEventListener('mouseout', handleMouseLeave)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mouseover', handleMouseEnter)
            document.removeEventListener('mouseout', handleMouseLeave)
        }
    }, [cursorX, cursorY])

    return (
        <>
            {/* Main Cursor */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden md:block"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                }}
            >
                <motion.div
                    className="w-full h-full rounded-full border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-sm"
                    animate={{
                        scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
                        borderColor: isHovering ? '#EC4899' : '#8B5CF6',
                        backgroundColor: isHovering ? 'rgba(236, 72, 153, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                    }}
                    transition={{ duration: 0.15 }}
                />
            </motion.div>

            {/* Cursor Glow Trail */}
            <motion.div
                className="fixed top-0 left-0 w-16 h-16 pointer-events-none z-[9998] hidden md:block"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: -8,
                    translateY: -8,
                }}
            >
                <motion.div
                    className="w-full h-full rounded-full opacity-30 blur-xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: isClicking ? 0.5 : isHovering ? 1.2 : 0.8,
                        opacity: isHovering ? 0.5 : 0.3,
                    }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>

            {/* Dot Center */}
            <motion.div
                className="fixed top-0 left-0 w-1 h-1 pointer-events-none z-[10000] hidden md:block"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: 15,
                    translateY: 15,
                }}
            >
                <motion.div
                    className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    animate={{
                        scale: isClicking ? 0 : 1,
                    }}
                    transition={{ duration: 0.1 }}
                />
            </motion.div>
        </>
    )
}
