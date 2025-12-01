# Console - Development TODO

## Phase 1: Authentication

### 🎉 Status: Phase 1 Core Complete!

**✅ All core authentication features are implemented and working:**

- Frontend API integration complete
- Auth context and state management working
- Form validation with Zod
- Route protection with Next.js middleware
- Token storage and automatic refresh
- Error handling and user feedback

**⚠️ Remaining (Optional/Enhancement):**

- Dashboard integration with real user data from `useAuth()`
- OAuth integration (GitHub button exists, needs handler)

---

### 📊 Current State Analysis

#### ✅ Completed

- **UI/UX Implementation**
  - Login page with Appwrite-inspired design
  - Signup page with terms acceptance
  - Password visibility toggle
  - Password requirements display
  - GitHub OAuth button (UI only)
  - Responsive design (mobile/desktop)
  - Dark theme styling
  - Form validation (basic HTML5 required)

#### ✅ Backend Status (Complete)

- **Backend Integration** ✅
  - ✅ All API endpoints implemented (`/api/v1/auth/*`)
  - ✅ User, Account, Session schemas created
  - ✅ MongoDB connection working
  - ✅ JWT/Passport setup complete
  - ✅ Argon2 password hashing implemented
  - ✅ Email service implemented (welcome, forgot password, password changed, verify)
  - ✅ Email verification endpoints ready
  - ✅ Token rotation implemented
  - ✅ All security measures in place (CORS, rate limiting, Helmet)

#### ✅ Frontend Integration (Complete)

- **Frontend Integration** ✅

  - ✅ API client created (`lib/api-client.ts`) with fetch wrapper
  - ✅ Auth API functions created (`lib/api/auth.ts`)
  - ✅ Environment variable configured (`NEXT_PUBLIC_API_URL`)
  - ✅ Request/response interceptors with automatic token refresh
  - ✅ Error handling utilities with timeout support
  - ✅ Form validation with Zod schemas
  - ✅ Password strength validation
  - ✅ Toast notifications (sonner) integrated
  - ✅ Real API calls (no more setTimeout mocks)

- **State Management** ✅

  - ✅ Auth context created (`contexts/auth-context.tsx`)
  - ✅ useAuth hook implemented
  - ✅ Token storage (localStorage + cookies for middleware)
  - ✅ Session management
  - ✅ User state persistence

- **Route Protection** ✅

  - ✅ Next.js middleware created (`middleware.ts`)
  - ✅ Protected `/dashboard/**` routes
  - ✅ Redirect logic (auth → dashboard, unauthenticated → login)
  - ⚠️ Dashboard still uses hardcoded user data (needs integration)

- **Additional Features** ✅
  - ✅ Forgot password page created and integrated
  - ✅ Password reset page created and integrated
  - ✅ Email verification page created and integrated
  - ⚠️ OAuth/GitHub integration (button exists, no handler)

---

### 🎯 Phase 1 Tasks

#### 1. Backend Setup (NestJS) ✅ COMPLETE

- [x] **Database Configuration**

  - [x] Set up MongoDB connection (Mongoose)
  - [x] Create database module
  - [x] Configure environment variables

- [x] **User Model/Schema**

  - [x] Create User, Account, Session schemas
  - [x] Add email uniqueness constraint
  - [x] Add password hashing with Argon2

- [x] **Auth Module**

  - [x] Create Auth module
  - [x] Create Auth controller
  - [x] Create Auth service
  - [x] Set up JWT strategies (Access & Refresh)
  - [x] Configure JWT secrets and expiration

- [x] **API Endpoints**

  - [x] `POST /api/v1/auth/register` - User registration
  - [x] `POST /api/v1/auth/login` - User login
  - [x] `POST /api/v1/auth/logout` - User logout
  - [x] `GET /api/v1/auth/me` - Get current user
  - [x] `POST /api/v1/auth/refresh` - Refresh token (with rotation)
  - [x] `POST /api/v1/auth/forgot-password` - Request password reset
  - [x] `POST /api/v1/auth/reset-password` - Reset password with token
  - [x] `POST /api/v1/auth/verify-email` - Verify email address

- [x] **Security**
  - [x] Implement password hashing (Argon2)
  - [x] Add rate limiting for auth endpoints
  - [x] Add CORS configuration
  - [x] Add request validation (DTOs)
  - [x] Add security headers (Helmet)

#### 2. Frontend API Integration ✅ COMPLETE

- [x] **API Client Setup**

  - [x] Create `lib/api-client.ts` - Fetch wrapper with timeout
  - [x] Create `lib/api/auth.ts` - Auth API functions
  - [x] Add environment variable `NEXT_PUBLIC_API_URL` (`.env.local`)
  - [x] Configure request/response interceptors
  - [x] Add error handling utilities with detailed logging
  - [x] Automatic token refresh on 401
  - [x] Token storage in localStorage and cookies

- [x] **Form Validation**

  - [x] Create Zod schemas for login/signup forms
  - [x] Integrate react-hook-form with Zod
  - [x] Add password strength validation
  - [x] Add email format validation
  - [x] Add real-time validation feedback with error messages

- [x] **API Integration**
  - [x] Replace setTimeout mock in login page
  - [x] Replace setTimeout mock in signup page
  - [x] Add error handling and display
  - [x] Add success notifications (toast)
  - [x] Add loading states

#### 3. State Management ✅ COMPLETE

- [x] **Auth Context**

  - [x] Create `contexts/auth-context.tsx`
  - [x] Create `hooks/use-auth.ts` (integrated in context)
  - [x] Implement user state management
  - [x] Implement token storage (localStorage + cookies for middleware)
  - [x] Add session persistence
  - [x] Skip auth check if no token (prevents unnecessary API calls)

- [x] **Auth Hooks**
  - [x] `useAuth()` - Get current auth state
  - [x] `login()` - Login mutation
  - [x] `register()` - Signup mutation
  - [x] `logout()` - Logout function
  - [x] `refreshUser()` - Refresh user data

