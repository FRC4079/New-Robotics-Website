import React from "react";
import styles from "./teamStructure.module.scss";
import EditableText from "@/components/editable/EditableText";
import EditableIcon from "@/components/icons/EditableIcon";

interface Subteam {
  icon: string;
  name: string;
  description: string;
  skills: string[];
}

interface TeamStructureProps {
  title: string;
  subteams: Subteam[];
  basePath: string; // e.g., "teams.frc.teamStructure"
}

export default function TeamStructure({ title, subteams, basePath }: TeamStructureProps): React.ReactElement {
  return (
    <section className={styles.teamStructure}>
      <div className={styles.container}>
        <EditableText
          value={title}
          path={`${basePath}.title`}
          as="h2"
        />
        <div className={styles.subteamsGrid}>
          {subteams.map((subteam, index) => (
            <div key={index} className={styles.subteam}>
              <div className={styles.subteamIcon}>
                <EditableIcon
                  value={subteam.icon}
                  path={`${basePath}.subteams.${index}.icon`}
                  size={24}
                />
              </div>
              <EditableText
                value={subteam.name}
                path={`${basePath}.subteams.${index}.name`}
                as="h3"
              />
              <EditableText
                value={subteam.description}
                path={`${basePath}.subteams.${index}.description`}
                as="p"
                multiline
              />
              <div className={styles.subteamSkills}>
                {subteam.skills.map((skill, skillIndex) => (
                  <EditableText
                    key={skillIndex}
                    value={skill}
                    path={`${basePath}.subteams.${index}.skills.${skillIndex}`}
                    as="span"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
