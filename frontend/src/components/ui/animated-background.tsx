"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-20 bg-[#0A0B0D]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0613] via-[#0A0B0D] to-[#150d27]" />
      </div>
    );
  }

  return (
    <>
      {/* Animated Gradient Video Background */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        {/* Deep base */}
        <div className="absolute inset-0 bg-[#0a0613]" />
        
        {/* Animated gradient orbs - smooth and aesthetic */}
        <div className="absolute inset-0">
          {/* Purple orb - diagonal movement */}
          <div 
            className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, rgba(126, 34, 206, 0.3) 50%, transparent 100%)',
              animation: 'float1 25s ease-in-out infinite',
              top: '-10%',
              left: '-10%',
            }}
          />
          
          {/* Pink orb - opposite diagonal */}
          <div 
            className="absolute w-[700px] h-[700px] rounded-full opacity-30 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(219, 39, 119, 0.3) 50%, transparent 100%)',
              animation: 'float2 28s ease-in-out infinite',
              bottom: '-10%',
              right: '-10%',
            }}
          />
          
          {/* Violet orb - circular movement */}
          <div 
            className="absolute w-[900px] h-[900px] rounded-full opacity-25 blur-[140px]"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(124, 58, 237, 0.2) 50%, transparent 100%)',
              animation: 'float3 30s ease-in-out infinite',
              top: '30%',
              left: '30%',
            }}
          />
          
          {/* Fuchsia orb - vertical movement */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(217, 70, 239, 0.5) 0%, rgba(192, 38, 211, 0.2) 50%, transparent 100%)',
              animation: 'float4 22s ease-in-out infinite',
              top: '50%',
              right: '20%',
            }}
          />
          
          {/* Cyan accent orb - horizontal movement */}
          <div 
            className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[90px]"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(8, 145, 178, 0.2) 50%, transparent 100%)',
              animation: 'float5 20s ease-in-out infinite',
              bottom: '20%',
              left: '40%',
            }}
          />
        </div>
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-transparent to-pink-950/30" />
        
        {/* Fine grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
          }
          33% { 
            transform: translate(30%, 40%) scale(1.1);
          }
          66% { 
            transform: translate(-20%, 30%) scale(0.95);
          }
        }
        
        @keyframes float2 {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
          }
          33% { 
            transform: translate(-30%, -30%) scale(1.15);
          }
          66% { 
            transform: translate(20%, -40%) scale(0.9);
          }
        }
        
        @keyframes float3 {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          50% { 
            transform: translate(25%, 25%) rotate(180deg) scale(1.1);
          }
        }
        
        @keyframes float4 {
          0%, 100% { 
            transform: translateY(0) scale(1);
          }
          50% { 
            transform: translateY(-50%) scale(1.2);
          }
        }
        
        @keyframes float5 {
          0%, 100% { 
            transform: translateX(0) scale(1);
          }
          50% { 
            transform: translateX(40%) scale(1.1);
          }
        }
      `}</style>
    </>
  );
}