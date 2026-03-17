"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section
            className="relative w-full overflow-hidden pb-10 pt-32 font-light text-white antialiased md:pb-16 md:pt-20"
            style={{
                background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
            }}
        >
            <div
                className="absolute right-0 top-0 h-1/2 w-1/2"
                style={{
                    background:
                        "radial-gradient(circle at 70% 30%, rgba(0, 212, 255, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
                }}
            />
            <div
                className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100"
                style={{
                    background:
                        "radial-gradient(circle at 70% 30%, rgba(156, 64, 255, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
                }}
            />

            <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <Badge
                        variant="secondary"
                        className="mb-6 backdrop-blur-sm bg-white/10 border border-[#00D4FF]/30 text-[#00D4FF] hover:bg-white/20 px-4 py-2 rounded-full"
                    >
                        ✨ NEXT GENERATION DIGITAL IDENTITY
                    </Badge>

                    <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
                        Own Your Identity with{" "}
                        <span className="bg-gradient-to-r from-[#00D4FF] to-[#9C40FF] bg-clip-text text-transparent">
                            Zero-Knowledge Privacy
                        </span>
                    </h1>

                    <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
                        A decentralized identity platform combining blockchain security with
                        zero-knowledge proofs to help you control your digital credentials with
                        privacy and ease.
                    </p>

                    <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/bc-cvs/student"
                            className="group relative w-full overflow-hidden rounded-full border border-[#00D4FF]/30 bg-gradient-to-b from-[#00D4FF]/20 to-[#9C40FF]/10 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#00D4FF]/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] sm:w-auto"
                        >
                            <span className="relative z-10">Create Identity</span>
                            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#00D4FF]/0 via-[#00D4FF]/20 to-[#00D4FF]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </Link>
                        <Link
                            href="#features"
                            className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
                        >
                            <span>Explore Features</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m6 9 6 6 6-6"></path>
                            </svg>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