#### 4. Route Protection ✅ COMPLETE

- [x] **Middleware**

  - [x] Create `middleware.ts` for route protection
  - [x] Protect `/dashboard/**` routes
  - [x] Redirect unauthenticated users to `/login`
  - [x] Redirect authenticated users away from `/login` and `/signup`
  - [x] Cookie-based token checking for middleware

- [ ] **Protected Routes**
  - [ ] Update dashboard layout to use real user data from `useAuth()`
  - [x] Add loading state while checking auth (in AuthProvider)
  - [ ] Add error boundary for auth errors

#### 5. Additional Features ✅ COMPLETE

- [x] **Forgot Password**

  - [x] Create forgot password page (`/forgot-password`)
  - [x] Add form with email input
  - [x] Integrate with backend API
  - [x] Add success message with proper UI
  - [x] Match login/signup design pattern

- [x] **Password Reset**

  - [x] Create reset password page (`/reset-password?token=...`)
  - [x] Add form with new password inputs
  - [x] Integrate with backend API
  - [x] Add token validation
  - [x] Password visibility toggle
  - [x] Password strength requirements
  - [x] Error handling for invalid/expired tokens

- [x] **Email Verification**

  - [x] Create email verification page (`/verify-email?token=...`)
  - [x] Add verification status display (loading, success, error)
  - [x] Integrate with backend API
  - [x] Auto-verify on page load
  - [x] Proper error handling

- [ ] **OAuth Integration** (Optional for Phase 1)
  - [ ] Set up GitHub OAuth app
  - [ ] Create backend OAuth endpoints
  - [ ] Integrate GitHub OAuth button
  - [ ] Handle OAuth callback

#### 6. Error Handling & UX ✅ COMPLETE

- [x] **Error Display**

  - [x] Error message display in forms (field-level)
  - [x] Display API errors in forms
  - [x] Add field-level error messages (Zod validation)
  - [x] Add toast notifications (using sonner)

- [x] **Loading States**

  - [x] Loading indicators on buttons
  - [x] Disable form during submission
  - [x] Loading state in auth context

- [x] **Success States**
  - [x] Add success messages (toast)
  - [x] Redirect after successful login/signup (to dashboard)
  - [ ] Show welcome message (optional)

#### 7. Testing & Documentation

- [ ] **Testing**

  - [ ] Test login flow
  - [ ] Test signup flow
  - [ ] Test error scenarios
  - [ ] Test protected routes
  - [ ] Test token expiration handling

- [ ] **Documentation**
  - [ ] Document API endpoints
  - [ ] Document environment variables
  - [ ] Add inline code comments
  - [ ] Update README with setup instructions

---

### 🔧 Technical Stack Decisions Needed

1. **Token Storage**

   - Option A: httpOnly cookies (more secure, CSRF protection needed)
   - Option B: localStorage (easier, but XSS vulnerable)
   - **Recommendation**: httpOnly cookies for production

2. **Form Management**

   - Already have: react-hook-form, zod
   - **Action**: Integrate them properly

3. **State Management**

   - Option A: React Context (simpler, good for auth)
   - Option B: Zustand/Redux (if more complex state needed later)
   - **Recommendation**: React Context for Phase 1

4. **API Client**
   - Option A: Axios (more features)
   - Option B: Native fetch (lighter, built-in)
   - **Recommendation**: Native fetch with wrapper

---

### 📝 Notes

- Backend is NestJS with MongoDB (Mongoose)
- Frontend is Next.js 16 with React 19
- UI uses shadcn/ui components
- Form validation: Zod + react-hook-form (already installed)
- Toast notifications: sonner (already installed)
- Current auth pages are UI-complete but non-functional

---

### 🚀 Priority Order

1. **High Priority** (Core functionality)

   - Backend auth endpoints
   - Frontend API integration
   - Auth context/state management
   - Route protection
   - Form validation

2. **Medium Priority** (User experience)

   - Error handling
   - Loading states
   - Success notifications
   - Password reset flow

3. **Low Priority** (Nice to have)
   - Email verification
   - OAuth integration
   - Advanced security features

---

## Settings Module (Frontend)

### 🎯 Overview

Comprehensive settings module for user account management, profile customization, notification preferences, and application settings.

### ✅ Completed

- Settings layout and navigation (responsive with mobile support)
- Profile settings page with full API integration and Danger Zone
- Sessions management page with device detection
- Security settings page (password change form)
- Preferences settings page (appearance, dashboard, editor, data export)
- Profile API integration (`updateProfile`)

### 📋 Settings Module Tasks

#### 1. Settings Layout & Navigation

- [x] **Settings Dashboard**

  - [x] Create settings layout (`/dashboard/settings`)
  - [x] Create settings navigation sidebar
  - [x] Add settings menu items (Profile, Notifications, Preferences, Security, etc.)
  - [x] Add active state indicators
  - [x] Add separator between nav and content
  - [ ] Make navigation responsive (mobile menu)

- [x] **Settings Container**
  - [x] Create reusable settings container component
  - [x] Add settings header with breadcrumbs (via AppHeader)
  - [x] Add settings content area
  - [x] Settings layout properly positioned (nav stays on left)

#### 2. Profile Settings ✅ COMPLETE

- [x] **Profile Settings Page** (`/settings/profile`)

  - [x] Display current user profile information
  - [x] Create profile form with fields:
    - [x] First Name
    - [x] Last Name
    - [x] Display Name
    - [x] Username (read-only)
    - [x] Email (read-only)
    - [x] Bio/About Me (textarea)
    - [x] Location
    - [x] Website/Portfolio URL
    - [ ] Avatar upload component
  - [x] Add form validation (Zod schema)
  - [x] Add save/cancel buttons
  - [x] Add loading states
  - [x] Add success/error notifications
  - [x] Integrate with backend API
  - [x] Add "Danger Zone" section with delete account functionality

