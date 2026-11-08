import React from "react";
import styles from "./robotGallery.module.scss";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";

interface Robot {
  name: string;
  year: string;
  description: string;
  image: string;
  specs: string[];
}

interface RobotGalleryProps {
  title: string;
  robots: Robot[];
  basePath: string; // e.g., "teams.frc.robots"
}

export default function RobotGallery({ title, robots, basePath }: RobotGalleryProps): React.ReactElement {
  return (
    <section className={styles.robotGallery}>
      <div className={styles.container}>
        <EditableText
          value={title}
          path={`${basePath}.title`}
          as="h2"
        />
        <div className={styles.robotGrid}>
          {robots.map((robot, index) => (
            <div key={index} className={styles.robotCard}>
              <div className={styles.robotImage}>
                <EditableImage
                  src={robot.image}
                  alt={`${robot.year} Robot - ${robot.name}`}
                  path={`${basePath}.robots.${index}.image`}
                  width={640}
                  height={420}
                />
              </div>
              <div className={styles.robotInfo}>
                <EditableText
                  value={robot.year}
                  path={`${basePath}.robots.${index}.year`}
                  as="span"
                  className={styles.robotYear}
                />
                <EditableText
                  value={robot.name}
                  path={`${basePath}.robots.${index}.name`}
                  as="h3"
                />
                <EditableText
                  value={robot.description}
                  path={`${basePath}.robots.${index}.description`}
                  as="p"
                  multiline
                />
                <div className={styles.robotSpecs}>
                  {robot.specs.map((spec, specIndex) => (
                    <EditableText
                      key={specIndex}
                      value={spec}
                      path={`${basePath}.robots.${index}.specs.${specIndex}`}
                      as="span"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
