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
                icon: '🏆',
                title: 'Competition Excellence',
                description: 'Multiple regional championships and state-level competition appearances'
            },
            {
                icon: '🔧',
                title: 'Engineering Innovation',
                description: 'Award-winning robot designs featuring creative solutions to game challenges'
            },
            {
                icon: '🤝',
                title: 'Gracious Professionalism',
                description: 'Commitment to helping other teams and fostering a collaborative environment'
            },
            {
                icon: '📚',
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
            icon: '🔧',
            name: 'Mechanical Engineering',
            description: 'Design and build the robot chassis, drive train, and game-specific mechanisms using CAD software and precision manufacturing techniques.',
            skills: ['SolidWorks', '3D Printing', 'Aluminum Fabrication', 'Assembly']
        },
        {
            icon: '💻',
            name: 'Programming',
            description: 'Develop autonomous routines, teleop controls, and sensor integration using Java and the FTC SDK for Android-based robot control.',
            skills: ['Java', 'Android Studio', 'OpenCV', 'PID Control']
        },
        {
            icon: '⚡',
            name: 'Electrical Systems',
            description: 'Handle wiring, sensor placement, and electrical troubleshooting to ensure reliable robot operation throughout competitions.',
            skills: ['REV Hardware', 'Sensor Integration', 'Wiring Management', 'Troubleshooting']
        },
        {
            icon: '📊',
            name: 'Strategy & Scouting',
            description: 'Analyze game strategy, scout other teams, and coordinate alliance selections to maximize competitive performance.',
            skills: ['Data Analysis', 'Alliance Strategy', 'Match Scouting', 'Competition Planning']
        },
        {
            icon: '🎨',
            name: 'Marketing & Outreach',
            description: 'Promote the team, create presentation materials, and engage with the community to spread STEM awareness.',
            skills: ['Social Media', 'Presentations', 'Community Events', 'Team Branding']
        },
        {
            icon: '📝',
            name: 'Engineering Notebook',
            description: 'Document the engineering design process, team progress, and competition experiences for awards consideration.',
            skills: ['Technical Writing', 'Design Documentation', 'Photo Documentation', 'Awards Submission']
        }
    ];

    // Competition schedule data
    const events = [
        {
            month: 'DEC',
            day: '9',
            title: 'League Tournament #1',
            description: 'First qualifying tournament of the season featuring both teams competing for ranking points.',
            location: 'Local High School, Cypress CA'
        },
        {
            month: 'JAN',
            day: '13',
            title: 'League Tournament #2',
            description: 'Second qualifying event with improved robots and refined autonomous programs.',
            location: 'Oxford Academy, Cypress CA'
        },
        {
            month: 'FEB',
            day: '3',
            title: 'League Tournament #3',
            description: 'Final league tournament before championship qualifier selection.',
            location: 'Competitor School, Orange County CA'
        },
        {
            month: 'FEB',
            day: '24',
            title: 'Regional Championship',
            description: 'Championship tournament with top teams from across the region competing for state advancement.',
            location: 'Regional Venue, Orange County CA'
        },
        {
            month: 'MAR',
            day: '16',
            title: 'State Championship',
            description: 'California State FTC Championship featuring the best teams from across the state.',
            location: 'State Venue, California'
        },
        {
            month: 'APR',
            day: '20',
            title: 'FIRST World Championship',
            description: 'Ultimate competition bringing together the world\'s best FTC teams.',
            location: 'Houston, Texas'
        }
    ];

    return (
        <TeamPageLayout 
            title="FIRST Tech Challenge"
            description="FTC Teams 19812 & 23796"
            bannerImage={img1}
            bgMoveUp={50}
            bgShift={100}
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
                title="2024 Season Schedule"
                events={events}
                basePath="teams.ftc"
            />
        </TeamPageLayout>
    )
}