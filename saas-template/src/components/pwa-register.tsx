'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration)
          })
          .catch((error) => {
            console.log('SW registration failed: ', error)
          })
      })
    }

    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setInstallPrompt(e)
      
      // Show install prompt after 30 seconds if the user hasn't installed the app
      // and hasn't dismissed the prompt
      const hasPromptBeenShown = localStorage.getItem('pwaPromptShown')
      if (!hasPromptBeenShown) {
        const timer = setTimeout(() => {
          setShowInstallPrompt(true)
          localStorage.setItem('pwaPromptShown', 'true')
        }, 30000)
        
        return () => clearTimeout(timer)
      }
    })
    
    // Handle installed event
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null)
      setShowInstallPrompt(false)
      console.log('PWA was installed')
    })
  }, [])

  const handleInstall = () => {
    if (!installPrompt) return
    
    // Show the install prompt
    installPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      setInstallPrompt(null)
      setShowInstallPrompt(false)
    })
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for a week
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)
    localStorage.setItem('pwaPromptShown', expiryDate.toISOString())
  }

  if (!showInstallPrompt) return null

  return (
    <>
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install our app</DialogTitle>
            <DialogDescription>
              Install our app on your home screen for a better experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-start space-x-3 py-4">
            <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div className="text-sm">
              <p>Benefits of installing the app:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Faster access</li>
                <li>Works offline</li>
                <li>Full-screen experience</li>
                <li>Get push notifications</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDismiss}>
              Not now
            </Button>
            <Button onClick={handleInstall}>
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
