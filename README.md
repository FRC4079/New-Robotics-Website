# Oxford Academy Robotics Website

A modern, feature-rich website for Oxford Academy Robotics with a comprehensive inline content management system. Built with Next.js 15, TypeScript, and SCSS, this site showcases FRC Team 4079, FTC teams, and VEX programs while providing authenticated users with powerful editing capabilities.

## Overview

This website serves as the digital platform for Oxford Academy Robotics, providing information about competitive robotics programs, team achievements, news updates, and community engagement opportunities. The site features a custom-built CMS that allows authenticated administrators to edit content directly on the page without requiring database access or code deployment.

## Key Features

### Content Management System
- **Inline Editing**: Edit text, images, and styles directly on the page
- **Authentication-Based Access**: Edit Mode only available to authenticated users
- **Real-Time Updates**: Changes are immediately reflected in the UI
- **Style Editor**: Modify colors, fonts, spacing, and other CSS properties
- **Image Management**: Upload and replace images with live preview
- **JSON-Based Storage**: All content stored in `content/site-content.json`
- **Persistent Changes**: Edits are automatically saved and persisted

### Page Sections
- **Homepage**: Hero banner, about brief, statistics, team overview, achievements, and sponsors
- **About Page**: Mission/vision cards, program details, impact statistics, and call-to-action
- **News Section**: Fully editable articles with categories, tags, filtering, and add/delete functionality
- **Team Pages**: Dedicated pages for FRC, FTC, and VEX programs with schedules and details
- **Contact Page**: Contact form and information
- **Sponsors Page**: Recognition and information about team sponsors
- **Admin Portal**: Authentication and content management dashboard

### Design Features
- **Modern Glassmorphism UI**: Backdrop blur effects and translucent elements
- **Gradient Aesthetics**: Dynamic color gradients throughout the interface
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Consistent black and dark gray color scheme
- **Advanced Animations**: Fade-in effects, hover transitions, and smooth interactions
- **Accessibility**: Semantic HTML and ARIA-compliant components

## Technology Stack

### Core Framework
- **Next.js 15.5.4**: React framework with App Router architecture
- **React 19.2.0**: Latest React version with modern hooks and features
- **TypeScript 5.x**: Type-safe development environment

### Styling
- **SCSS Modules**: Component-scoped styling with CSS modules
- **Sass 1.93.2**: Advanced CSS preprocessing with variables and mixins
- **CSS3**: Modern CSS features including Grid, Flexbox, and custom properties

### Development Tools
- **ESLint**: Code quality and consistency enforcement
- **Next.js Fast Refresh**: Hot module replacement during development
- **TypeScript Compiler**: Static type checking

## Project Structure