- [ ] **Avatar Management**

  - [ ] Create avatar upload component
  - [ ] Add image preview
  - [ ] Add image cropping (optional)
  - [ ] Add image size/format validation
  - [ ] Add remove avatar option
  - [ ] Integrate with file upload API

- [x] **Profile API Integration**
  - [x] Create `lib/api/settings.ts` for profile API calls
  - [x] Add `updateProfile()` function
  - [x] Add error handling
  - [ ] Add `uploadAvatar()` function (pending file upload service)

#### 3. Notification Settings

- [ ] **Notification Settings Page** (`/settings/notifications`)

  - [ ] Create notification preferences form
  - [ ] Add notification categories:
    - [ ] **In-App Notifications**
      - [ ] System notifications
      - [ ] Project updates
      - [ ] Team mentions
      - [ ] Activity feed
    - [ ] **Push Notifications** (if implemented)
      - [ ] Enable push notifications
      - [ ] Browser push settings
      - [ ] Mobile push settings
  - [ ] Add toggle switches for each preference
  - [ ] Add save/cancel buttons
  - [ ] Add loading states
  - [ ] Integrate with backend API (`/api/v1/notifications/preferences`)

- [ ] **Email Preferences Page** (`/settings/email`)

  - [ ] Create email preferences form
  - [ ] Add email notification categories:
    - [ ] **Account Activity**
      - [ ] Login notifications
      - [ ] Password changes
      - [ ] Email changes
      - [ ] Security alerts
    - [ ] **Marketing & Updates**
      - [ ] Marketing emails (optional)
      - [ ] Weekly digest
      - [ ] Product updates
      - [ ] Feature announcements
  - [ ] Add toggle switches for each preference
  - [ ] Add save/cancel buttons
  - [ ] Add loading states
  - [ ] Integrate with backend API (`/api/v1/email/preferences`)

- [ ] **Notification Preferences API**

  - [ ] Add `getNotificationPreferences()` function
  - [ ] Add `updateNotificationPreferences()` function
  - [ ] Add notification preference types/interfaces

- [ ] **Email Preferences API**
  - [ ] Add `getEmailPreferences()` function
  - [ ] Add `updateEmailPreferences()` function
  - [ ] Add email preference types/interfaces

#### 4. Preferences Settings ✅ COMPLETE

- [x] **Preferences Settings Page** (`/settings/preferences`)

  - [x] Create preferences form with react-hook-form
  - [x] Add preference categories:
    - [x] **Appearance**
      - [x] Theme selection (Light, Dark, System)
      - [x] Language selection
      - [x] Date format
      - [x] Time format
      - [x] Timezone
    - [x] **Dashboard**
      - [x] Default dashboard view (Grid, List, Table)
      - [x] Items per page
      - [x] Show/hide widgets toggle
    - [x] **Editor**
      - [x] Editor theme (Light, Dark, Monokai, GitHub)
      - [x] Font size (10-24)
      - [x] Line height (1-3)
      - [x] Tab size (2-8)
    - [x] **Data & Privacy**
      - [x] Data export option with download
  - [x] Add save/cancel buttons
  - [x] Add loading states
  - [x] localStorage integration for client-side preferences
  - [ ] Backend API integration (optional - can be added later)

- [ ] **Preferences API Integration** (Optional)
  - [ ] Add `getPreferences()` function
  - [ ] Add `updatePreferences()` function
  - [ ] Add preference types/interfaces
  - [x] Handle client-side preferences (theme, etc.) - localStorage implemented

#### 5. Security Settings

- [x] **Security Settings Page** (`/settings/security`)

  - [x] Password change form implemented
  - [x] Password change API integration complete

- [x] **Sessions Page** (`/settings/sessions`)

  - [x] Dedicated sessions management page created
  - [x] List active and inactive sessions
  - [x] Device information display (browser, OS, device type)
  - [x] Current device identification and badge
  - [x] Revoke individual sessions
  - [x] Revoke all sessions (except current)
  - [x] Responsive design with mobile support

  - [x] Create security settings form
  - [x] Add security sections:
    - [x] **Password**
      - [x] Change password form
      - [x] Current password field
      - [x] New password field
      - [x] Confirm password field
      - [x] Password strength indicator
    - [ ] **Two-Factor Authentication** (if implemented)
      - [ ] Enable/disable 2FA
      - [ ] Setup 2FA flow
      - [ ] Backup codes display
    - [x] **Active Sessions**
      - [x] UI structure for active sessions
      - [x] List active sessions (integrate with backend)
      - [x] Show device, location, last activity
      - [x] Add "Sign out from all devices" option
      - [x] Add "Revoke session" for individual sessions
      - [x] Add "Current Device" badge identification
    - [ ] **API Keys** (if applicable)
      - [ ] List API keys
      - [ ] Create new API key
      - [ ] Revoke API key
  - [x] Add save/cancel buttons
  - [x] Add loading states
  - [ ] Integrate with backend API

- [x] **Security API Integration**
  - [x] Add `changePassword()` function
  - [x] Add `getActiveSessions()` function
  - [x] Add `revokeSession()` function
  - [x] Add `revokeAllSessions()` function

#### 6. Account Settings

- [x] **Account Settings Page** (`/settings/account`)

  - [x] Create dedicated account settings page
  - [x] Add account information section:
    - [x] Account creation date display
    - [x] Last login date display
    - [x] Account status display (Active/Inactive)
    - [x] Email verification status
    - [x] Account type (Email/OAuth)
  - [x] Add data export section:
    - [x] "Download Your Data" button
    - [x] Export format options (JSON, CSV)
    - [x] Include all user data (profile, portfolio, sessions, etc.)
    - [x] Generate and download data export file
  - [x] Add account deletion section (Danger Zone):
    - [x] Move delete account from profile page
    - [x] Request account deletion button (sends confirmation email)
    - [x] Account deletion confirmation flow:
      - [x] Confirmation token input field
      - [x] Delete account button (disabled until token provided)
      - [x] Warning messages about permanent deletion
      - [x] List of data that will be deleted
    - [x] Confirmation dialog for final deletion
    - [x] Loading states for delete operation
  - [x] Add deactivate account option (optional):
    - [x] Deactivate account button
    - [x] Reactivate account option
    - [x] Confirmation dialog
  - [x] Add account settings navigation link in settings sidebar

