# Campus Echo 🎓

> **An anonymous bridge between students and administration.**

Campus Echo is a production-ready, full-stack anonymous feedback platform that empowers students to safely share complaints, suggestions, and concerns with their institution — without ever revealing their identity.

![Campus Echo](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

---

## ✨ Features

### For Students
- 🔒 **100% Anonymous** — Random aliases like `Echo#1842` assigned automatically
- 📝 **6 Post Types** — Complaints, Suggestions, Feedback, Confessions, Polls, Urgent
- 🗳️ **Voting System** — Upvote/downvote posts and comments
- 💬 **Threaded Comments** — Nested anonymous discussion
- 📎 **File Uploads** — Images and PDFs via Cloudinary
- 🔔 **Real-time Notifications** — Status changes, replies, announcements
- 🔖 **Bookmarks** — Save posts for later
- 📊 **Status Tracking** — Watch your issue move from Pending → Resolved
- 🔍 **Advanced Search** — Search and filter by category, type, status

### For Administration
- 📊 **Analytics Dashboard** — Recharts-powered charts and stats
- ✅ **Status Management** — Update post status with optional response
- 📢 **Announcements** — Broadcast messages to all students
- 👥 **User Management** — View, warn, ban/unban users
- 🏷️ **Category Management** — Create and manage post categories
- 🚨 **Moderation Queue** — Review and resolve reported content
- 💬 **Official Responses** — Respond to posts with admin badge

### Security
- 🔐 NextAuth.js with JWT sessions
- 🛡️ Route-level middleware protection
- ⚡ Rate limiting on all sensitive endpoints
- 🧹 Zod input validation on all forms
- 🔒 bcrypt password hashing (12 rounds)
- 🌐 Security headers on all responses
- 📧 Email verification required

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Backend** | Next.js Server Actions + API Routes |
| **Database** | PostgreSQL (NeonDB / Supabase) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js v5 (Auth.js) |
| **Storage** | Cloudinary |
| **Real-time** | Pusher |
| **Email** | Nodemailer (SMTP) |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (NeonDB, Supabase, or local)
- Cloudinary account (for file uploads)
- Pusher account (for real-time notifications)
- SMTP email credentials (Gmail, Resend, etc.)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/campus-echo.git
cd campus-echo
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see Environment Variables section below).

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# OR run migrations (production)
npm run db:migrate:prod

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusecho.app | Admin@123456 |
| Moderator | mod@campusecho.app | Mod@123456 |
| Student | student1@campusecho.app | Student@123 |

---

## 🔑 Environment Variables

Create a `.env.local` file with the following:

```env
# DATABASE
DATABASE_URL="postgresql://user:password@host/dbname"

# NEXTAUTH
NEXTAUTH_SECRET="your-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"

# GOOGLE OAUTH (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# CLOUDINARY
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# EMAIL (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Campus Echo <noreply@campusecho.app>"

# PUSHER
PUSHER_APP_ID="your-app-id"
PUSHER_APP_KEY="your-key"
PUSHER_APP_SECRET="your-secret"
PUSHER_CLUSTER="ap2"
NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"

# APP
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📁 Project Structure

```
campus-echo/
├── prisma/
│   ├── schema.prisma          # Full database schema
│   └── seed.ts                # Sample data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register, verify)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/       # Protected student dashboard
│   │   │   └── dashboard/
│   │   │       ├── page.tsx   # Feed
│   │   │       ├── create/    # New post
│   │   │       ├── notifications/
│   │   │       ├── bookmarks/
│   │   │       └── profile/
│   │   ├── (admin)/           # Admin panel
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── posts/
│   │   │       ├── users/
│   │   │       ├── categories/
│   │   │       ├── announcements/
│   │   │       └── moderation/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth handler
│   │   │   ├── upload/        # File upload endpoint
│   │   │   ├── search/        # Search endpoint
│   │   │   └── pusher/auth/   # Pusher channel auth
│   │   ├── post/[id]/         # Individual post page
│   │   ├── banned/            # Banned user page
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── not-found.tsx      # 404 page
│   │   └── globals.css        # Global styles
│   ├── actions/               # Server Actions
│   │   ├── posts.ts           # Post CRUD, voting, bookmarks
│   │   ├── comments.ts        # Comment CRUD, voting
│   │   ├── auth.ts            # Register, verify, password reset
│   │   ├── admin.ts           # Admin operations
│   │   └── notifications.ts   # Notification management
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/            # Sidebar, header, banners
│   │   ├── posts/             # Post card, filters, status badge
│   │   ├── comments/          # Comment section, threaded replies
│   │   ├── admin/             # Admin dashboard components
│   │   └── notifications/     # Notification list
│   ├── lib/
│   │   ├── prisma.ts          # Database client singleton
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── email.ts           # Email sending utilities
│   │   ├── cloudinary.ts      # File upload utilities
│   │   ├── pusher.ts          # Real-time utilities
│   │   └── utils.ts           # General utilities
│   ├── hooks/
│   │   └── use-toast.ts       # Toast notification hook
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── utils/
│   │   ├── anonymous.ts       # Alias generation
│   │   └── rate-limit.ts      # Rate limiting
│   └── middleware.ts          # Route protection middleware
├── .env.example
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database Schema

