"use client";
import React from "react";
import img1 from "../../public/images/FTCBanner.jpg";
import TeamPageLayout from "../_components/teamPageLayout/teamPageLayout";
import TeamOverviewSection from "../_components/teamOverviewSection/teamOverviewSection";
import RobotGallery from "../_components/robotGallery/robotGallery";
import TeamStructure from "../_components/teamStructure/teamStructure";
import CompetitionSchedule from "../_components/competitionSchedule/competitionSchedule";

export default function FTC() {
    // Team overview data
    const teamOverviewData = {
        teamName: 'Oxford Academy FTC Teams',
        teamDescription: [
            'Our FIRST Tech Challenge teams, 19812 and 23796, represent the pinnacle of middle school robotics excellence. These teams compete with robots built entirely by students using the Android-based control system and FIRST-approved materials.',
            'FTC challenges students to design, build, program, and operate robots to compete in a head-to-head challenge in an alliance format. Our teams have consistently demonstrated innovation, teamwork, and gracious professionalism throughout their competitive seasons.'
        ],
        highlights: [
            {
                icon: 'trophy',
                title: 'Competition Excellence',
                description: 'Multiple regional championships and state-level competition appearances'
            },
            {
                icon: 'wrench',
                title: 'Engineering Innovation',
                description: 'Award-winning robot designs featuring creative solutions to game challenges'
            },
            {
                icon: 'handshake',
                title: 'Gracious Professionalism',
                description: 'Commitment to helping other teams and fostering a collaborative environment'
            },
            {
                icon: 'book',
                title: 'STEM Education',
                description: 'Hands-on learning in engineering, programming, project management, and teamwork'
            }
        ],
        image: '/images/robotics/competition_working.jpg',
        imageCaption: 'FTC teams collaborating during competition'
    };

    // Robot gallery data
    const robots = [
        {
            name: 'CENTERSTAGE Robot',
            year: '2023-24',
            description: 'Advanced pixel placement system with precise autonomous capabilities. Features innovative intake mechanism and reliable climbing system for endgame points.',
            image: '/images/comp/FRC_1.jpg',
            specs: ['Pixel Placement', 'Autonomous Scoring', 'Climbing System', 'Vision Processing']
        },
        {
            name: 'POWERPLAY Robot',
            year: '2022-23',
            description: 'Cone stacking specialist with four-bar lift system. Dominated regional competitions with consistent high-scoring autonomous routines.',
            image: '/images/robotics/robotics_working.jpg',
            specs: ['Cone Stacking', 'Four-Bar Lift', 'Ground Junction', 'Terminal Cycles']
        },
        {
            name: 'FREIGHT FRENZY Robot',
            year: '2021-22',
            description: 'Carousel spinner and freight transport system. First robot to achieve consistent autonomous cycles in our team history.',
            image: '/images/robotics/marketing_working.jpg',
            specs: ['Carousel Spinner', 'Freight Transport', 'Shipping Hub', 'Duck Delivery']
        }
    ];

    // Team structure data
    const subteams = [
        {
            icon: 'wrench',
            name: 'Mechanical Engineering',
            description: 'Design and build the robot chassis, drive train, and game-specific mechanisms using CAD software and precision manufacturing techniques.',
            skills: ['SolidWorks', '3D Printing', 'Aluminum Fabrication', 'Assembly']
        },
        {
            icon: 'code',
            name: 'Programming',
            description: 'Develop autonomous routines, teleop controls, and sensor integration using Java and the FTC SDK for Android-based robot control.',
            skills: ['Java', 'Android Studio', 'OpenCV', 'PID Control']
        },
        {
            icon: 'zap',
            name: 'Electrical Systems',
            description: 'Handle wiring, sensor placement, and electrical troubleshooting to ensure reliable robot operation throughout competitions.',
            skills: ['REV Hardware', 'Sensor Integration', 'Wiring Management', 'Troubleshooting']
        },
        {
            icon: 'chart',
            name: 'Strategy & Scouting',
            description: 'Analyze game strategy, scout other teams, and coordinate alliance selections to maximize competitive performance.',
            skills: ['Data Analysis', 'Alliance Strategy', 'Match Scouting', 'Competition Planning']
        },
        {
            icon: 'palette',
            name: 'Marketing & Outreach',
            description: 'Promote the team, create presentation materials, and engage with the community to spread STEM awareness.',
            skills: ['Social Media', 'Presentations', 'Community Events', 'Team Branding']
        },
        {
            icon: 'file',
            name: 'Engineering Notebook',
            description: 'Document the engineering design process, team progress, and competition experiences for awards consideration.',
            skills: ['Technical Writing', 'Design Documentation', 'Photo Documentation', 'Awards Submission']
        }
    ];

    // Competition schedule data
    const events = [
        {
            month: 'SEP',
            day: '12',
            title: 'Kickoff: BIOBUZZ',
            description: 'The 2026-27 FIRST CANOPY season and the BIOBUZZ game are revealed',
            location: 'Kickoff Broadcast'
        },
        {
            month: 'NOV–JAN',
            day: 'TBA',
            title: 'League Meets & Qualifiers',
            description: 'Both teams compete for ranking points and advancement',
            location: 'Southern California'
        },
        {
            month: 'FEB–MAR',
            day: 'TBA',
            title: 'Regional Championship',
            description: 'Top teams from the region compete for advancement',
            location: 'Southern California'
        },
        {
            month: 'APR',
            day: 'TBA',
            title: 'FIRST Championship',
            description: 'Global competition for the top FTC teams (qualification required)',
            location: 'Location TBA'
        }
    ];

    return (
        <TeamPageLayout 
            title="FIRST Tech Challenge"
            description="FTC Teams 19812 & 23796"
            bannerImage={img1}
        >
            <TeamOverviewSection 
                {...teamOverviewData} 
                basePath="teams.ftc.teamOverview"
            />
            
            <RobotGallery 
                title="Robot Showcase"
                robots={robots}
                basePath="teams.ftc"
            />

            <TeamStructure 
                title="Team Organization"
                subteams={subteams}
                basePath="teams.ftc"
            />

            <CompetitionSchedule 
                title="2026–2027 Season Schedule"
                events={events}
                basePath="teams.ftc"
            />
        </TeamPageLayout>
    )
}