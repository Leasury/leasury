import type { Metadata } from 'next';
import { Source_Code_Pro } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const sourceCodePro = Source_Code_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-source-code-pro',
});

export const metadata: Metadata = {
    title: 'Lesury - Board Games Reimagined',
    description:
        'Turn any screen into a game night. Play board games together using your phones as controllers.',
    icons: {
        icon: '/favicon.png',
        apple: '/apple-icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Google Analytics */}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-ZGB4JDXTNY"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-ZGB4JDXTNY');
                    `}
                </Script>
            </head>
            <body className={`${sourceCodePro.variable} antialiased`}>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