- [x] **Account API Integration**
  - [x] Add `requestAccountDeletion()` function (sends confirmation email)
  - [x] Add `deleteAccount(confirmationToken)` function (with confirmation token)
  - [x] Add `exportAccountData()` function (downloads user data)
  - [x] Add `deactivateAccount()` function (optional)
  - [x] Add `reactivateAccount()` function (optional)

#### 7. Shared Components

- [ ] **Settings Components**

  - [ ] Create `SettingsLayout` component
  - [ ] Create `SettingsNav` component
  - [ ] Create `SettingsSection` component
  - [ ] Create `SettingsCard` component
  - [ ] Create `ToggleSwitch` component (for preferences)
  - [ ] Create `SelectDropdown` component (for dropdowns)
  - [ ] Create `ConfirmationDialog` component (for destructive actions)

- [ ] **Form Components**
  - [ ] Create reusable form field components
  - [ ] Create form validation helpers
  - [ ] Create form error display components

#### 8. State Management

- [ ] **Settings Context**

  - [ ] Create `contexts/settings-context.tsx`
  - [ ] Add settings state management
  - [ ] Add `useSettings()` hook
  - [ ] Add settings loading states
  - [ ] Add settings update functions

- [ ] **Preferences Hook**
  - [ ] Create `hooks/usePreferences.ts`
  - [ ] Handle theme switching
  - [ ] Handle language switching
  - [ ] Persist preferences (localStorage or API)

#### 9. API Integration

- [ ] **Settings API Client**

  - [ ] Create `lib/api/settings.ts`
  - [ ] Add all settings-related API functions
  - [ ] Add error handling
  - [ ] Add TypeScript interfaces

- [ ] **Validation Schemas**
  - [ ] Create `lib/validations/settings.ts`
  - [ ] Add Zod schemas for:
    - [ ] Profile update
    - [ ] Password change
    - [ ] Notification preferences
    - [ ] App preferences

#### 10. UI/UX Enhancements

- [ ] **Settings Styling**

  - [ ] Create `app/(dashboard)/settings/settings.css`
  - [ ] Style settings navigation
  - [ ] Style settings forms
  - [ ] Add responsive design
  - [ ] Add dark mode support

- [ ] **User Feedback**

  - [ ] Add toast notifications for all actions
  - [ ] Add loading spinners
  - [ ] Add success/error messages
  - [ ] Add confirmation dialogs for destructive actions

- [ ] **Accessibility**
  - [ ] Add proper ARIA labels
  - [ ] Add keyboard navigation
  - [ ] Add focus management
  - [ ] Ensure screen reader compatibility

---

### 🚀 Settings Module Priority Order

1. **High Priority** (Core Settings)

   - Settings Layout & Navigation
   - Profile Settings
   - Security Settings (Password Change)

2. **Medium Priority** (User Experience)

   - Notification Settings
   - Preferences Settings
   - Account Settings

3. **Low Priority** (Nice to have)
   - Advanced security (2FA, API keys)
   - Data export/import
   - Advanced preferences

---

### 📝 Settings Module Notes

- **Theme Management**: Consider using a theme provider (e.g., next-themes) for theme switching
- **Local Storage**: Some preferences (theme, language) can be stored client-side for instant updates
- **API Storage**: User-specific preferences should be stored in the backend
- **Security**: All security-related actions should require password confirmation
- **Validation**: All forms should have proper validation before submission
- **Error Handling**: Provide clear error messages for all failed operations

---

## Phase 2: Portfolio Data Management

### 🎯 Overview

Portfolio management system for managing personal portfolio data including projects, companies, skills, experiences, and other portfolio-related content.

### 📋 Phase 2 Tasks

#### 1. Portfolio Project Management

- [x] **Backend**

  - [x] Create `portfolio-project` module
  - [x] Create Project schema (title, description, image, url, githubUrl, tags, technologies, startDate, endDate, featured, order, etc.)
  - [x] Create Project DTOs (CreateProjectDto, UpdateProjectDto, ProjectResponseDto)
  - [x] Create Project service (CRUD operations)
  - [x] Create Project controller (REST API endpoints)
  - [ ] Add image upload support (optional)
  - [x] Add project ordering/sorting

- [ ] **Frontend**
  - [x] Create project list page (`/portfolio/projects`)
  - [x] Create project form (create/edit)
  - [x] Create project card component
  - [x] Add project filtering and search
  - [ ] Add project drag-and-drop reordering
  - [ ] Add image upload component
  - [x] Integrate with backend API

#### 2. Portfolio Company Management

- [x] **Backend**

  - [x] Create `portfolio-company` module
  - [x] Create Company schema (name, logo, website, description, industry, location, foundedYear, etc.)
  - [x] Create Company DTOs
  - [x] Create Company service (CRUD operations)
  - [x] Create Company controller (REST API endpoints)
  - [ ] Add logo upload support

- [x] **Frontend**
  - [x] Create company list page (`/portfolio/companies`)
  - [x] Create company form (create/edit)
  - [x] Create company card component
  - [x] Add company filtering
  - [ ] Add logo upload component
  - [x] Integrate with backend API

#### 3. Portfolio Skill Management

- [x] **Backend**

  - [x] Create `portfolio-skill` module
  - [x] Create Skill schema (name, category, level, icon, color, order, etc.)
  - [x] Create Skill DTOs
  - [x] Create Skill service (CRUD operations)
  - [x] Create Skill controller (REST API endpoints)
  - [x] Add skill categories (Frontend, Backend, Database, DevOps, etc.)

- [x] **Frontend**
  - [x] Create skill list page (`/portfolio/skills`)
  - [x] Create skill form (create/edit)
  - [x] Create skill card/badge component
  - [x] Add skill grouping by category
  - [x] Add skill level visualization
  - [x] Add drag-and-drop reordering
  - [x] Integrate with backend API

