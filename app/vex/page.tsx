"use client";
import React from "react";
import img1 from "../../public/images/PlaceholderBanner.jpg";
import TeamPageLayout from "../_components/teamPageLayout/teamPageLayout";
import TeamOverviewSection from "../_components/teamOverviewSection/teamOverviewSection";
import RobotGallery from "../_components/robotGallery/robotGallery";
import TeamStructure from "../_components/teamStructure/teamStructure";
import CompetitionSchedule from "../_components/competitionSchedule/competitionSchedule";
import { useContent } from "@/hooks/useContent";

export default function VEX() {
    const { content } = useContent();
    
    // Team overview data
    const teamOverviewData = content?.teams?.vex?.teamOverview || {
        teamName: 'Oxford Academy VEX Teams',
        teamDescription: [
            'Our VEX Robotics Competition teams, 1108A and 1108B, represent the cutting edge of high school robotics engineering. These teams design and build robots using the VEX platform to compete in challenging game scenarios that test autonomous programming, precise control, and strategic thinking.',
            'VEX teams work with metal construction systems and advanced programming environments to create sophisticated robots capable of complex tasks. Our teams have consistently excelled in both robot skills challenges and alliance-based tournament competitions.'
        ],
        highlights: [
            {
                icon: 'target',
                title: 'Skills Excellence',
                description: 'State champions in programming and driver skills competitions'
            },
            {
                icon: 'layers',
                title: 'Advanced Engineering',
                description: 'Innovative mechanical designs pushing the limits of VEX components'
            },
            {
                icon: 'code',
                title: 'Programming Mastery',
                description: 'Complex autonomous routines using C++ and advanced PID control'
            },
            {
                icon: 'star',
                title: 'Competition Success',
                description: 'Multiple tournament wins and World Championship qualifications'
            }
        ],
        image: '/images/robotics/group.jpeg',
        imageCaption: 'VEX teams collaborating on robot design'
    };

    // Robot gallery data
    const robots = content?.teams?.vex?.robots || [
        {
            name: 'Over Under Robot',
            year: '2023-24',
            description: 'Advanced catapult system with precise trajectory control for triball scoring. Features innovative intake mechanism and reliable elevation system.',
            image: '/images/comp/FRC_1.jpg',
            specs: ['Catapult Launch', 'Triball Intake', 'Elevation System', 'Autonomous Scoring']
        },
        {
            name: 'Spin Up Robot',
            year: '2022-23',
            description: 'Dual flywheel system optimized for disc launching with variable velocity control. Championship-winning design with exceptional accuracy and speed.',
            image: '/images/robotics/robotics_working.jpg',
            specs: ['Dual Flywheel', 'Disc Launcher', 'Roller Spinner', 'Expansion Wings']
        },
        {
            name: 'Tipping Point Robot',
            year: '2021-22',
            description: 'Mobile goal specialist with four-bar lift system and ring scoring capabilities. First design to achieve consistent autonomous goal navigation.',
            image: '/images/robotics/marketing_working.jpg',
            specs: ['Mobile Goal Lift', 'Ring Scoring', 'Four-Bar System', 'Platform Balance']
        }
    ];

    // Team structure data
    const subteams = content?.teams?.vex?.teamStructure || [
        {
            icon: 'wrench',
            name: 'Mechanical Design',
            description: 'Engineer and fabricate robot mechanisms using VEX metal components, focusing on durability, precision, and competitive performance.',
            skills: ['Autodesk Inventor', 'Metal Fabrication', 'Mechanism Design', 'Assembly']
        },
        {
            icon: 'code',
            name: 'Programming',
            description: 'Develop autonomous routines and teleop control systems using C++ and VEXcode Pro for optimal robot performance.',
            skills: ['C++', 'VEXcode Pro', 'PID Control', 'Autonomous Programming']
        },
        {
            icon: 'chart',
            name: 'Skills Challenge',
            description: 'Specialize in programming and driver skills competitions, optimizing robot performance for maximum scoring potential.',
            skills: ['Skills Programming', 'Driver Training', 'Score Optimization', 'Route Planning']
        },
        {
            icon: 'settings',
            name: 'Build Quality',
            description: 'Ensure structural integrity, reliability, and maintenance of robot systems throughout the competitive season.',
            skills: ['Quality Control', 'System Testing', 'Maintenance', 'Troubleshooting']
        },
        {
            icon: 'target',
            name: 'Strategy & Scouting',
            description: 'Analyze game mechanics, develop competitive strategies, and coordinate alliance selections for tournament success.',
            skills: ['Game Analysis', 'Match Strategy', 'Alliance Selection', 'Data Analysis']
        },
        {
            icon: 'file',
            name: 'Documentation',
            description: 'Maintain engineering notebooks, document design processes, and prepare award submissions for competitions.',
            skills: ['Engineering Notebook', 'Design Documentation', 'Award Preparation', 'Process Recording']
        }
    ];

    // Competition schedule data
    const events = content?.teams?.vex?.schedule || [
        {
            month: 'SEP–NOV',
            day: 'TBA',
            title: 'Season Opener Tournaments',
            description: 'Early-season events with the 2026-27 Override game',
            location: 'Orange County, CA'
        },
        {
            month: 'DEC–JAN',
            day: 'TBA',
            title: 'Skills Challenge Events',
            description: 'Programming and driver skills competitions',
            location: 'Southern California'
        },
        {
            month: 'FEB–MAR',
            day: 'TBA',
            title: 'Regional & State Championships',
            description: 'Qualification events for the world championship',
            location: 'California'
        },
        {
            month: 'APR–MAY',
            day: 'TBA',
            title: 'VEX World Championship',
            description: 'Global competition featuring the best VEX teams (qualification required)',
            location: 'Location TBA'
        }
    ];

    return (
        <TeamPageLayout 
            title="VEX Robotics Competition"
            description="VEX Teams 1108A & 1108B"
            bannerImage={img1}
        >
            <TeamOverviewSection 
                {...teamOverviewData} 
                basePath="teams.vex.teamOverview"
            />
            
            <RobotGallery 
                title="Robot Evolution"
                robots={robots}
                basePath="teams.vex"
            />

            <TeamStructure 
                title="Team Specializations"
                subteams={subteams}
                basePath="teams.vex"
            />

            <CompetitionSchedule 
                title="2026–2027 Competition Season"
                events={events}
                basePath="teams.vex"
            />
        </TeamPageLayout>
    );
}
