# Indom

**Build experience through real work.**

Indom is a project-based talent platform that connects students seeking real-world experience with researchers, startups, and organizations that have meaningful work to be done.

Instead of waiting for an internship to gain experience, students can discover scoped projects, apply their skills, and build evidence of what they can do.

---

## Why Indom?

Students face a common problem:

> You need experience to get an opportunity, but you need an opportunity to get experience.

At the same time, researchers, startups, and organizations often have valuable projects that need contributors but may not justify a traditional internship or full-time hire.

Indom connects these two sides.

### For Students

- Discover real-world projects
- Apply to opportunities aligned with your interests and skills
- Build practical experience
- Develop portfolio-worthy work
- Track applications and project opportunities
- Create a professional profile and showcase your resume

### For Organizations

- Post scoped projects
- Reach motivated student talent
- Review applicants
- Manage project opportunities
- Discover emerging talent through real work

---

## Product Discovery

Indom was developed through a customer-driven product process.

Before defining the product roadmap, I conducted **50+ customer discovery interviews** to better understand the challenges students face when trying to gain meaningful professional experience.

Insights from those conversations were synthesized into product requirements and used to prioritize the initial MVP.

The product continues to evolve through:

**Customer Discovery → Problem Definition → Prioritization → Build → Test → Launch → Measure → Iterate**

---

## Core Product Experience

### Student Experience

Students can:

- Create and manage a professional profile
- Upload a resume
- Add skills and professional links
- Browse available projects
- Review project details
- Apply to opportunities
- Track application status
- Manage their Indom experience through a responsive dashboard

### Organization Experience

Organizations can:

- Create an organization account
- Post project opportunities
- Manage project listings
- Review student applicants
- Manage applicant status
- Maintain an organization presence on Indom

### Admin Experience

Indom also includes administrative workflows for managing platform activity and organizations.

---

## Product Design

Indom uses a reusable, responsive design system built around:

- Light-first interface
- Consistent application navigation
- Reusable UI components
- Responsive layouts
- Accessible forms and controls
- Clear application and project states
- Purposeful empty, loading, and error states

The product is designed to work across desktop, tablet, and mobile experiences.

---

## Technology

### Frontend

- Next.js
- React
- TypeScript
- CSS

### Backend & Data

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage
- Row Level Security

### Development

- Git
- GitHub
- Vercel

---

## Architecture

Indom uses Next.js for the application layer and Supabase for backend services.

```text
                       Indom
                         │
                         ▼
                 Next.js / React
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
     Authentication   Application     Storage
          │              Data           │
          └──────────────┼──────────────┘
                         │
                         ▼
                      Supabase
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          PostgreSQL             Storage
```

Supabase handles authentication, persistent application data, storage, and authorization through Row Level Security.

---

## Product Areas

```text
Indom
│
├── Authentication
│   ├── Login
│   └── Signup
│
├── Student
│   ├── Dashboard
│   ├── Project Discovery
│   ├── Applications
│   └── Profile
│
├── Organization
│   ├── Dashboard
│   ├── Project Management
│   ├── Project Creation
│   └── Applicant Management
│
└── Admin
    └── Platform Management
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nikishrajbastola/taskforge.git
cd taskforge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file and configure the required Supabase environment variables.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit production credentials or private keys to the repository.

### 4. Start the development server

```bash
npm run dev
```

Then open the local address shown by Next.js in your browser.

---

## Product Development

Indom is being developed using an iterative product-development process.

Major features are approached through:

1. Customer/problem discovery
2. Product requirements
3. Prioritization
4. Feature implementation
5. QA and usability testing
6. Launch
7. Measurement
8. Iteration

Product requirements and research artifacts can be maintained under the `/docs` directory as the product evolves.

---

## Current Focus

Indom is currently focused on validating the core marketplace experience:

- Bringing real projects onto the platform
- Onboarding students
- Improving profile completion
- Increasing project discovery and applications
- Understanding marketplace activation
- Collecting user feedback
- Iterating on the MVP

---

## Product Principles

**Solve real problems first.**  
Features should address validated user needs rather than exist solely because they are technically interesting.

**Real data over vanity metrics.**  
Product decisions should be based on actual user behavior and feedback.

**Simple before sophisticated.**  
Build the smallest experience that solves the problem before introducing complexity.

**Trust matters.**  
Students and organizations should understand who they are interacting with and what is expected from them.

**Mobile is part of the product.**  
Responsive behavior is a requirement, not a later enhancement.

---

## Roadmap

Areas being explored include:

- Improved project discovery
- Better organization onboarding
- Marketplace activation
- Student profile improvements
- Application workflow improvements
- Product analytics
- User feedback and usability testing

Future features will be prioritized based on customer evidence and product usage rather than implemented solely for technical novelty.

---

## Status

🚧 **Indom is currently under active development and MVP validation.**

Features, workflows, and architecture may change as the product is tested with real users.

---

## Founder

**Nikish Bastola**

Founder & Product Lead, Indom  
Computer Science @ Texas State University

Built around a simple question:

> **How can students prove what they can do before someone gives them their first opportunity?**

---

## License

This project is currently maintained as the Indom product codebase. All rights reserved unless otherwise specified.
