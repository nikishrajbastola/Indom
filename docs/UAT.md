# User Acceptance Testing (UAT)

## Project

**Indom – Student Project Marketplace Platform**

## Version

**1.0**

## Author

**Nikish Bastola**

---

# 1. Purpose

The purpose of User Acceptance Testing (UAT) is to validate that Indom satisfies the documented business requirements and provides an intuitive user experience for its primary stakeholders.

Testing was conducted from the perspective of the following user groups:

- Students
- Organizations
- Platform Administrators

The objective of this testing phase is to verify that core business workflows function as expected before deployment.

---

# 2. Test Environment

| Item | Details |
|------|---------|
| Application | Indom |
| Frontend | Next.js |
| Backend | Supabase |
| Authentication | Supabase Auth |
| Database | PostgreSQL (Supabase) |
| Browser | Google Chrome |
| Environment | Local Development |

---

# 3. User Acceptance Test Cases

| Test ID | Feature | User Role | Test Scenario | Expected Result | Status |
|---------|----------|-----------|---------------|-----------------|--------|
| UAT-001 | Student Registration | Student | Register a new student account | Student account is successfully created | Pass |
| UAT-002 | Student Login | Student | Login using valid credentials | Student dashboard is displayed | Pass |
| UAT-003 | Invalid Login | Student | Login using incorrect password | Error message is displayed | Pass |
| UAT-004 | Project Browsing | Student | Browse available projects | Active projects are displayed | Pass |
| UAT-005 | View Project Details | Student | Open project details | Project information is displayed correctly | Pass |
| UAT-006 | Submit Application | Student | Apply for a project | Application is successfully submitted | Pass |
| UAT-007 | View Application Status | Student | Review submitted applications | Current application status is displayed | Pass |
| UAT-008 | Organization Registration | Organization | Create organization account | Organization account is successfully created | Pass |
| UAT-009 | Create Project | Organization | Publish a new project | Project appears in organization dashboard | Pass |
| UAT-010 | Edit Project | Organization | Modify project information | Updated project information is saved | Pass |
| UAT-011 | View Applicants | Organization | Review project applicants | Applicant list is displayed | Pass |
| UAT-012 | Update Applicant Status | Organization | Change status to "Under Review" | Status updates successfully | Pass |
| UAT-013 | Interview Applicant | Organization | Change status to "Interviewing" | Status updates successfully | Pass |
| UAT-014 | Accept Applicant | Organization | Change status to "Accepted" | Applicant status updates successfully | Pass |
| UAT-015 | Reject Applicant | Organization | Change status to "Rejected" | Applicant status updates successfully | Pass |
| UAT-016 | Complete Project | Organization | Mark applicant as "Completed" | Completion status is recorded | Pass |
| UAT-017 | Analytics Dashboard | Organization | View dashboard metrics | KPI cards load successfully | Pass |
| UAT-018 | Application Status Chart | Organization | View application status visualization | Chart displays application data correctly | Pass |
| UAT-019 | CSV Reporting | Organization | Export applicant information | CSV file downloads successfully | Pass |
| UAT-020 | Role-Based Access | Student | Attempt to access organization-only functionality | Access is restricted appropriately | Pass |

---

# 4. UAT Summary

| Metric | Result |
|---------|--------|
| Total Test Cases | 20 |
| Passed | 20 |
| Failed | 0 |
| Pass Rate | 100% |

---

# 5. Key Business Workflows Validated

The following end-to-end business workflows were successfully validated during UAT:

- Student registration and authentication
- Organization registration and authentication
- Project creation and management
- Student project discovery
- Project application submission
- Applicant review workflow
- Recruitment status management
- Analytics dashboard reporting
- CSV reporting and export
- Role-based access control

---

# 6. Business Acceptance

User Acceptance Testing confirms that the implemented functionality aligns with the documented business requirements defined within the Business Requirements Document (BRD).

The application supports the primary workflows required by students and organizations while providing analytics and reporting capabilities to support operational decision-making.

The completed UAT demonstrates that the implemented features satisfy the current project scope and are suitable for continued development and deployment.

---

# Prepared By

**Nikish Bastola**

Indom Student Project Marketplace Platform