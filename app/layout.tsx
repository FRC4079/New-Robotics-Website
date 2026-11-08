import React from "react";
import type { Metadata } from "next";
import '@/app/globals.scss';
import img from "@/public/logos/OARoboticsLogo_24-25.webp";
import { AuthProvider } from '@/contexts/AuthContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { ContentProvider } from '@/contexts/ContentContext';
import EditToolbar from '@/components/editable/EditToolbar';
import { getServerContent } from '@/utils/contentStore';

// Content is edited at runtime, so pages must be rendered per request
// instead of being frozen at build time.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'OA Robotics Website',
    description: 'The official website for Oxford Academy Robotics',
    keywords: 'Oxford Academy, Robotics, FRC, FTC, VEX, Oxford Academy Robotics',
    icons: {
        icon: img.src,
        apple: img.src,
    },
}

export default async function RootLayout({children}: { children: React.ReactNode }): Promise<React.ReactElement> {
    const content = await getServerContent();

    return (
        <html lang="en">
        <body>
            <ContentProvider initialContent={content}>
                <AuthProvider>
                    <EditModeProvider>
                        <EditToolbar />
                        {children}
                    </EditModeProvider>
                </AuthProvider>
            </ContentProvider>
        </body>
        </html>
    )
}
