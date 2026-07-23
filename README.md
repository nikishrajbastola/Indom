# Taskforge

A full-stack platform connecting students with organizations through real-world project opportunities.

## Live Demo 

**Live Demo** https://taskforge-puce.vercel.app/

## Project Overview

TaskForge is a full-stack web application designed to bridge the gap between students seeking hands-on experience and organizations looking for talented individuals to work on real-world projects.

Students can create an account, browse available opportunities, apply to projects, and track their application status. Organizations can securely manage projects, review applicants, update application statuses, and monitor project activity through an analytics dashboard.

This project demonstrates full-stack development, authentication, database management, data visualization, and business analysis documentation.

## Features

### Student Portal

- Secure account registration and login
- Browse available projects
- View project details
- Submit project applications
- Track application status through a dedicated student dashboard

### Organization Portal

- Secure account registration and login
- Dedicated organization dashboard
- Create and manage projects
- Review student applications
- Update application statuses
- View analytics dashboard
- Export applicant data to CSV

### Access Control

- Role-based authentication
- Separate dashboards for students and organizations
- Different features available based on user role


## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js, React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Data Visualization | Recharts |
| Deployment | Vercel |
| Containerization | Docker |
| Version Control | Git & GitHub |


## Project Structure


taskforge/
├── app/                 # Application pages, layouts, and routing
├── components/          # Reusable UI components
├── docs/                # Business analysis and project documentation
├── lib/                 # Supabase configuration and shared utilities
├── public/              # Static assets (images, icons, etc.)
├── Dockerfile           # Docker container configuration
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation

## Documentation

The `docs/` folder contains project planning and business analysis artifacts, including:

- Business Requirements Document (BRD)
- User Stories
- Use Case Diagram
- Process Flow Diagram
- System Architecture
- User Acceptance Testing (UAT)


## System Architecture

TaskForge uses a full-stack architecture built with Next.js and Supabase.


Students / Organizations
          │
          ▼
   Next.js Web Application
          │
          ├── Authentication
          ├── Project Management
          ├── Application Management
          └── Analytics Dashboard
          │
          ▼
      Supabase Backend
          │
          ├── Supabase Auth
          └── PostgreSQL Database
          │
          ▼
      Deployed on Vercel


Students and organizations interact with the Next.js frontend. Supabase Auth manages account registration and login, while the PostgreSQL database stores user profiles, projects, applications, and application statuses. The application is deployed through Vercel.