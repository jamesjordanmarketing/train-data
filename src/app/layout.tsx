import { AuthProvider } from '../lib/auth-context'
import './globals.css'
import { Toaster } from "../components/ui/sonner"

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
        <AuthProvider
          redirectTo="/dashboard"
        >
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}