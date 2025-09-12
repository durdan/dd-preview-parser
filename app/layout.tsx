import './globals.css';
import Providers from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers session={undefined}>
          {children}
        </Providers>
      </body>
    </html>
  );
}