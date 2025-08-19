import '@/styles/globals.css';

export const metadata = {
  title: 'Tei-ji Portfolio',
  description: 'Art and Design Portfolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}