#### 4. Portfolio Experience Management

- [x] **Backend**

  - [x] Create `portfolio-experience` module
  - [x] Create Experience schema (title, company, location, startDate, endDate, current, description, achievements, technologies, etc.)
  - [x] Create Experience DTOs
  - [x] Create Experience service (CRUD operations)
  - [x] Create Experience controller (REST API endpoints)
  - [x] Link experiences to companies (optional)

- [x] **Frontend**
  - [x] Create experience list page (`/portfolio/experiences`) using data-table
  - [x] Create experience form (create/edit)
  - [x] Create experience timeline component (dates column with formatted range)
  - [x] Add date range validation
  - [x] Add "current position" toggle
  - [x] Integrate with backend API

#### 5. Portfolio Education Management

- [x] **Backend**

  - [x] Create `portfolio-education` module
  - [x] Create Education schema (institution, degree, field, startDate, endDate, gpa, description, etc.)
  - [x] Create Education DTOs
  - [x] Create Education service (CRUD operations)
  - [x] Create Education controller (REST API endpoints)

- [x] **Frontend**
  - [x] Create education list page (`/portfolio/education`) using data-table
  - [x] Create education form (create/edit)
  - [x] Create education timeline component (dates column with formatted range)
  - [x] Integrate with backend API

#### 6. Portfolio Certification Management

- [x] **Backend**

  - [x] Create `portfolio-certification` module
  - [x] Create Certification schema (name, issuer, issueDate, expiryDate, credentialId, credentialUrl, etc.)
  - [x] Create Certification DTOs
  - [x] Create Certification service (CRUD operations)
  - [x] Create Certification controller (REST API endpoints)

- [x] **Frontend**
  - [x] Create certification list page (`/portfolio/certifications`) - using data-table like companies/projects
  - [x] Create certification form (create/edit)
  - [x] Create certification table component
  - [x] Add expiry date tracking (expired/expiring soon/valid badges)
  - [x] Integrate with backend API

#### 7. Portfolio Blog/Article Management

- [x] **Backend**

  - [x] Create `portfolio-blog` or `portfolio-article` module
  - [x] Create Blog schema (title, slug, content, excerpt, coverImage, published, publishedAt, tags, etc.)
  - [x] Create Blog DTOs
  - [x] Create Blog service (CRUD operations)
  - [x] Create Blog controller (REST API endpoints)
  - [x] Add markdown support (optional)

- [x] **Frontend**
  - [x] Create blog list page (`/portfolio/blog`) - using data-table like companies/projects
  - [x] Create blog editor (create/edit)
  - [x] Add markdown editor (textarea with markdown support)
  - [ ] Add preview functionality (can be enhanced later)
  - [x] Add publish/unpublish toggle (Switch component)
  - [x] Integrate with backend API

#### 8. Portfolio Testimonial Management

- [x] **Backend**

  - [x] Create `portfolio-testimonial` module
  - [x] Create Testimonial schema (name, role, company, content, avatar, rating, featured, order, etc.)
  - [x] Create Testimonial DTOs
  - [x] Create Testimonial service (CRUD operations)
  - [x] Create Testimonial controller (REST API endpoints)

- [x] **Frontend**
  - [x] Create testimonial list page (`/portfolio/testimonials`) - using data-table like companies/projects
  - [x] Create testimonial form (create/edit)
  - [x] Create testimonial table component
  - [ ] Add drag-and-drop reordering (can be enhanced later)
  - [x] Integrate with backend API

#### 9. Portfolio Contact/Social Links Management

- [x] **Backend**

  - [x] Create `portfolio-contact` or `portfolio-social` module
  - [x] Create Contact schema (platform, url, icon, order, active, etc.)
  - [x] Create Contact DTOs
  - [x] Create Contact service (CRUD operations)
  - [x] Create Contact controller (REST API endpoints)

- [x] **Frontend**
  - [x] Create contact links page (`/portfolio/contacts`) - using data-table like companies/projects
  - [x] Create contact form (create/edit)
  - [x] Add platform presets (GitHub, LinkedIn, Twitter, etc.) - dropdown with auto-icon fill
  - [x] Add icon field (auto-filled for preset platforms, can be customized)
  - [x] Integrate with backend API

#### 10. Portfolio Settings/Profile Management

- [x] **Backend**

  - [x] Create `portfolio-profile` or extend user profile
  - [x] Create Profile schema (bio, avatar, resumeUrl, location, availableForHire, etc.)
  - [x] Create Profile DTOs
  - [x] Create Profile service (CRUD operations)
  - [x] Create Profile controller (REST API endpoints)

- [x] **Frontend**
  - [x] Create profile settings page (`/portfolio/profile`) - using Card layout
  - [x] Create profile form with all fields (bio, location, portfolioUrl, theme, availableForHire)
  - [x] Add avatar URL input (with preview) - file upload coming soon
  - [x] Add resume URL input (with link) - file upload coming soon
  - [x] Integrate with backend API (GET, PATCH, POST avatar, POST resume)

#### 11. Common Features

- [ ] **Backend**

  - [ ] Add image upload service (local or cloud storage)
  - [ ] Add file upload service (for resumes, documents)
  - [ ] Add ordering/sorting support for all portfolio items
  - [ ] Add soft delete support
  - [ ] Add bulk operations (delete, reorder, etc.)
  - [ ] Add portfolio item relationships (e.g., project → skills, experience → company)

- [ ] **Frontend**
  - [ ] Create shared components (ImageUpload, FileUpload, DragDropList, etc.)
  - [ ] Create dashboard layout with navigation
  - [ ] Add data tables with sorting/filtering
  - [ ] Add bulk selection and actions
  - [ ] Add confirmation dialogs
  - [ ] Add toast notifications for all operations
  - [ ] Add loading states and skeletons

#### 12. Portfolio Preview/Public View

