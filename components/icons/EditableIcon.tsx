"use client";
import React from "react";
import Icon, { ICON_NAMES, resolveIconName } from "@/components/icons/Icon";
import { useEditMode } from "@/contexts/EditModeContext";
import { getContentValue } from "@/utils/contentHelpers";
import styles from "./EditableIcon.module.scss";

type EditableIconProps = {
    value: unknown; // icon name (or a legacy emoji) as stored in the content file
    path: string; // content path, e.g. "about.mission.cards.0.icon"
    size?: number;
    className?: string;
};

// Renders an icon; while editing, adds a picker so the icon can be swapped
// without typing names by hand.
export default function EditableIcon({ value, path, size = 24, className }: EditableIconProps): React.ReactElement | null {
    const { isEditMode, addPendingChange, pendingChanges } = useEditMode();
    const pending = pendingChanges.get(path);
    const current: string = typeof pending === "string" ? pending : String(getContentValue(value) ?? "");

    if (!isEditMode) {
        return <Icon name={current} size={size} className={className} />;
    }

    return (
        <span className={styles.wrap}>
            <Icon name={current} size={size} className={className} />
            <select
                className={styles.picker}
                aria-label="Choose icon"
                value={resolveIconName(current) ?? ""}
                onChange={(e) => addPendingChange(path, e.target.value)}
            >
                <option value="" disabled>Choose icon</option>
                {ICON_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                ))}
            </select>
        </span>
    );
}
