"use client";
import React from 'react';
import styles from './teamMembers.module.scss';
import { useContent } from '@/hooks/useContent';

type TeamMember = {
    id: string;
    name: string;
    role: string;
    grade: string;
    bio: string;
    image?: string;
    skills: string[];
    team: 'FRC' | 'FTC' | 'VEX' | 'Student Leadership' | 'Mentors' | 'Advisor' | 'All';
    socialLinks?: {
        linkedin?: string;
        github?: string;
        instagram?: string;
    };
}

type TeamMembersProps = {
    children?: React.ReactNode;
    members?: TeamMember[];
    title?: string;
    showFilter?: boolean;
}

const defaultMembers: TeamMember[] = [
    {
        id: '1',
        name: 'Rishi Mishra',
        role: 'Programs Director',
        grade: '12th Grade',
        bio: 'Passionate about robotics and leading the team to success. Specializes in mechanical design and team coordination.',
        skills: ['Leadership', 'Project Management'],
        team: 'Student Leadership',
        image: '/images/robotics/group.jpeg'
    },
    {
        id: '2',
        name: 'Aaron Truong',
        role: 'FRC Team Captain',
        grade: '11th Grade',
        bio: 'Passionate about robotics and leading the team to success. Specializes in mechanical design and team coordination.',
        skills: ['Leadership', 'Mechanical Design', 'CAD', 'Project Management'],
        team: 'FRC',
        image: '/images/robotics/group.jpeg'
    }
];

export default function TeamMembers({ 
    children, 
    members: propsMembers,
    title = "Meet Our Team",
    showFilter = true 
}: TeamMembersProps): React.ReactElement {
    const { content } = useContent();
    const [selectedTeam, setSelectedTeam] = React.useState<string>('All');

    // Use members from props, CMS, or fallback to defaults
    const members = propsMembers || (content?.teamMembers as TeamMember[]) || defaultMembers;

    const teamTypes = ['All', 'Leadership', 'FRC', 'FTC', 'VEX'];

    const filteredMembers = React.useMemo(
        () => (selectedTeam === 'All'
            ? members
            : members.filter(member => member.team === selectedTeam || member.team === 'All')),
        [selectedTeam, members]
    );

    return (
        <section className={styles.teamMembers}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>
                
                {showFilter && (
                    <div className={styles.filterTabs}>
                        {teamTypes.map((team) => (
                            <button
                                key={team}
                                className={`${styles.filterTab} ${selectedTeam === team ? styles.active : ''}`}
                                aria-pressed={selectedTeam === team}
                                onClick={() => setSelectedTeam(team)}
                            >
                                {team}
                            </button>
                        ))}
                    </div>
                )}

                <div className={styles.membersGrid}>
                    {filteredMembers.map((member) => (
                        <div key={member.id} className={styles.memberCard}>
                            <div className={styles.memberImage}>
                                {member.image ? (
                                    <img src={member.image} alt={member.name} />
                                ) : (
                                    <div className={styles.placeholder}>
                                        <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
                                    </div>
                                )}
                                <div className={styles.memberOverlay}>
                                    <div className={styles.memberRole}>{member.role}</div>
                                </div>
                            </div>
                            
                            <div className={styles.memberContent}>
                                <div className={styles.memberHeader}>
                                    <h3>{member.name}</h3>
                                    <span className={styles.memberGrade}>{member.grade}</span>
                                </div>
                                
                                <p className={styles.memberBio}>{member.bio}</p>
                                
                                <div className={styles.memberSkills}>
                                    {member.skills.slice(0, 3).map((skill, index) => (
                                        <span key={index} className={styles.skill}>
                                            {skill}
                                        </span>
                                    ))}
                                    {member.skills.length > 3 && (
                                        <span className={styles.skillCount}>
                                            +{member.skills.length - 3} more
                                        </span>
                                    )}
                                </div>

                                <div className={styles.memberTeam}>
                                    <span className={`${styles.teamBadge} ${styles[member.team.toLowerCase().split(' ').join('_')]}`}>
                                        {member.team}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {children}
        </section>
    );
}