```
├── app/                          # Next.js App Router directory
│   ├── _components/              # Reusable UI components
│   │   ├── aboutbrief/           # Homepage about section
│   │   ├── achievements/         # Achievements showcase
│   │   ├── competitionSchedule/  # Competition calendar
│   │   ├── contactForm/          # Contact form component
│   │   ├── footer/               # Site footer
│   │   ├── navbar/               # Navigation bar
│   │   ├── newsSection/          # News articles display
│   │   │   ├── editableArticle.tsx    # Individual article component
│   │   │   └── newsSection.tsx        # Main news section
│   │   ├── robotGallery/         # Robot image gallery
│   │   ├── slogan/               # Team slogan section
│   │   ├── stats/                # Statistics display
│   │   ├── teamMembers/          # Team member profiles
│   │   ├── teamOverviewSection/  # Team overview cards
│   │   ├── teamsOverview/        # Multiple teams overview
│   │   ├── teamStructure/        # Organizational structure
│   │   └── title/                # Page title component
│   ├── about/                    # About page
│   │   ├── page.tsx              # About page content
│   │   └── about.module.scss     # About page styles
│   ├── admin/                    # Admin portal
│   │   ├── login/                # Admin login page
│   │   ├── content/              # Content management interface
│   │   └── media/                # Media management
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── contact/              # Contact form submissions
│   │   ├── content/              # Content CRUD operations
│   │   └── media/                # Media upload/management
│   ├── contact/                  # Contact page
│   ├── frc/                      # FRC team page
│   ├── ftc/                      # FTC team page
│   ├── news/                     # News section page
│   ├── sponsors/                 # Sponsors page
│   ├── team/                     # Team information page
│   ├── uploads/                  # Serves files uploaded through the CMS
│   ├── vex/                      # VEX team page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Homepage
│   └── globals.scss              # Global styles
├── components/                   # Shared components
│   └── editable/                 # CMS editing components
│       ├── EditableImage.tsx     # Inline image editor
│       ├── EditableText.tsx      # Inline text editor
│       ├── EditToolbar.tsx       # Edit mode toolbar
│       └── StyleEditor.tsx       # CSS property editor
├── content/                      # Content storage
│   └── site-content.json         # All site content data
├── contexts/                     # React contexts
│   ├── AuthContext.tsx           # Admin session state
│   ├── ContentContext.tsx        # Site content state
│   └── EditModeContext.tsx       # Edit mode state management
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication hook
│   └── useContent.ts             # Content fetching hook
├── public/                       # Static assets
│   ├── images/                   # Site images
│   ├── logos/                    # Team and sponsor logos
│   └── handmade/                 # Custom graphics
├── utils/                        # Utility functions
│   ├── auth.ts                   # Signed admin sessions (server only)
│   ├── content.ts                # Content types
│   ├── contentStore.ts           # Reads and writes the content file (server only)
│   ├── globalFonts.ts            # Font configurations
│   ├── media.ts                  # Upload paths and safety checks (server only)
│   ├── rateLimit.ts              # Limits repeated attempts (server only)
│   ├── sponsors.ts               # Sponsor data utilities
│   └── styleHelpers.ts           # CSS helper functions
├── proxy.ts                      # Protects /admin routes
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.mjs             # ESLint configuration
└── Dockerfile                    # Docker containerization
```

## Getting Started

### Prerequisites

- Node.js 20.9 or higher (22 recommended)
- npm 10.x or higher
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/enVId-tech/New-Robotics-Website-Redesign.git

# Navigate to project directory
cd New-Robotics-Website-Redesign

# Install dependencies
npm install

# Create .env.local with the admin login (see Environment Variables)

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the website.

### Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Content Management

### Accounts

There are two kinds of account:

- **Super admin**: the `ADMIN_USERNAME` / `ADMIN_PASSWORD` login. Can edit everything, manage accounts and delete uploads.
- **Editors**: created by the super admin under **Accounts** (`/admin/users`). Each editor is given only the areas they need (for example News, or one team page). Permissions are checked on the server for every save and upload, and take effect on the next request. Accounts can be edited, disabled or deleted at any time, which also ends their open sessions.

Editors can change their own password under **My password**. Account data is kept in `USERS_FILE`, so keep it on the same volume as the content.

### Editing pages

1. Sign in at `/admin/login`
2. Choose **Edit pages** on the dashboard (or **Edit mode** in the navbar)
3. Click any highlighted text, image or icon on the page and change it
4. Review the list of unsaved changes in the bar at the bottom, then **Save** (or press Ctrl/Cmd+S). **Discard** drops everything not yet saved
5. Changes are stored in the content file (`content/site-content.json` by default, or `CONTENT_FILE`)

### News and newsletters

**News** in the admin sidebar is a form for articles: title, type (including Newsletter), date, summary, text, cover image and an optional external link such as a hosted newsletter PDF. Articles can be saved as drafts, which stay hidden from visitors until published.

### Editing Content

**Text Editing:**
- Click on any text element to edit inline
- Multi-line support for paragraphs and descriptions
- HTML-safe content sanitization

**Image Editing:**
- Click the edit icon on any image
- Upload new images via file picker
- Adjust image styles with the style editor

**Style Editing:**
- Click the style icon on editable elements
- Modify colors, fonts, spacing, borders, and more
- Preview changes in real-time

**News Management:**
- Add new articles with the "Add Article" button
- Delete articles with the delete button
- Edit all article fields: title, excerpt, author, date, category, tags, link
- Filter articles by category

### Content Structure

All content is stored in `content/site-content.json` with the following structure:

```json
{
  "site": { ... },
  "homepage": { ... },
  "about": {
    "hero": { ... },
    "mission": { ... },
    "programs": { ... },
    "impact": { ... },
    "join": { ... }
  },
  "news": {
    "hero": { ... },
    "articles": [ ... ]
  },
  "navigation": { ... },
  "footer": { ... }
}
```

## Deployment

The CMS stores edited content, uploaded images and contact messages on the
server's filesystem, so the site needs a host with persistent storage. Docker
with a volume is the supported setup. Serverless hosts such as Vercel have a
read-only filesystem, so editing would not work there.

### Docker

```bash
# Build Docker image
docker build -t oa-robotics-website .

# Run container, keeping all site data in a named volume
docker run -d -p 3000:3000 \
  -v oa-robotics-data:/app/data \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD='change-me' \
  -e SESSION_SECRET="$(openssl rand -hex 32)" \
  oa-robotics-website
```

Everything written at runtime lives in `/app/data`, so mount a volume there to
keep it across redeploys. The content file is created from the bundled
`content/site-content.json` the first time it is needed. The image runs as a
non-root user and ships only the built standalone server.

The session cookie is marked `Secure` in production, so serve the site over
HTTPS (a reverse proxy is fine). Plain `http://localhost` also works.

### Environment Variables

Set these in `.env.local` for development, or on the container in production.

| Variable | Required | Description |
| --- | --- | --- |
| `ADMIN_USERNAME` | Yes | Username of the super admin, who signs in at `/admin/login` |
| `ADMIN_PASSWORD` | Yes | Password of the super admin. It is never stored on disk; change it by changing this variable |
| `SESSION_SECRET` | Yes | Signs admin sessions. Use at least 32 random characters, for example `openssl rand -hex 32`. Changing it signs everyone out |
| `USERS_FILE` | No | Where team accounts are stored (passwords are hashed). Defaults to `data/users.json`; the Docker image uses `/app/data/users.json` |
| `CONTENT_FILE` | No | Where the edited content is stored. Defaults to `content/site-content.json`; the Docker image uses `/app/data/site-content.json` |
| `UPLOAD_DIR` | No | Where uploaded images are stored and served from at `/uploads`. Defaults to `data/uploads` |
| `MEDIA_BACKUP_DIR` | No | Where replaced and deleted uploads are copied. Defaults to `data/media-backups` |
| `CONTACT_FILE` | No | Contact form messages are appended here as JSON lines. Defaults to `data/contact-messages.jsonl` |
| `CONTACT_WEBHOOK_URL` | No | If set, each contact message is also posted to this URL (works with Slack and Discord webhooks, Zapier and similar) |

### Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm start       # run the production build
npm run lint    # ESLint
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Server-side rendering with Next.js App Router; pages are rendered with the current CMS content
- Standalone production build with a small Docker image
- Code splitting and lazy loading
- CSS modules for optimized stylesheets

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the existing code style
4. Test your changes thoroughly
5. Commit with descriptive messages: `git commit -m 'Add feature: description'`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a pull request with a detailed description

### Code Standards

- Use TypeScript for all new code
- Follow existing naming conventions
- Use SCSS modules for styling
- Ensure responsive design on all screen sizes
- Test Edit Mode functionality after changes
- Maintain accessibility standards

## Troubleshooting

### Common Issues

**Edit Mode not appearing:**
- Ensure you are logged in through `/admin/login`
- Check browser console for authentication errors
- Clear cookies and re-authenticate

**Content not saving:**
- Verify the content file (`CONTENT_FILE`, or `content/site-content.json` by default) has write permissions
- Check API routes are functioning
- Review browser console for errors

**Styling issues:**
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check for conflicting CSS modules

## Demo

- Production: [https://oarobotics.org](https://oarobotics.org)
- Alternative: [https://robotics.etran.dev](https://robotics.etran.dev)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Oxford Academy Robotics Team
- FIRST Robotics Competition
- FIRST Tech Challenge
- VEX Robotics Competition

## Contact

For questions or support, please contact the team through the website's contact form or visit our GitHub repository.

---

**Repository:** [https://github.com/enVId-tech/New-Robotics-Website-Redesign](https://github.com/enVId-tech/New-Robotics-Website-Redesign)

**Maintained by:** enVId-tech