- [ ] **Backend**

  - [ ] Create public portfolio API endpoints (read-only)
  - [ ] Add portfolio visibility settings
  - [ ] Add portfolio theme/settings

- [ ] **Frontend**
  - [ ] Create public portfolio page (`/portfolio/[username]`)
  - [ ] Create portfolio preview component
  - [ ] Add portfolio theme customization
  - [ ] Add portfolio sharing functionality

#### 13. Standard Reusable Response Handlers (Frontend)

- [x] Create response type definitions (`lib/types/api-response.ts`)

  - [x] Define `SuccessResponse<T>` interface
  - [x] Define `PaginatedResponse<T>` interface
  - [x] Define `ErrorResponse` interface
  - [x] Define `PaginationMeta` interface
  - [x] Add type guards (`isSuccessResponse`, `isPaginatedResponse`, `isErrorResponse`)

- [x] Update API client to handle standardized responses (`lib/api-client.ts`)

  - [x] Add response transformation utilities
  - [x] Extract `data` from `SuccessResponse` automatically (via `extractData` option)
  - [x] Extract `data` and `pagination` from `PaginatedResponse` automatically
  - [x] Handle error responses consistently
  - [x] Add type-safe response helpers (`getData`, `getPaginatedData`, `postData`, `patchData`, `putData`)

- [x] Create response helper utilities (`lib/utils/response.util.ts`)

  - [x] `extractData<T>()` - Extract data from SuccessResponse
  - [x] `extractPaginatedData<T>()` - Extract data and pagination from PaginatedResponse
  - [x] `extractPagination()` - Extract pagination metadata
  - [x] Backward compatibility support for legacy response formats

- [ ] Update API functions to use standardized response types:

  - [x] **Auth API** (`lib/api/auth.ts`)
    - [x] `register()` - Handle SuccessResponse<AuthResponseDto>
    - [x] `login()` - Handle SuccessResponse<AuthResponseDto>
    - [x] `refreshToken()` - Handle SuccessResponse<AuthResponseDto>
    - [x] `getCurrentUser()` - Handle SuccessResponse<UserResponseDto>
    - [x] `forgotPassword()` - Handle SuccessResponse
    - [x] `resetPassword()` - Handle SuccessResponse
    - [x] `verifyEmail()` - Handle SuccessResponse
  - [x] **Settings API** (`lib/api/settings.ts`)
    - [x] `updateProfile()` - Handle SuccessResponse<UserResponseDto>
    - [x] `getActiveSessions()` - Handle SuccessResponse<SessionResponseDto[]> (with backward compatibility)
    - [x] `revokeSession()` - Handle SuccessResponse
    - [x] `revokeAllSessions()` - Handle SuccessResponse
    - [x] `changePassword()` - Handle SuccessResponse (moved from auth.ts)
  - [x] **Portfolio API** (`lib/api/portfolio.ts`)
    - [x] All project endpoints - Handle SuccessResponse/PaginatedResponse (using `getPaginatedData`, `getData`, `postData`, `patchData`)
    - [x] All company endpoints - Handle SuccessResponse/PaginatedResponse (using `getPaginatedData`, `getData`, `postData`, `patchData`)
    - [x] All skill endpoints - Handle SuccessResponse (using `getData`, `postData`, `patchData`)
    - [x] All experience endpoints - Handle SuccessResponse/PaginatedResponse (using `getPaginatedData`, `getData`, `postData`, `patchData`)
    - [x] All education endpoints - Handle SuccessResponse/PaginatedResponse (using `getPaginatedData`, `getData`, `postData`, `patchData`)
    - [x] All certification endpoints - Handle SuccessResponse/PaginatedResponse (using `getPaginatedData`, `getData`, `postData`, `patchData`)
    - [x] All blog endpoints - Handle SuccessResponse/PaginatedResponse (using `getPaginatedData`, `getData`, `postData`, `patchData`)
    - [x] All testimonial endpoints - Handle SuccessResponse/PaginatedResponse (using `getPaginatedData`, `getData`, `postData`, `patchData`)
    - [x] All contact endpoints - Handle SuccessResponse/PaginatedResponse (using `getPaginatedData`, `getData`, `postData`, `patchData`)
    - [x] Profile endpoints - Handle SuccessResponse<PortfolioProfileResponseDto> (using `getData`, `patchData`, `postData`)
  - [x] **Upload API** (`lib/api/upload.ts`)
    - [x] Create upload API client functions (uploadImage, uploadImages, uploadDocument, uploadAvatar, uploadResume)
    - [x] All upload endpoints - Handle SuccessResponse<UploadResponseDto> with automatic data extraction
    - [x] FormData handling for file uploads (Content-Type header automatically set by browser)
    - [x] Updated apiClient to detect FormData and skip Content-Type header (browser sets multipart/form-data with boundary)
    - [x] UploadResponseDto interface matching backend structure (filename, originalName, mimetype, size, url, thumbnailUrl)
    - [x] Error handling and validation (max 10 files for multiple uploads)

- [x] Update Portfolio API functions (`lib/api/portfolio.ts`)

  - [x] All list endpoints now use `getPaginatedData()` and return `{ data, pagination }`
  - [x] All single item endpoints use `getData()`
  - [x] All create/update endpoints use `postData()` / `patchData()`
  - [x] Updated response types to match standardized format

