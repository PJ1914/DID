"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { Bell, CheckCircle2, AlertTriangle, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { listenToNotifications, markAsRead, getLocalNotifications, saveLocalNotification, type AppNotification } from "@/lib/notifications"

export default function StudentNotificationsPage() {
  const { address, isConnected } = useAccount()
  const [items, setItems] = useState<AppNotification[]>([])

  useEffect(() => {
    if (!address) return

    const local = getLocalNotifications(address)
    setItems(local)

    const unsubscribe = listenToNotifications(address, (remote) => {
      setItems(remote)
      for (const n of remote) {
        saveLocalNotification(address, n)
      }
    })

    return () => unsubscribe()
  }, [address])

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items])

  if (!isConnected || !address) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Please connect wallet to view notifications.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Verification Notifications</CardTitle>
            <Badge variant="secondary">Unread: {unread}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">No notifications yet. You will see real-time alerts when employers verify your certificates.</p>
            )}

            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{item.status === "valid" ? "Certificate verified" : "Verification alert"}</p>
                    <p className="text-xs text-muted-foreground break-all">
                      Cert: {item.certificateHash} | Verifier: {item.verifierWallet}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === "valid" ? "default" : "destructive"}>{item.status}</Badge>
                    {!item.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)))
                          await markAsRead(item.id)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" /> Mark read
                      </Button>
                    )}
                    {item.read && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
