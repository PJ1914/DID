export function Footer() {
    return (
        <footer className="border-t border-border bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <div className="h-6 w-6 rounded bg-gradient-to-r from-did-electric to-blue-500" />
                        <span className="font-semibold text-foreground">DID Platform</span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors">
                            Documentation
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors">
                            Support
                        </a>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
                    © 2025 DID Platform. Built for the decentralized future.
                </div>
            </div>
        </footer>
    )
}