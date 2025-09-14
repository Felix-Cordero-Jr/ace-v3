// src/app/layout.tsx
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { enUS } from '@clerk/localizations';
import type { LocalizationResource } from '@clerk/types';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';

const locale: LocalizationResource = {
  ...enUS,
  signIn: {
    ...enUS.signIn,
    start: {
      ...enUS.signIn?.start,
      title: 'Clerk Authentication',
      subtitle: '',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={locale}>
      <html lang="en">
        <body>
          <header className="d-flex justify-content-end align-items-center p-3 gap-3">
            <SignedOut>{/* sign-in/up links if you want */}</SignedOut>
            <SignedIn><UserButton /></SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}