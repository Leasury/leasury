'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeToggle } from '@/components/ThemeToggle';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
        >
            {children}
            {/* Global fixed toggle — visible on every screen including game pages */}
            <div className="fixed bottom-4 right-4 z-50">
                <ThemeToggle />
            </div>
        </NextThemesProvider>
    );
}
