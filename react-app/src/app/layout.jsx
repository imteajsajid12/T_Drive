import "./globals.css";

export const metadata = {
  title: 'T_Drive',
  description: 'Your beautiful personal cloud',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}