import React from "react";
import styles from "./teamOverviewSection.module.scss";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import EditableIcon from "@/components/icons/EditableIcon";

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

interface TeamOverviewSectionProps {
  teamName: string;
  teamDescription: string[];
  highlights: Highlight[];
  image: string;
  imageCaption: string;
  basePath: string; // e.g., "teams.frc.teamOverview"
}

export default function TeamOverviewSection({
  teamName,
  teamDescription,
  highlights,
  image,
  imageCaption,
  basePath
}: TeamOverviewSectionProps): React.ReactElement {
  return (
    <section className={styles.teamOverview}>
      <div className={styles.container}>
        <div className={styles.overviewContent}>
          <div className={styles.overviewText}>
            <EditableText
              value={teamName}
              path={`${basePath}.teamName`}
              as="h2"
            />
            {teamDescription.map((paragraph, index) => (
              <EditableText
                key={index}
                value={paragraph}
                path={`${basePath}.teamDescription.${index}`}
                as="p"
                multiline
              />
            ))}
            <div className={styles.highlights}>
              {highlights.map((highlight, index) => (
                <div key={index} className={styles.highlight}>
                  <span className={styles.highlightIcon}>
                    <EditableIcon
                      value={highlight.icon}
                      path={`${basePath}.highlights.${index}.icon`}
                      size={22}
                    />
                  </span>
                  <div className={styles.highlightBody}>
                    <EditableText
                      value={highlight.title}
                      path={`${basePath}.highlights.${index}.title`}
                      as="h3"
                    />
                  <EditableText
                    value={highlight.description}
                    path={`${basePath}.highlights.${index}.description`}
                    as="p"
                    multiline
                  />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <figure className={styles.overviewImage}>
            <EditableImage
              src={image}
              alt={teamName}
              path={`${basePath}.image`}
              width={640}
              height={480}
            />
            <figcaption className={styles.imageCaption}>
              <EditableText
                value={imageCaption}
                path={`${basePath}.imageCaption`}
                as="span"
              />
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