- [ ] Update components/hooks to use standardized response format:
  - [x] Update portfolio projects page to handle paginated responses
  - [x] Update portfolio companies page to handle paginated responses
  - [x] Update portfolio skills page (skills don't use pagination, but API updated)
  - [x] Update portfolio experiences page - Handle paginated responses with server-side pagination
  - [x] Update portfolio education page - Handle paginated responses with server-side pagination
  - [x] Update portfolio certifications page - Handle paginated responses with server-side pagination
  - [x] Update portfolio blog page - Handle paginated responses
  - [x] Update portfolio testimonials page - Handle paginated responses with server-side pagination
  - [x] Update portfolio contacts page - Handle paginated responses with server-side pagination
  - [x] Update portfolio profile page - Already using standardized response (getData)
  - [x] Update all forms to handle success/error responses (forms already handle errors via toast notifications)
  - [x] Update data tables to use pagination metadata from backend
    - [x] Updated DataTable component to accept optional `pagination` prop
    - [x] DataTable now uses backend pagination metadata (hasNextPage, hasPreviousPage, totalPages) when available
    - [x] Updated all table components (ProjectTable, CompanyTable, ExperienceTable, EducationTable, CertificationTable, BlogTable, TestimonialTable, ContactTable) to accept and pass pagination prop
    - [x] Updated all portfolio pages to pass pagination metadata to tables
  - [x] Update loading states based on response structure
    - [x] Loading states already properly handled via `isLoading` prop
    - [x] Loading state shows "Loading..." message in table body when `isLoading={true}`

---

### 🚀 Phase 2 Priority Order

1. **High Priority** (Core Portfolio Data)

   - Portfolio Project Management
   - Portfolio Experience Management
   - Portfolio Skill Management
   - Portfolio Profile/Settings

2. **Medium Priority** (Additional Content)

   - Portfolio Company Management
   - Portfolio Education Management
   - Portfolio Certification Management
   - Portfolio Contact/Social Links

3. **Low Priority** (Nice to have)
   - Portfolio Blog/Article Management
   - Portfolio Testimonial Management
   - Portfolio Preview/Public View
   - Advanced features (themes, sharing, etc.)

---

## Phase 3: Admin Dashboard & Monitoring

### 🎯 Overview

Admin dashboard for monitoring system health, queue status, cron jobs, and infrastructure metrics. This dashboard is only accessible to owners/admins.

### 📋 Admin Dashboard Tasks

#### 1. Admin Dashboard Layout

- [x] **Admin Dashboard Page** (`/admin/dashboard`)
  - [x] Create admin dashboard layout (only accessible to owners) - `app/(private)/admin/layout.tsx`
  - [x] Add admin navigation sidebar - `components/layout/admin/admin-nav.tsx`
  - [x] Add admin header with breadcrumbs - Uses existing `AppHeader` component
  - [x] Add role-based access control (owner-only routes) - Layout checks user.role === "owner" and redirects
  - [x] Add admin dashboard overview cards (system status, queue health, etc.) - Dashboard page with status cards and queue statistics
  - [x] Update middleware to protect `/admin` routes
  - [x] Add Admin link to main sidebar (owner-only)

#### 2. Queue Monitoring Dashboard

- [x] **Queue Dashboard Integration**
  - [x] Create queue monitoring page (`/admin/queues`) - `app/(private)/admin/queues/page.tsx`
  - [x] Embed Bull Board UI (iframe integration) - Full Bull Board dashboard in iframe tab
  - [x] Add queue statistics display (waiting, active, completed, failed, delayed) - Overview tab with aggregated and per-queue stats
  - [x] Add real-time queue metrics (auto-refresh every 10 seconds) - Auto-refresh implemented
  - [x] Add queue health indicators (green/yellow/red status) - Health badges based on failure rate (5% warning, 10% error)
  - [x] Add per-queue statistics cards - Individual cards for each queue with detailed stats and clean jobs dialog
  - [x] Add queue job history/failed jobs list - Job History tab with failed and completed jobs sections
  - [x] Add ability to retry failed jobs (via API) - Retry button for each failed job
  - [x] Add ability to clean completed/failed jobs (via API) - Clean jobs dialog with options (completed/failed/all)

- [x] **Queue Statistics API Integration**
  - [x] Create `lib/api/admin.ts` for admin API calls
  - [x] Add `getQueueStats()` function (`GET /api/v1/admin/queues/stats`)
  - [x] Add queue statistics types/interfaces
  - [x] Add error handling for admin API calls
  - [x] Integrated into admin dashboard with real-time updates (30s refresh)
  - [x] Integrated into queue monitoring page with real-time updates (10s refresh)

- [x] **Queue Job Management API Integration**
  - [x] Add `retryJob()` function (`POST /api/v1/admin/queues/:queueName/jobs/:jobId/retry`)
  - [x] Add `cleanJobs()` function (`DELETE /api/v1/admin/queues/:queueName/jobs/clean`)
  - [x] Add `getFailedJobs()` function (`GET /api/v1/admin/queues/:queueName/jobs/failed`)
  - [x] Add `getJobHistory()` function (`GET /api/v1/admin/queues/:queueName/jobs/history`)
  - [x] Add queue job management types/interfaces (QueueJob, JobHistoryResponse, CleanJobsResponse)
  - [x] Error handling with toast notifications
  - [x] Integrated into queue monitoring page with UI controls

#### 3. System Health Monitoring

- [ ] **Health Check Dashboard** (`/admin/health`)
  - [ ] Create system health monitoring page
  - [ ] Display Redis health status (`GET /api/v1/health/redis`)
  - [ ] Display MongoDB connection status
  - [ ] Display API server status
  - [ ] Add health check cards with status indicators
  - [ ] Add real-time health monitoring (auto-refresh)
  - [ ] Add uptime/response time metrics
  - [ ] Add error rate tracking

- [x] **Health Check API Integration**
  - [x] Add `getRedisHealth()` function (`GET /api/v1/health/redis`)
  - [x] Add `getSystemHealth()` function (`GET /api/v1/admin/health`)
  - [x] Add health check types/interfaces (SystemHealth, RedisHealth, MongoDBHealth, HealthCheckResponse)
  - [x] Integrated into admin dashboard with real-time updates (30s refresh)

#### 4. Cron Job Monitoring ✅ COMPLETE

- [x] **Cron Job Dashboard** (`/admin/cron-jobs`)
  - [x] Create cron job monitoring page - `app/(private)/admin/cron-jobs/page.tsx`
  - [x] Display list of all cron jobs with status - Overview tab with status cards
  - [x] Show last execution time for each job - Displayed in status cards with relative time
  - [x] Show next scheduled execution time - Displayed in status cards with relative time and full date
  - [x] Show execution count (success/failure) - Execution count, success count, and failure count displayed
  - [x] Show job enable/disable status - Status badge shows enabled/disabled state
  - [x] Add cron job execution logs/history - Execution History tab with detailed table
  - [x] Add error logs for failed cron jobs - Error messages displayed in history table and status cards
  - [x] Add success rate calculation and display - Success rate percentage shown in status cards
  - [x] Add real-time updates (auto-refresh every 30 seconds) - Auto-refresh implemented
  - [x] Add tabs for Overview and Execution History - Tabs component with two tabs
  - [x] Add job selection dropdown for history view - Dropdown to select which job's history to view
  - [x] Responsive design with mobile support - Responsive grid layout for status cards

- [x] **Cron Job API Integration**
  - [x] Add `getCronJobStatuses()` function (`GET /api/v1/admin/cron-jobs`) - Returns all cron job statuses
  - [x] Add `getCronJobStatus(jobName)` function (`GET /api/v1/admin/cron-jobs/:jobName`) - Returns specific job status
  - [x] Add `getCronJobHistory(jobName, limit)` function (`GET /api/v1/admin/cron-jobs/:jobName/history`) - Returns execution history
  - [x] Add cron job types/interfaces (CronJobStatus, CronJobExecution, CronJobHistoryResponse) - All types defined in `lib/api/admin.ts`
  - [x] Error handling with toast notifications - Error handling integrated
  - [x] Integrated into admin navigation - Already available in AdminNav component

#### 5. System Metrics & Analytics ✅ COMPLETE

- [x] **System Metrics Dashboard** (`/admin/metrics`)
  - [x] Create system metrics page - `app/(private)/admin/metrics/page.tsx`
  - [x] Display queue metrics (job success/failure rates, throughput) - Queue status pie chart and success/failure rate bar chart
  - [x] Display database metrics (connection pool, query performance) - MongoDB metrics card with connection pool, collections, databases, uptime
  - [x] Display Redis metrics (memory usage, connection count) - Redis metrics card with memory, connections, keyspace, latency
  - [x] Display API metrics (request rate, error rate, response times) - Overview cards and response time trend chart
  - [x] Add charts/graphs for metrics visualization (using shadcn UI chart components with recharts) - Pie charts, bar charts, area charts for various metrics
  - [x] Add time range selector (last hour, day, week, month) - Time range selector dropdown (UI ready, backend can filter by time range)
  - [x] Add export metrics functionality - Export button downloads metrics as JSON file
  - [x] Add overview cards for key metrics - API requests, error rate, response time, Redis memory
  - [x] Add real-time updates (auto-refresh every 10 seconds) - Auto-refresh implemented
  - [x] Add metrics history tracking - Keeps last 60 data points for trend visualization
  - [x] Responsive design with mobile support - Responsive grid layout

- [x] **Metrics API Integration**
  - [x] Add `getSystemMetrics()` function (`GET /api/v1/admin/metrics`) - Returns comprehensive system metrics
  - [x] Add metrics types/interfaces (SystemMetrics, QueueMetrics, RedisMetrics, MongoMetrics, ApiMetrics) - All types defined in `lib/api/admin.ts`
  - [x] Add real-time metrics updates (polling every 10 seconds) - Auto-refresh implemented
  - [x] Error handling with toast notifications - Error handling integrated

#### 6. Admin Components

- [ ] **Admin Shared Components**
  - [ ] Create `AdminLayout` component
  - [ ] Create `AdminNav` component
  - [ ] Create `HealthStatusCard` component
  - [ ] Create `QueueStatsCard` component
  - [ ] Create `CronJobCard` component
  - [ ] Create `MetricsChart` component
  - [ ] Create `StatusIndicator` component (green/yellow/red badges)

#### 7. Role-Based Access Control

- [ ] **Admin Route Protection**
  - [ ] Add admin route protection middleware
  - [ ] Check user role (owner) before allowing access
  - [ ] Redirect non-admin users to dashboard
  - [ ] Add 403 Forbidden page for unauthorized access
  - [ ] Add admin role check in API client

- [x] **Admin API Client**
  - [x] Create `lib/api/admin.ts` for admin-only API calls
  - [x] Add `getQueueStats()` function (`GET /api/v1/admin/queues/stats`)
  - [x] Add `getSystemHealth()` function (`GET /api/v1/admin/health`)
  - [x] Add `getRedisHealth()` function (`GET /api/v1/health/redis`)
  - [x] Add TypeScript interfaces for queue stats and health responses
  - [x] Admin authentication handled automatically via apiClient (JWT token)
  - [x] Error handling with toast notifications

#### 8. Real-Time Updates

- [ ] **Real-Time Monitoring**
  - [ ] Add WebSocket connection for real-time updates (if WebSocket implemented)
  - [ ] Add polling fallback for metrics updates
  - [ ] Add auto-refresh toggle (enable/disable)
  - [ ] Add refresh interval configuration

### 🚀 Admin Dashboard Priority Order

1. **High Priority** (Core Monitoring)
   - Queue monitoring dashboard
   - System health checks
   - Queue statistics display

2. **Medium Priority** (Enhanced Monitoring)
   - Cron job monitoring
   - System metrics dashboard
   - Real-time updates

3. **Low Priority** (Nice to have)
   - Advanced analytics
   - Historical data tracking
   - Custom alerting rules

### 📝 Admin Dashboard Notes

- **Owner-Only Access**: All admin routes should be protected and only accessible to users with owner role
- **Real-Time Updates**: Consider WebSocket for real-time metrics, or polling as fallback
- **Bull Board Integration**: Can embed Bull Board UI directly or create custom dashboard using Bull Board API
- **Health Checks**: Display status of all critical services (Redis, MongoDB, API server)
- **Queue Management**: Allow admins to monitor and manage queues (retry failed jobs, clean old jobs)
- **Cron Job Management**: Display cron job status and allow manual triggering if needed
