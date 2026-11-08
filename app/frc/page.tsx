"use client";
import React from "react";
import img1 from "../../public/images/FRCBanner.jpg";
import TeamPageLayout from "../_components/teamPageLayout/teamPageLayout";
import TeamOverviewSection from "../_components/teamOverviewSection/teamOverviewSection";
import RobotGallery from "../_components/robotGallery/robotGallery";
import TeamStructure from "../_components/teamStructure/teamStructure";
import CompetitionSchedule from "../_components/competitionSchedule/competitionSchedule";

export default function FRC() {
    // Team overview data
    const teamOverviewData = {
        teamName: 'About Team 4079 "Quantum Leap"',
        teamDescription: [
            'Team 4079, also known as "Quantum Leap", represents Oxford Academy\'s flagship robotics program in the FIRST Robotics Competition. Founded in 2012, our team has grown from a small group of passionate students into one of Southern California\'s most respected FRC teams.',
            'We compete annually in the FIRST Robotics Competition, where teams have six weeks to design, build, and program industrial-sized robots weighing up to 125 pounds. Our robots must complete complex tasks in a fast-paced alliance-based competition format.'
        ],
        highlights: [
            {
                icon: '🎯',
                title: 'Our Mission',
                description: 'To inspire students to pursue STEM careers while building innovative robots and fostering gracious professionalism.'
            },
            {
                icon: '⚙️',
                title: 'What We Do',
                description: 'Design and build competition robots, mentor younger teams, and engage in community STEM outreach programs.'
            },
            {
                icon: '🏆',
                title: 'Our Values',
                description: 'Excellence in engineering, collaborative teamwork, gracious professionalism, and continuous learning.'
            }
        ],
        image: '/images/robotics/robotics_working.jpg',
        imageCaption: 'Team 4079 members working on our 2024 competition robot'
    };

    // Robot gallery data
    const robots = [
        {
            name: 'Quantum Surge',
            year: '2024',
            description: 'Featured innovative climbing mechanism and precision note shooting for the CRESCENDO game.',
            image: '/images/comp/FRC_1.jpg',
            specs: ['Weight: 120 lbs', 'Height: 4\'8"', 'Programming: Java']
        },
        {
            name: 'Charge Forward',
            year: '2023',
            description: 'Designed for CHARGED UP with advanced autonomous balancing and cone/cube manipulation.',
            image: '/images/robotics/competition_working.jpg',
            specs: ['Weight: 118 lbs', 'Height: 4\'6"', 'Programming: Java']
        },
        {
            name: 'Rapid React',
            year: '2022',
            description: 'Built for RAPID REACT with high-speed ball shooting and climbing capabilities.',
            image: '/images/robotics/marketing_working.jpg',
            specs: ['Weight: 115 lbs', 'Height: 4\'10"', 'Programming: Java']
        }
    ];

    // Team structure data
    const subteams = [
        {
            icon: '⚙️',
            name: 'Mechanical Team',
            description: 'Designs and builds the physical robot structure, mechanisms, and moving parts using CAD software and manufacturing tools.',
            skills: ['SolidWorks', 'Machining', '3D Printing', 'Fabrication']
        },
        {
            icon: '💻',
            name: 'Programming Team',
            description: 'Develops robot control software, autonomous routines, and driver assistance systems using Java and advanced algorithms.',
            skills: ['Java', 'Git/GitHub', 'Sensors', 'Computer Vision']
        },
        {
            icon: '🔌',
            name: 'Electrical Team',
            description: 'Handles robot wiring, control systems, sensor integration, and ensures reliable electrical connections.',
            skills: ['Circuit Design', 'Wiring', 'Sensors', 'Troubleshooting']
        },
        {
            icon: '📊',
            name: 'Strategy & Scouting',
            description: 'Analyzes competition data, develops match strategies, and coordinates alliance selections at competitions.',
            skills: ['Data Analysis', 'Statistics', 'Strategy', 'Scouting Apps']
        },
        {
            icon: '📢',
            name: 'Media & Outreach',
            description: 'Manages team branding, documentation, social media, and community engagement initiatives.',
            skills: ['Photography', 'Social Media', 'Public Speaking', 'Documentation']
        },
        {
            icon: '💰',
            name: 'Business Team',
            description: 'Handles team finances, sponsor relations, fundraising, and ensures team sustainability.',
            skills: ['Fundraising', 'Sponsorship', 'Budgeting', 'Presentations']
        }
    ];

    // Competition schedule data
    const events = [
        {
            month: 'JAN',
            day: '06',
            title: 'Kickoff & Game Release',
            description: 'Official game reveal and 6-week build season begins',
            location: 'Virtual Broadcast'
        },
        {
            month: 'FEB',
            day: '18',
            title: 'Stop Build Day',
            description: 'End of build season, robot must be sealed for competition',
            location: 'Team Workshop'
        },
        {
            month: 'MAR',
            day: '15-17',
            title: 'Los Angeles Regional',
            description: 'Our primary regional competition',
            location: 'El Segundo, CA'
        },
        {
            month: 'APR',
            day: '17-20',
            title: 'FIRST Championship',
            description: 'World championship competition (qualification required)',
            location: 'Houston, TX'
        }
    ];

    return (
        <TeamPageLayout 
            title="FIRST Robotics Competition"
            description="Team 4079 - Quantum Leap: Engineering Excellence Since 2012"
            bannerImage={img1}
            bgMoveUp={70}
        >
            <TeamOverviewSection 
                {...teamOverviewData} 
                basePath="teams.frc.teamOverview"
            />
            
            <RobotGallery 
                title="Our Competition Robots"
                robots={robots}
                basePath="teams.frc"
            />

            <TeamStructure 
                title="Team Structure & Subteams"
                subteams={subteams}
                basePath="teams.frc"
            />

            <CompetitionSchedule 
                title="2024-2025 Competition Schedule"
                events={events}
                basePath="teams.frc"
            />
        </TeamPageLayout>
    )
}