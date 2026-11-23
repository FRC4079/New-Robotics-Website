import React from "react";
import type { Metadata } from "next";
import '@/app/globals.scss';
import img from "@/public/logos/OARoboticsLogo_24-25.webp";
import { AuthProvider } from '@/contexts/AuthContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { ContentProvider } from '@/contexts/ContentContext';
import EditToolbar from '@/components/editable/EditToolbar';
import AnimationEffects from '@/components/animations/AnimationEffects';
import { getVisibleContent } from '@/utils/visibleContent';
import { fontVariables } from '@/utils/globalFonts';
import { resolveAnimationSettings } from '@/utils/animationHelpers';

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
    const content = await getVisibleContent();
    const anim = resolveAnimationSettings(content?.site?.animations);

    return (
        <html
            lang="en"
            className={fontVariables}
            data-anim-preset={anim.preset}
            data-anim-reveal={anim.scrollReveal}
            data-anim-hero={anim.heroEntrance}
            data-anim-hover={anim.cardHover}
            data-anim-speed={anim.speed}
            data-anim-stagger={anim.stagger ? 'true' : 'false'}
            data-anim-reduced={anim.respectReducedMotion ? 'true' : 'false'}
        >
        <body>
            <ContentProvider initialContent={content}>
                <AuthProvider>
                    <EditModeProvider>
                        <AnimationEffects />
                        <EditToolbar />
                        {children}
                    </EditModeProvider>
                </AuthProvider>
            </ContentProvider>
        </body>
        </html>
    )
}
