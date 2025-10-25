import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Document Categorization Workflow',
    template: '%s | Document Categorization'
  },
  description: 'Complete guided categorization for enhanced AI training. Transform your content into valuable AI training data with our comprehensive 3-step process.',
  keywords: ['document categorization', 'AI training', 'workflow', 'metadata tagging'],
  authors: [{ name: 'Document Categorization Team' }],
  creator: 'Document Categorization System',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Document Categorization Workflow',
    description: 'Complete guided categorization for enhanced AI training',
    siteName: 'Document Categorization System',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Document Categorization Workflow',
    description: 'Complete guided categorization for enhanced AI training',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}