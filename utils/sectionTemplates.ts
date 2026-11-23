import type { CustomSection, CustomSectionType } from './content';

export interface SectionTemplateMeta {
  type: CustomSectionType;
  label: string;
  description: string;
  icon: string;
}

export const SECTION_TEMPLATES: SectionTemplateMeta[] = [
  {
    type: 'text-media',
    label: 'Split Text & Media',
    description: 'Headline, description, optional button, and an image, GIF, or video.',
    icon: 'image',
  },
  {
    type: 'cards',
    label: 'Feature Cards Grid',
    description: 'Responsive grid of cards with icons, titles, and descriptions.',
    icon: 'layers',
  },
  {
    type: 'stats',
    label: 'Impact Metrics',
    description: 'Highlight key numbers, milestones, and statistics.',
    icon: 'chart',
  },
  {
    type: 'media-showcase',
    label: 'Media Gallery',
    description: 'Showcase photos, animated GIFs, or looping videos with captions.',
    icon: 'rocket',
  },
  {
    type: 'cta',
    label: 'Call to Action',
    description: 'Centered spotlight banner with primary and secondary buttons.',
    icon: 'megaphone',
  },
  {
    type: 'rich-text',
    label: 'Editorial Text Block',
    description: 'Clean, focused text section for announcements or guides.',
    icon: 'file',
  },
];

export function createSectionFromTemplate(
  type: CustomSectionType,
  placement: 'after-hero' | 'before-footer' = 'before-footer'
): CustomSection {
  const id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  switch (type) {
    case 'text-media':
      return {
        id,
        type,
        placement,
        eyebrow: 'Featured Spotlight',
        title: 'Engineering Beyond the Classroom',
        body: 'Share a story about your subteam, outreach event, or robot subsystem. Click any text to edit inline, or replace the media with a photo, GIF, or video.',
        media: '/images/robotics/robotics_working.jpg',
        mediaAlt: 'Students collaborating in the robotics lab',
        primaryButton: { label: 'Learn More', href: '/about' },
        style: {
          surface: 'default',
          padding: 'normal',
          maxWidth: 'standard',
          textAlign: 'left',
          mediaPosition: 'right',
          animation: 'inherit',
        },
      };
    case 'cards':
      return {
        id,
        type,
        placement,
        eyebrow: 'Highlights',
        title: 'What Makes This Program Unique',
        subtitle: 'Explore the pillars that power our robotics organization.',
        items: [
          {
            id: `${id}-1`,
            icon: 'wrench',
            title: 'Hands-On Fabrication',
            description: 'Students CAD, machine, and assemble competition hardware from the ground up.',
          },
          {
            id: `${id}-2`,
            icon: 'code',
            title: 'Autonomous Software',
            description: 'Vision tracking, path planning, and real-time telemetry built by student programmers.',
          },
          {
            id: `${id}-3`,
            icon: 'users',
            title: 'Mentorship & Leadership',
            description: 'Peer-led subteams teach project management, outreach, and engineering teamwork.',
          },
        ],
        style: {
          surface: 'raised',
          padding: 'normal',
          maxWidth: 'standard',
          textAlign: 'left',
          columns: 3,
          cardStyle: 'glass',
          animation: 'inherit',
        },
      };
    case 'stats':
      return {
        id,
        type,
        placement,
        eyebrow: 'By the Numbers',
        title: 'Season Snapshot',
        items: [
          { id: `${id}-1`, icon: 'trophy', value: '12+', title: 'Events Attended', description: 'Regional & invitational tournaments' },
          { id: `${id}-2`, icon: 'users', value: '60+', title: 'Student Builders', description: 'Across FRC, FTC, and VEX' },
          { id: `${id}-3`, icon: 'zap', value: '500+', title: 'Build Hours', description: 'Dedicated lab & testing time' },
        ],
        style: {
          surface: 'raised',
          padding: 'normal',
          maxWidth: 'standard',
          textAlign: 'center',
          columns: 3,
          cardStyle: 'solid',
          animation: 'inherit',
        },
      };
    case 'media-showcase':
      return {
        id,
        type,
        placement,
        eyebrow: 'Showcase',
        title: 'In Action',
        subtitle: 'Add competition photos, animated GIFs, or highlight videos.',
        items: [
          {
            id: `${id}-1`,
            title: 'Match Highlights',
            description: 'Competition action on the field.',
            media: '/images/comp/FRC_1.jpg',
          },
          {
            id: `${id}-2`,
            title: 'Pit & Prototyping',
            description: 'Iterating fast between qualification matches.',
            media: '/images/robotics/competition_working.jpg',
          },
        ],
        style: {
          surface: 'default',
          padding: 'normal',
          maxWidth: 'standard',
          textAlign: 'left',
          columns: 2,
          cardStyle: 'glass',
          animation: 'inherit',
        },
      };
    case 'cta':
      return {
        id,
        type,
        placement,
        eyebrow: 'Get Involved',
        title: 'Ready to Build With Us?',
        body: 'Whether you are a student looking to join a subteam or a partner interested in supporting STEM education, we would love to connect.',
        primaryButton: { label: 'Contact Us', href: '/contact' },
        secondaryButton: { label: 'View Sponsors', href: '/sponsors' },
        style: {
          surface: 'accent-glow',
          padding: 'spacious',
          maxWidth: 'narrow',
          textAlign: 'center',
          animation: 'inherit',
        },
      };
    case 'rich-text':
    default:
      return {
        id,
        type: 'rich-text',
        placement,
        eyebrow: 'Update',
        title: 'Section Heading',
        body: 'Write detailed announcements, program guidelines, or event information here. You can customize the surface, spacing, width, alignment, and colors to match the rest of the website.',
        style: {
          surface: 'default',
          padding: 'normal',
          maxWidth: 'narrow',
          textAlign: 'left',
          animation: 'inherit',
        },
      };
  }
}
