import React from "react";
import { Metadata } from "next";
import styles from "@/app/team/team.module.scss";
import Navbar from "@/app/_components/navbar/navbar";
import Footer from "@/app/_components/footer/footer";
import Title from "@/app/_components/title/title";
import TeamMembers from "@/app/_components/teamMembers/teamMembers";

export const metadata: Metadata = {
    title: 'Our Team - OA Robotics',
    description: 'Meet the talented students and mentors behind Oxford Academy Robotics. Learn about our team members and their specialties.',
    keywords: 'Oxford Academy Robotics Team, Robotics Students, STEM Team Members, FRC FTC VEX Students'
}

export default async function Team(): Promise<React.ReactElement> {
    return (
        <div className={styles.teamPage}>
            <Navbar />
            <Title 
                title={"Our Amazing Team"} 
                description={"Meet the talented students who make OA Robotics possible"}
            />
            <TeamMembers 
                showFilter={true}
                title="Team Members"
            />
            <Footer />
        </div>
    );
}
