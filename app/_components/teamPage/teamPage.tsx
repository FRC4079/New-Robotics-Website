"use client";
import React from "react";
import { StaticImageData } from "next/image";
import TeamPageLayout from "@/app/_components/teamPageLayout/teamPageLayout";
import TeamOverviewSection from "@/app/_components/teamOverviewSection/teamOverviewSection";
import RobotGallery from "@/app/_components/robotGallery/robotGallery";
import TeamStructure from "@/app/_components/teamStructure/teamStructure";
import CompetitionSchedule from "@/app/_components/competitionSchedule/competitionSchedule";
import { useContent } from "@/hooks/useContent";

type TeamPageProps = {
    /** Key under `teams` in the site content, for example "frc". */
    teamKey: "frc" | "ftc" | "vex";
    banner: StaticImageData;
};

/**
 * One page for every competition team. All text comes from the site content
 * (`teams.<key>`), and every editable field uses the path it is read from, so
 * what you edit is what the page shows after saving.
 */
export default function TeamPage({ teamKey, banner }: TeamPageProps): React.ReactElement | null {
    const { content } = useContent();
    const team = content?.teams?.[teamKey];
    if (!team) return null;

    const base = `teams.${teamKey}`;

    return (
        <TeamPageLayout
            title={team.hero?.title ?? ""}
            description={team.hero?.subtitle ?? ""}
            bannerImage={banner}
            heroPath={`${base}.hero`}
        >
            {team.overview && <TeamOverviewSection {...team.overview} basePath={`${base}.overview`} />}
            {team.gallery && (
                <RobotGallery title={team.gallery.title} robots={team.gallery.robots ?? []} basePath={`${base}.gallery`} />
            )}
            {team.structure && (
                <TeamStructure title={team.structure.title} subteams={team.structure.subteams ?? []} basePath={`${base}.structure`} />
            )}
            {team.schedule && (
                <CompetitionSchedule title={team.schedule.title} events={team.schedule.events ?? []} basePath={`${base}.schedule`} />
            )}
        </TeamPageLayout>
    );
}
