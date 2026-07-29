# User Stories

## Project

**Indom – Student Project Marketplace Platform**

## Version

**1.0**

## Author

**Nikish Bastola**

---

# Overview

This document captures the Agile user stories for Indom. The stories represent the business requirements from the perspective of the platform's primary stakeholders. These user stories serve as the foundation for sprint planning, backlog prioritization, feature development, and user acceptance testing.

---

# Epic 1 – User Registration & Authentication

## US-001 Student Registration

**As a** student seeking real-world project experience,

**I want** to create an account,

**So that** I can discover and apply for opportunities that align with my academic background and career interests.

### Business Value

Provides students with secure access to the platform while enabling personalized project recommendations and application tracking.

### Priority

**High**

### Acceptance Criteria

- Student can register using email and password.
- Student profile is created successfully.
- Student role is assigned automatically.
- Student can securely log into the platform.

---

## US-002 Organization Registration

**As an** organization representative,

**I want** to create an organization account,

**So that** I can post projects and recruit qualified student contributors.

### Business Value

Enables organizations to participate in the platform and efficiently recruit student talent.

### Priority

**High**

### Acceptance Criteria

- Organization account can be created.
- Organization role is assigned successfully.
- Organization can access organization-specific dashboard.

---

# Epic 2 – Project Management

## US-003 Create Project

**As an** organization,

**I want** to create project opportunities,

**So that** students can discover and apply for relevant work.

### Business Value

Provides organizations with an efficient method to advertise project opportunities while increasing student engagement.

### Priority

**High**

### Acceptance Criteria

- Project title is required.
- Project description is required.
- Required skills can be specified.
- Project is published successfully.
- Project appears in student listings.

---

## US-004 Manage Projects

**As an** organization,

**I want** to edit and manage existing projects,

**So that** project information remains accurate throughout the recruitment process.

### Business Value

Improves information quality while reducing applicant confusion.

### Priority

**Medium**

### Acceptance Criteria

- Organization can edit project details.
- Organization can archive inactive projects.
- Updates are reflected immediately.

---

# Epic 3 – Student Applications

## US-005 Browse Projects

**As a** student,

**I want** to browse available projects,

**So that** I can identify opportunities matching my interests and technical skills.

### Business Value

Improves project visibility and increases student participation.

### Priority

**High**

### Acceptance Criteria

- Students can browse active projects.
- Students can view project details.
- Required skills are displayed.
- Organization information is visible.

---

## US-006 Submit Application

**As a** student,

**I want** to submit an application,

**So that** organizations can evaluate my qualifications.

### Business Value

Creates a standardized application process across all projects.

### Priority

**High**

### Acceptance Criteria

- Student can submit an application.
- Student can include an application message.
- Application is stored successfully.
- Duplicate applications are prevented.

---

## US-007 Track Application Status

**As a** student,

**I want** to monitor my application status,

**So that** I understand my progress throughout the recruitment process.

### Business Value

Improves transparency while keeping applicants informed.

### Priority

**Medium**

### Acceptance Criteria

- Student can view submitted applications.
- Current application status is displayed.
- Status updates appear automatically.

---

# Epic 4 – Applicant Workflow

## US-008 Review Applicants

**As an** organization,

**I want** to review submitted applications,

**So that** I can identify qualified candidates.

### Business Value

Supports informed recruitment decisions and improves hiring efficiency.

### Priority

**High**

### Acceptance Criteria

- Organization can view applicant list.
- Applicant profile information is displayed.
- Resume is available when uploaded.
- Application message is visible.

---

## US-009 Manage Recruitment Workflow

**As an** organization,

**I want** to move applicants through recruitment stages,

**So that** the hiring process remains organized and measurable.

### Workflow States

- Applied
- Under Review
- Interviewing
- Accepted
- Rejected
- Completed

### Business Value

Creates a structured recruitment pipeline while improving operational visibility.

### Priority

**High**

### Acceptance Criteria

- Organization can update applicant status.
- Workflow changes are saved.
- Students can view updated status.

---

# Epic 5 – Analytics & Reporting

## US-010 View Analytics Dashboard

**As an** organization,

**I want** to view project performance metrics,

**So that** I can make data-driven recruitment decisions.

### Business Value

Provides visibility into recruitment performance and project engagement.

### Priority

**Medium**

### Acceptance Criteria

Dashboard displays:

- Total Projects
- Total Applications
- Pending Applications
- Accepted Applications
- Acceptance Rate
- Top Requested Skills
- Application Status Chart

---

## US-011 Export Applicant Data

**As an** organization,

**I want** to export applicant information,

**So that** I can perform offline reporting and operational analysis.

### Business Value

Supports reporting, auditing, and external analysis.

### Priority

**Medium**

### Acceptance Criteria

- CSV export is available.
- Applicant information is included.
- Download completes successfully.

---

# Epic 6 – Platform Administration

## US-012 Role-Based Access Control

**As a** platform administrator,

**I want** users to access only the functionality appropriate for their assigned role,

**So that** platform security and data integrity are maintained.

### Business Value

Protects sensitive information while enforcing role-based permissions.

### Priority

**High**

### Acceptance Criteria

- Students cannot access organization dashboards.
- Organizations cannot access administrative functionality.
- Unauthorized access attempts are restricted.
- Role permissions are enforced throughout the platform.

---

# Product Success Metrics

The following business metrics will be used to evaluate the success of Indom:

| KPI | Description |
|------|-------------|
| Registered Students | Total student accounts created |
| Active Organizations | Organizations actively posting projects |
| Projects Posted | Total published projects |
| Applications Submitted | Total applications received |
| Acceptance Rate | Accepted applications ÷ Total applications |
| Project Completion Rate | Completed projects ÷ Total projects |
| Average Applications per Project | Average applicant volume across projects |
| Analytics Dashboard Usage | Frequency of dashboard access by organizations |
| CSV Report Exports | Number of reporting exports generated |


