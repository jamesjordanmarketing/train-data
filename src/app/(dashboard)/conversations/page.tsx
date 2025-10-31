import { Metadata } from 'next';
import { ConversationDashboard } from '@/components/conversations/ConversationDashboard';

export const metadata: Metadata = {
  title: 'Conversations | Training Data Generator',
  description: 'Manage and review AI-generated training conversations',
};

export default function ConversationsPage() {
  return <ConversationDashboard />;
}
