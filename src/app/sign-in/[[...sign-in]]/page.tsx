// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';
import styles from './signin.module.css';

export default function Page() {
  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.brand}>Ace</h1>

        <div className={styles.panel}>
          <div className={styles.clerkWrap}>
            <SignIn
              routing="hash"
              afterSignInUrl="/chat"
              afterSignUpUrl="/chat"
              appearance={{
                variables: {
                  colorPrimary: '#3DB6A4',
                  colorText: '#000000ff',
                  colorBackground: 'transparent',
                  borderRadius: '14px',
                  fontFamily:
                    "'Fredoka', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
                },
                elements: {
                  header: styles.clerkHeaderGhost,
                  headerTitle: styles.clerkHeaderTitle,
                  headerSubtitle: styles.hidden,

                  rootBox: styles.clerkRoot,
                  card: styles.clerkCard,
                  form: styles.clerkForm,
                  formFieldLabel: styles.clerkLabel,
                  formFieldInput: styles.clerkInput,
                  formButtonPrimary: styles.clerkPrimaryBtn,
                  footer: styles.clerkFooter,
                  footerAction: styles.clerkFooterAction,
                  footerActionText: styles.clerkFooterActionText,
                  socialButtonsBlockButton: styles.clerkSocialBtn,
                  dividerText: styles.clerkDividerText,
                },
                layout: { socialButtonsVariant: 'iconButton' },
              }}
            />
          </div>

          <p className={styles.powered}>Powered by The Air Assist</p>
        </div>
      </div>
    </main>
  );
}
