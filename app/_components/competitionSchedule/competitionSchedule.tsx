import React from "react";
import styles from "./competitionSchedule.module.scss";
import EditableText from "@/components/editable/EditableText";

interface Event {
  month: string;
  day: string;
  title: string;
  description: string;
  location: string;
}

interface CompetitionScheduleProps {
  title: string;
  events: Event[];
  basePath: string; // e.g., "teams.frc.schedule"
}

export default function CompetitionSchedule({ title, events, basePath }: CompetitionScheduleProps): React.ReactElement {
  return (
    <section className={styles.competitionSchedule}>
      <div className={styles.container}>
        <EditableText
          value={title}
          path={`${basePath}.title`}
          as="h2"
        />
        <div className={styles.scheduleGrid}>
          {events.map((event, index) => (
            <div key={index} className={styles.eventCard}>
              <div className={styles.eventDate}>
                <div className={styles.month}>
                  <EditableText
                    value={event.month}
                    path={`${basePath}.events.${index}.month`}
                    as="span"
                  />
                </div>
                <div className={styles.day}>
                  <EditableText
                    value={event.day}
                    path={`${basePath}.events.${index}.day`}
                    as="span"
                  />
                </div>
              </div>
              <div className={styles.eventInfo}>
                <EditableText
                  value={event.title}
                  path={`${basePath}.events.${index}.title`}
                  as="h3"
                />
                <EditableText
                  value={event.description}
                  path={`${basePath}.events.${index}.description`}
                  as="p"
                  multiline
                />
                <div className={styles.eventLocation}>
                  <EditableText
                    value={event.location}
                    path={`${basePath}.events.${index}.location`}
                    as="span"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
