// Shared (client + server) description of who may edit what.
// The server is the source of truth: API routes call canEditPath() before
// writing, the UI uses the same function only to hide controls.

export type Role = 'super' | 'editor';

export type SessionUser = {
  username: string;
  displayName: string;
  role: Role;
  /** Area keys from PERMISSION_AREAS. Ignored for the super admin. */
  permissions: string[];
};

export type PermissionArea = {
  key: string;
  label: string;
  description: string;
  /** Content path prefixes this area covers, e.g. "teams.frc". */
  prefixes: string[];
};

export const PERMISSION_AREAS: PermissionArea[] = [
  { key: 'homepage', label: 'Homepage', description: 'Hero, about, stats, goals and team overview cards', prefixes: ['homepage', 'teamsOverview', 'pageSections.homepage'] },
  { key: 'about', label: 'About page', description: 'Mission, programs and impact', prefixes: ['about', 'pageSections.about'] },
  { key: 'contact', label: 'Contact page', description: 'Contact details and form text', prefixes: ['contact', 'pageSections.contact'] },
  { key: 'frc', label: 'FRC page', description: 'Team 4079 page', prefixes: ['teams.frc', 'pageSections.frc'] },
  { key: 'ftc', label: 'FTC page', description: 'FTC teams page', prefixes: ['teams.ftc', 'pageSections.ftc'] },
  { key: 'vex', label: 'VEX page', description: 'VEX teams page', prefixes: ['teams.vex', 'pageSections.vex'] },
  { key: 'team', label: 'Team members', description: 'Team page hero and member profiles', prefixes: ['team', 'teamMembers', 'pageSections.team'] },
  { key: 'sponsors', label: 'Sponsors page', description: 'Sponsors, tiers and sponsorship info', prefixes: ['sponsors', 'pageSections.sponsors'] },
  { key: 'news', label: 'News & newsletter', description: 'Create, edit and publish articles', prefixes: ['news', 'pageSections.news'] },
  { key: 'pages', label: 'Pages & navigation', description: 'Create custom pages, manage navigation and add custom sections', prefixes: ['customPages', 'pageSections', 'navigation', 'footer.quickLinks'] },
  { key: 'animations', label: 'Website animations', description: 'Page reveal, hero entrance, card hover and speed', prefixes: ['site.animations'] },
  { key: 'footer', label: 'Footer & navigation', description: 'Footer links, socials and the menu', prefixes: ['footer', 'navigation'] },
];

export const AREA_KEYS: string[] = PERMISSION_AREAS.map((a) => a.key);

/** "news.articles[2].title" and "news.articles.2.title" compare the same. */
function normalizePath(path: string): string {
  return path.replace(/\[(\d+)\]/g, '.$1').replace(/^\./, '');
}

function pathInPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}.`);
}

export function canEditPath(user: SessionUser | null | undefined, path: string): boolean {
  if (!user) return false;
  if (user.role === 'super') return true;
  const normalized = normalizePath(path);
  return PERMISSION_AREAS.some(
    (area) =>
      user.permissions.includes(area.key) &&
      area.prefixes.some((prefix) => pathInPrefix(normalized, prefix))
  );
}

export function canEditAnything(user: SessionUser | null | undefined): boolean {
  return !!user && (user.role === 'super' || user.permissions.length > 0);
}

/** Drops unknown area keys and duplicates. */
export function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(new Set(input.filter((k): k is string => typeof k === 'string' && AREA_KEYS.includes(k))));
}
