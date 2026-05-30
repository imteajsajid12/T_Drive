import App from '../App';
import { PWARegistration } from '../components/system/PWARegistration';
import "./globals.css";

export const metadata = {
  title: 'T_Drive',
  description: 'Your beautiful personal cloud',
  manifest: '/manifest.webmanifest',
  applicationName: 'T_Drive',
  appleWebApp: {
    capable: true,
    title: 'T_Drive',
    statusBarStyle: 'default'
  },
  icons: {
    icon: '/pwa-icon.svg',
    apple: '/apple-touch-icon.svg'
  }
};

export const viewport = {
  themeColor: '#10b981'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PWARegistration />
        <App>{children}</App>
      </body>
    </html>
  );
}
