import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { TaskProvider } from '@/components/TaskProvider';
import { LayoutContent } from '@/components/LayoutContent';

export const metadata: Metadata = {
  title: 'LastMinute – The AI Productivity Rescue System',
  description: 'AI-powered productivity assistant',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <TaskProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
