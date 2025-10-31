import { AuthProvider } from '../lib/auth-context'
import { ReactQueryProvider } from '../providers/react-query-provider'
import './globals.css'
import '../styles/polish.css'
import { Toaster } from "../components/ui/sonner"
import { ErrorBoundary } from '../components/error-boundary'
import { OfflineBanner } from '../components/offline-banner'
import { OnlineStatusProvider } from '../providers/online-status-provider'

export const metadata = {
  title: 'Document Categorization System',
  description: 'Categorize and tag documents efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <OnlineStatusProvider>
            <ReactQueryProvider>
              <AuthProvider
                redirectTo="/dashboard"
              >
                {children}
              </AuthProvider>
            </ReactQueryProvider>
            <Toaster richColors position="top-right" />
          </OnlineStatusProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}