### Core Models

| Model | Description |
|-------|-------------|
| `User` | Students, moderators, admins with anonymous alias |
| `Post` | Complaints, suggestions, etc. with status tracking |
| `Comment` | Nested threaded anonymous comments |
| `Category` | Post categories managed by admin |
| `Vote` | Post upvotes/downvotes |
| `CommentVote` | Comment likes/dislikes |
| `Attachment` | Cloudinary file references |
| `Notification` | User notifications |
| `Report` | Content reports from users |
| `Bookmark` | Saved posts |
| `Announcement` | Admin broadcasts |
| `AdminResponse` | Official admin replies to posts |
| `ModerationLog` | Audit trail of moderator actions |
| `PollOption` | Options for poll-type posts |
| `PollVote` | Votes on poll options |
| `RateLimit` | Rate limiting tracking |

---

## 🚀 Deployment (Vercel + NeonDB)

### Step 1: Set Up NeonDB

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`)

### Step 2: Set Up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret

### Step 3: Set Up Pusher

1. Sign up at [pusher.com](https://pusher.com)
2. Create a new app → choose nearest cluster
3. Copy App ID, Key, Secret, Cluster

### Step 4: Set Up Google OAuth (Optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all other variables
```

### Step 6: Run Production Migrations

```bash
# Set DATABASE_URL to your NeonDB connection string
DATABASE_URL="your-neondb-url" npm run db:migrate:prod

# Seed production database (optional)
DATABASE_URL="your-neondb-url" npm run db:seed
```

### Step 7: Configure Vercel

In your Vercel project settings:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- Add all environment variables from `.env.example`

---

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate an app password for "Mail"
4. Use this as `SMTP_PASS`

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"  # 16-char app password
```

### Resend (Recommended for Production)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain

---

## 🔒 Security Considerations

- **Anonymous Architecture**: User identities are never exposed through the UI. The `anonymousAlias` field is a randomly generated identifier. Real email addresses are only used internally.
- **Rate Limiting**: All API endpoints and server actions are rate-limited using a database-backed system.
- **Input Validation**: All user inputs are validated with Zod schemas before processing.
- **Password Security**: Passwords are hashed with bcrypt using 12 rounds.
- **Session Security**: JWT tokens with rotating secrets, httpOnly cookies.
- **SQL Injection**: Prevented by Prisma's parameterized queries.
- **XSS Prevention**: Content is escaped before rendering. Security headers set on all responses.
- **File Upload Security**: MIME type validation, file size limits, malicious file prevention.
- **Admin Protection**: Role-based access control enforced at both middleware and action levels.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the incredible full-stack framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Prisma](https://prisma.io/) for the type-safe ORM
- [NextAuth.js](https://authjs.dev/) for authentication
- [Recharts](https://recharts.org/) for analytics charts

---

**Campus Echo** — *Because every student's voice deserves to be heard.*
