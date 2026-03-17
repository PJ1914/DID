"use client"

import { AlertTriangle } from "lucide-react"
import { FIREBASE_ENABLED } from "@/lib/firebase/config"

export function FirebaseSetupBanner() {
  if (FIREBASE_ENABLED) {
    return null
  }

  return (
    <div 
      data-firebase-banner
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm border-b border-yellow-600"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-yellow-900" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">
              Firebase Not Configured
            </h3>
            <p className="text-sm text-yellow-900/90 mt-1">
              Authentication features are disabled. To enable login/registration:
            </p>
            <ol className="text-sm text-yellow-900/90 mt-2 space-y-1 list-decimal list-inside">
              <li>
                Create a Firebase project at{" "}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-950"
                >
                  console.firebase.google.com
                </a>
              </li>
              <li>Copy your Firebase config to <code className="bg-yellow-600/30 px-1 rounded">.env.local</code></li>
              <li>
                Follow the setup guide in{" "}
                <code className="bg-yellow-600/30 px-1 rounded">
                  frontend/FIREBASE_SETUP.md
                </code>
              </li>
            </ol>
          </div>
          <button
            onClick={() => {
              const banner = document.querySelector('[data-firebase-banner]')
              if (banner) banner.remove()
            }}
            className="text-yellow-900 hover:text-yellow-950 p-1"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
