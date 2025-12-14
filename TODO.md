# Console Frontend - Development TODO

> **Note**: For completed tasks, see [TODO-COMPLETED.md](./TODO-COMPLETED.md)
>
> This file focuses on **pending and future work** only.

**Last Updated**: 04 Dec 2025

---

## 📋 Current Status Summary

### ✅ Completed Features

- **Phase 1: Authentication** - ✅ Complete (except OAuth and dashboard integration)
- **Phase 2: Portfolio Data Management** - ✅ Complete (except public view)
- **Phase 3: Admin Dashboard & Monitoring** - ✅ Complete
- **Phase 4: Finance Management** - ✅ Complete (including Recurring Transactions, Budget Management, Financial Goals)
- **Settings Module** - ✅ Mostly Complete
- **Standard Response Handlers** - ✅ Complete

### 🚧 In Progress / Planned

- **Finance Enhancements** - Transaction Templates ✅ COMPLETE, Quick Add Transaction, Transaction Duplication, Transaction Import/Export (New Features)
- **Global Command Palette** (Mac-like quick command launcher)
  - [x] Add global keyboard shortcut (e.g., `⌘K` / `Ctrl+K`) to open command palette
  - [x] Include navigation commands (routes, settings pages, finance sections)
  - [x] Include common actions (create transaction, upload receipt, open filters, toggle theme)
  - [x] Add fuzzy search with debounce and keyboard navigation (via cmdk)
  - [x] Show context-aware suggestions based on current page (optional)
  - [x] Ensure accessible focus management and ARIA labeling
  - [ ] Wire to existing API helpers where relevant (e.g., quick actions)
- **Responsive Audit (All Modules/Pages/Components)** - IN PROGRESS
  - [x] Review each major page for mobile/tablet/desktop: dashboard, settings (profile/preferences/notifications), finance (overview/transactions/import/analytics/categories/mappings), portfolio (projects/companies/skills/experiences/blog), admin/monitoring, auth screens
  - [x] Verify key feature components adapt on small screens: tables (DataTable, transaction tables), charts/analytics, forms (transaction, settings, auth), dialogs/drawers/sheets, sidebar/header/command palette, file uploads (image/receipt), filter builders, search/autocomplete, calendars/timelines
  - [x] Ensure navigation patterns are usable on mobile: collapsible sidebar, header overflow menus, command palette accessibility, keyboard/focus, skip links where applicable
  - [x] Check typography, spacing, and grid/stack breakpoints; ensure no horizontal scroll and sensible gutters on <=640px
  - [x] Add missing responsive variants (stack vs grid, column reflow, overflow handling, compact table variants, touch targets)
  - [ ] Spot-check critical flows on real devices or emulators (iOS/Android, Safari/Chrome); verify zoom/viewport meta and safe-area insets if needed
  - **Status**: Comprehensive audit completed. See [responsive-audit.md](./docs/responsive-audit.md) for full report.
  - **Fixes Applied**: Finance dashboard export buttons optimized for mobile (dropdown on mobile, buttons on desktop), date range selector made responsive

See [TODO-COMPLETED.md](./TODO-COMPLETED.md) for full details.

**Health Check**: Frontend is ~95% complete. Core features work well, but some enhancements and testing remain.

### ✅ Route Structure Refactoring - COMPLETE

**Current Structure:**

- `(private)` - All authenticated users: dashboard, settings ✅
- `(owner)` - Owner-only: portfolio, admin ✅

**Completed Changes:**

1. ✅ Moved `(private)/admin` → `(owner)/admin`
2. ✅ Created owner layout with role checking
3. ✅ Updated admin layout to work within owner layout
4. ✅ Updated sidebar to show portfolio/admin links for owners only
5. ✅ Removed redundant owner checks from admin pages
6. ✅ Fixed settings layout (removed incorrect owner check)
7. ✅ Build passes successfully

---

## 🎯 Pending Tasks

### High Priority (Production Readiness)

#### Route Structure Refactoring (Owner vs Private Separation) ✅ COMPLETE

- [x] **Move Admin to Owner Route Group**

  - [x] Move `app/(private)/admin` → `app/(owner)/admin`
  - [x] Update admin layout to use owner layout structure
  - [x] Remove owner role checks from admin pages (handled by layout)
  - [x] Update admin navigation links and references
  - [x] Update sidebar to show admin link only for owners
  - [x] Verify all admin routes are accessible only to owners
  - [x] Build passes successfully

- [x] **Owner Layout Structure**

  - [x] Create `app/(owner)/layout.tsx` to handle owner-only routes
  - [x] Add owner role check in owner layout
  - [x] Ensure portfolio and admin share the same owner layout
  - [x] Owner layout uses main sidebar (portfolio + admin navigation)

- [x] **Private Layout Structure**

  - [x] Ensure `app/(private)/layout.tsx` is for all authenticated users
  - [x] Fixed settings layout (removed incorrect owner check)
  - [x] Settings and dashboard work for all authenticated users

- [x] **URL Structure**

  - [x] URLs remain consistent:
    - `/dashboard` - All users (in `(private)`)
    - `/settings/*` - All users (in `(private)`)
    - `/admin/*` - Owner only (in `(owner)`)
    - `/portfolio/*` - Owner only (in `(owner)`)

- [x] **Sidebar Navigation Updates**

  - [x] Updated `AppSidebar` to conditionally show:
    - Portfolio link (owner only) ✅
    - Admin link (owner only) ✅
    - Dashboard link (all users) ✅
    - Settings link (all users) ✅

- [ ] **Testing & Verification** (Recommended Next Step)
  - [ ] Manually test admin routes as owner user
  - [ ] Manually test admin routes as regular user (should redirect to /403)
  - [ ] Manually test portfolio routes as owner user
  - [ ] Manually test portfolio routes as regular user (should redirect to /403)
  - [ ] Manually test settings routes as both owner and regular user (should work for both)
  - [ ] Manually test dashboard route as both owner and regular user (should work for both)

#### Phase 1: Authentication - Remaining Items

- [x] **Dashboard Integration** ✅

  - [x] Update dashboard layout to use real user data from `useAuth()`
  - [x] Add error boundary for auth errors
  - [x] Update StatsSection to show real portfolio stats for owners
  - [x] Update QuickActionsSection with actual app features
  - [x] Dashboard now shows different content based on user role

- [ ] **OAuth Integration** (Optional/Enhancement)
  - [ ] Set up GitHub OAuth app
  - [ ] Create backend OAuth endpoints
  - [ ] Integrate GitHub OAuth button
  - [ ] Handle OAuth callback

#### Testing

- [ ] **Unit Tests**

  - [ ] Test auth context and hooks
  - [ ] Test API client functions
  - [ ] Test form validation schemas
  - [ ] Test portfolio components
  - [ ] Test admin components

- [ ] **Integration Tests**

  - [ ] Test login flow
  - [ ] Test signup flow
  - [ ] Test protected routes
  - [ ] Test portfolio CRUD operations
  - [ ] Test error scenarios

- [ ] **E2E Tests**
  - [ ] Test complete auth flow
  - [ ] Test token expiration handling
  - [ ] Test password reset flow
  - [ ] Test portfolio management flow

#### Documentation

- [ ] **Component Documentation**

  - [ ] Add Storybook setup
  - [ ] Document shared components
  - [ ] Document feature components
  - [ ] Add usage examples

- [ ] **API Integration Documentation**

  - [ ] Document API client usage
  - [ ] Document response types
  - [ ] Document error handling
  - [ ] Document environment variables

- [ ] **Deployment Documentation**
  - [ ] Document build process
  - [ ] Document environment configuration
  - [ ] Document deployment steps
  - [ ] Update README with setup instructions

---

### Medium Priority (Enhancement)

#### Settings Module - Remaining Items

- [x] **Avatar Management** ✅

  - [x] Create avatar upload component
  - [x] Add image preview
  - [x] Add image cropping (optional) - using react-easy-crop
  - [x] Add image size/format validation (5MB max, image types)
  - [x] Add remove avatar option
  - [x] Integrate with file upload API
  - [x] Add `uploadAvatar()` function to settings API
  - [x] Backend supports both file upload and URL
  - [x] Backend automatically resizes to 400x400
  - [x] Integrated in Profile Settings page

- [x] **Notification Settings** ✅

  - [x] Create notification preferences form
  - [x] Add notification categories (Email, In-App, Push)
  - [x] Add toggle switches for each preference
  - [x] Integrate with backend API (`/api/v1/notifications/preferences`)
  - [x] Add `getNotificationPreferences()` and `updateNotificationPreferences()` functions
  - [x] Add reset to defaults functionality
  - [x] Add loading states with skeletons
  - [x] Backend fully implemented with all endpoints

- [ ] **Email Preferences** (if separate from notifications)

  - [ ] Create email preferences form
  - [ ] Add email notification categories
  - [ ] Integrate with backend API (`/api/v1/email/preferences`)

- [x] **Settings Components** ✅

  - [x] Create reusable `SettingsSection` component
  - [x] Create reusable `SettingsCard` component
  - [x] Create reusable form field components (`SettingsFormField`)
  - [x] Create reusable `SettingsPageHeader` component
  - [x] Create reusable `SettingsActionButtons` component
  - [x] Export all components from index.ts for easy imports

- [ ] **Settings Navigation** (Minor)
  - [ ] Make navigation responsive (mobile menu)

#### Portfolio Module - Remaining Items

- [x] **Image Upload Integration** ✅

  - [x] Add image upload component to project forms
  - [x] Add logo upload component to company forms
  - [x] Integrate with existing `ImageUpload` component
  - [x] Project form supports 16:9 aspect ratio images
  - [x] Company form supports 1:1 aspect ratio logos
  - [x] Both forms include image/logo in submission payload

- [x] **Drag-and-Drop Reordering** ✅

  - [x] Add project drag-and-drop reordering (using existing `DragDropList`)
  - [x] Add testimonial drag-and-drop reordering (using existing `DragDropList`)
  - [x] Added view mode toggle (Table/Reorder) for both pages
  - [x] Integrated with `reorderProjects` and `reorderTestimonials` API
  - [x] Auto-save on reorder with loading states
  - [x] Error handling with toast notifications

- [ ] **Blog Preview** (Enhancement)
  - [ ] Add markdown preview functionality to blog editor

#### Phase 2: Portfolio - Public View

- [ ] **Backend** (Coordinate with backend team)

  - [ ] Create public portfolio API endpoints (read-only)
  - [ ] Add portfolio visibility settings
  - [ ] Add portfolio theme/settings

- [ ] **Frontend**
  - [ ] Create public portfolio page (`/portfolio/[username]`)
  - [ ] Create portfolio preview component
  - [ ] Add portfolio theme customization
  - [ ] Add portfolio sharing functionality

#### Phase 4: Finance Management (Owner-Only) ✅ COMPLETE

**Note**: All Finance Management features are complete, including:
- Finance Module Overview
- Transaction Management
- Expense/Income Category Management
- Finance Dashboard/Analytics
- Finance API Integration
- Common Features
- Recurring Transactions
- Budget Management
- Financial Goals
- Transaction Receipt/Attachment (Backend ✅ Complete, Frontend ⏳ Pending - see below)

See [TODO-COMPLETED.md](./TODO-COMPLETED.md) for complete details.

#### Financial Goals (New Feature) ✅ COMPLETE

**Note**: Financial Goals feature is complete. See [TODO-COMPLETED.md](./TODO-COMPLETED.md) for details.

#### Advanced Charts & Visualizations (Enhancement)

**Status**: Backend ✅ COMPLETE, Frontend ✅ COMPLETE

**Backend Support**: All analytics endpoints are complete and ready:
- ✅ Category trends (`GET /api/v1/finance/analytics/category-trends`)
- ✅ Month-over-month comparison (`GET /api/v1/finance/analytics/comparison/mom`)
- ✅ Year-over-year comparison (`GET /api/v1/finance/analytics/comparison/yoy`)
- ✅ Forecast data (`GET /api/v1/finance/analytics/forecast`)
- ✅ Heatmap calendar data (`GET /api/v1/finance/analytics/heatmap`)
- ✅ Spending patterns (`GET /api/v1/finance/analytics/patterns`)

**Frontend Implementation Tasks**:

- [x] **API Integration** ✅ COMPLETE
  - [x] Add `getCategoryTrends()` function to `finance-analytics.ts`
  - [x] Add `getMonthOverMonthComparison()` function to `finance-analytics.ts`
  - [x] Add `getYearOverYearComparison()` function to `finance-analytics.ts`
  - [x] Add `getForecast()` function to `finance-analytics.ts`
  - [x] Add `getHeatmapData()` function to `finance-analytics.ts`
  - [x] Add `getSpendingPatterns()` function to `finance-analytics.ts`
  - [x] Add TypeScript interfaces for all response types
  - [x] Add error handling for all analytics endpoints

- [x] **Category Trends Chart** ✅ COMPLETE
  - [x] Create `CategoryTrendsChart` component using shadcn chart components
  - [x] Add category selector (single or multiple categories) - badge-based selection
  - [x] Add aggregation selector (daily, weekly, monthly)
  - [x] Add date range selector with quick range buttons (1M, 3M, 1Y)
  - [x] Display trends as line chart or area chart (toggleable)
  - [x] Add comparison mode (compare multiple categories) - supports multiple category selection
  - [x] Add click handler to filter transactions by category/period (via `onCategoryClick` prop)
  - [x] Add export button (PNG export ready, can be extended to SVG/PDF)

- [x] **Comparison Charts** ✅ COMPLETE
  - [x] Create `ComparisonCharts` component (combines MoM and YoY)
  - [x] Add period selector (MoM, YoY) - toggle between comparison types
  - [x] Show side-by-side comparison (bar chart) - current vs previous period
  - [x] Add percentage change indicators - with color coding and icons
  - [x] Add trend arrows (up/down) with color coding - green for positive, red for negative
  - [x] Add category breakdown toggle (optional) - shows top 5 categories for MoM
  - [x] Add category selector - filter by specific category or all categories
  - [x] Add summary cards - showing income, expenses, and net changes
  - [x] Add export button (PNG ready, can be extended to SVG/PDF)

- [x] **Forecast Chart** ✅ COMPLETE
  - [x] Create `ForecastChart` component using shadcn chart components
  - [x] Add forecast period selector (1 month, 3 months, 6 months, 1 year)
  - [x] Display projected income/expenses/net as line chart - with confidence intervals
  - [x] Show confidence intervals as shaded areas - 95% prediction range
  - [x] Add historical average display - shows in filter section
  - [x] Add forecast assumptions display - info popover with assumptions
  - [x] Add date range selector for historical data - with quick range buttons
  - [x] Add export button (PNG ready, can be extended to SVG/PDF)

- [x] **Heatmap Calendar View** ✅ COMPLETE
  - [x] Create `HeatmapCalendar` component - custom implementation using grid layout
  - [x] Display daily transaction data as heatmap - calendar grid with color-coded cells
  - [x] Color intensity based on amount (income = green, expenses = red, net = gradient)
  - [x] Show transaction count on hover - detailed tooltip with income/expenses/net/transaction count
  - [x] Add month/year navigation - previous/next month buttons
  - [x] Click date to filter transactions for that day - via `onDateClick` prop
  - [x] Add date range selector - with quick range buttons (3M, 6M, 1Y)
  - [x] Add legend for color scale - visual gradient legend
  - [x] Add view mode selector - toggle between income/expenses/net
  - [x] Add export button (PNG ready, can be extended to SVG/PDF)

- [x] **Spending Patterns Chart** ✅ COMPLETE
  - [x] Create `SpendingPatternsChart` component using shadcn chart components
  - [x] Display daily patterns (by day of week) as bar chart
  - [x] Display weekly patterns (by week of month) as bar chart
  - [x] Display monthly patterns (by day of month) as bar chart
  - [x] Add pattern type selector (daily, weekly, monthly)
  - [x] Highlight anomalies with different color/styling - amber color with border for anomalies
  - [x] Add anomaly details tooltip - shows anomaly indicator in tooltip
  - [x] Add anomalies section - displays top 6 anomalies with details
  - [x] Add date range selector - with quick range buttons (3M, 6M, 1Y)
  - [x] Add click handler for anomalies - via `onAnomalyClick` prop
  - [x] Add export button (PNG ready, can be extended to SVG/PDF)

- [x] **Interactive Features** ✅ COMPLETE
  - [x] Add drill-down functionality
    - [x] Click chart element to navigate to filtered transaction list - All chart components navigate with filters
    - [x] Add breadcrumb navigation for drill-down path - BreadcrumbNavigation component created
    - [x] Add back button to return to overview - BreadcrumbNavigation supports back button
    - [x] Preserve filter state in URL query params - Transaction page reads/writes URL params
  - [x] Add click to filter
    - [x] Click chart element to filter transactions - All charts navigate to transaction list with filters
    - [x] Update transaction list based on chart selection - URL params automatically apply filters
    - [x] Add filter chips for active filters - FilterChips component displays active filters
    - [x] Add clear filters button - FilterChips includes clear all button
    - [x] Sync filters across all charts on dashboard - Charts use buildTransactionListUrl() utility

- [x] **Chart Enhancements** ✅ COMPLETE
  - [x] Add chart type selector (bar, line, pie, area, etc.) - ChartControls component with type selector
    - [x] Save chart preferences to localStorage - chart-preferences.ts utility with localStorage support
    - [x] Add chart customization options (colors, labels, etc.) - ChartControls with display options (labels, grid, legend)
  - [x] Enhanced tooltips - EnhancedTooltip component created
    - [x] Show more detailed information on hover - Detailed format with percentages and totals
    - [x] Display related data (e.g., transaction count, percentage) - Supports transaction count and percentage display
    - [x] Add tooltip customization options - Three formats: minimal, default, detailed
  - [x] Export charts as images ✅ COMPLETE
    - [x] Add export button to each chart - ChartExportButton component with dropdown menu
    - [x] Export as PNG (using `html2canvas` or similar) - Implemented with html2canvas
    - [x] Export as SVG (for vector graphics) - Implemented with SVG serialization
    - [x] Export as PDF (for reports, using `jspdf` or similar) - Implemented with jspdf
    - [x] Add chart title and metadata to exports - All formats include title and description
    - [x] Add export date/time to exports - Timestamp included in all export formats

- [x] **Analytics Page/Dashboard Section** ✅ COMPLETE (Option 1)
  - [x] Option 1: Create dedicated `/finance/analytics` page - Created at `/app/(owner)/finance/analytics/page.tsx`
    - [x] Create analytics page with all advanced charts - All 5 chart types included
    - [x] Add tabbed interface for different chart types - Tabs component with 5 tabs (Trends, Comparison, Forecast, Heatmap, Patterns)
    - [x] Add date range selector (global for all charts) - Info card explaining chart-level date controls
    - [x] Add chart layout options (grid, single view) - Layout toggle buttons (grid/single view)
  - [x] Add loading states with skeletons for all charts - All charts already have skeleton loading states
  - [x] Add error states with retry functionality - All charts have error handling with toast notifications
  - [x] Add empty states with helpful messages - All charts have empty states with helpful messages
  - [x] Added link to analytics page from finance overview page

- [x] **Integration & Testing** ✅ COMPLETE
  - [x] Integrate all charts into finance dashboard or analytics page ✅ COMPLETE - All 5 charts integrated in `/finance/analytics` page with tabbed interface
  - [x] Add toast notifications for errors ✅ COMPLETE - All chart components have toast.error() for API errors and failures
  - [ ] Test all API endpoints with various date ranges (Recommended for production)
  - [ ] Test interactive features (drill-down, click to filter) (Recommended for production)
  - [ ] Test export functionality for all chart types (Recommended for production)
  - [ ] Test responsive design (mobile, tablet, desktop) (Recommended for production)
  - [ ] Test with empty data states (Recommended for production)
  - [ ] Test with large datasets (Recommended for production)

---

### Low Priority (Nice to Have)

#### Performance Optimization

- [ ] **Code Splitting**

  - [ ] Implement route-based code splitting
  - [ ] Implement component lazy loading
  - [ ] Optimize bundle size

- [ ] **Image Optimization**

  - [ ] Implement Next.js Image component for all images
  - [ ] Add image lazy loading
  - [ ] Add image placeholder/blur

- [ ] **Caching**
  - [ ] Implement API response caching
  - [ ] Implement static asset caching
  - [ ] Add service worker for offline support

#### Accessibility

- [ ] **ARIA Labels**
  - [ ] Add proper ARIA labels to all interactive elements
  - [ ] Add keyboard navigation support
  - [ ] Add focus management
  - [ ] Ensure screen reader compatibility

#### UI/UX Enhancements

- [x] **Transaction Timeline View** ✅ COMPLETE
  - [x] Create timeline visualization component
  - [x] Add group by date functionality (frontend grouping using existing transaction API)
  - [x] Display income/expense flow
  - [x] Add balance tracking (running balance calculation on frontend)
  - [x] Implement vertical timeline layout
  - [x] Add color-coding by transaction type
  - [x] Add expandable date groups
  - [x] Integrate with existing transaction API (`GET /finance/transactions` with date sorting)
  - [x] Add date range filtering (using existing API filters)
  - [x] Add click to view transaction details
  - [x] Add view toggle (Table/Timeline) to transaction page
  - [x] Add expand all/collapse all functionality
  - [x] Add current balance summary card
  - **Note**: Uses existing transaction endpoint - no backend changes needed

- [x] **Calendar View** ✅ COMPLETE
  - [x] Create monthly calendar component
  - [x] Display daily transaction aggregation (frontend calculation)
  - [x] Add transaction dots/indicators on dates (green for income, red for expenses)
  - [x] Implement click date to filter functionality (navigates to transaction list with date filter)
  - [x] Add color-coding by amount (intensity) - green for positive net/income, red for negative net/expenses
  - [x] Add hover previews (transaction summary with income, expenses, net, transaction count)
  - [x] Integrate with transaction API (uses existing `GET /finance/transactions` endpoint)
  - [x] Add month/year navigation (previous/next month, today button)
  - [x] Add view mode toggle (Calendar/Table/Timeline)
  - [x] Add month summary card (transactions count, income, expenses, net)
  - [x] Add legend for color coding
  - **Note**: Uses existing transaction endpoint - no backend changes needed initially. Backend optimization (daily aggregation endpoint) can be added later if performance becomes an issue with large datasets.

- [ ] **Inline Editing**
  - [ ] Add click to edit in table functionality
  - [ ] Create quick edit popover component
  - [ ] Implement batch edit for selected items
  - [ ] Add inline form fields
  - [ ] Add save/cancel buttons
  - [ ] Add keyboard navigation (Enter to save, Esc to cancel)
  - [ ] Add validation for inline edits
  - [ ] Integrate with transaction update API
  - [ ] Add loading states for inline edits
  - [ ] Add toast notifications for save/cancel

- [x] **Better Search & Filters** ✅ COMPLETE
  - [x] Create advanced search builder component (SearchAutocomplete with suggestions)
  - [x] Add saved filter presets functionality (FilterPresetMenu component)
  - [x] Add search suggestions (autocomplete) - integrated with backend API
  - [x] Add recent searches tracking - localStorage-based with utilities
  - [x] Add filter combinations support - filter presets support all filter combinations
  - [x] Enhance search bar with autocomplete - SearchAutocomplete component with suggestions and recent searches
  - [x] Add filter count badge - shows active filter count
  - [x] Integrate with backend filter presets API - full CRUD operations
  - [x] Add localStorage for recent searches - recent-searches.ts utilities
  - [x] Add filter preset management (save, delete, rename) - FilterPresetDialog and FilterPresetMenu
  - **Components Created**:
    - `SearchAutocomplete` - Autocomplete search with suggestions and recent searches
    - `FilterPresetMenu` - Dropdown menu for managing filter presets
    - `FilterPresetDialog` - Dialog for saving/editing filter presets
    - `recent-searches.ts` - Utilities for localStorage-based recent searches tracking
  - **API Integration**:
    - `finance-filter-presets.ts` - Full CRUD API for filter presets
    - `finance-search.ts` - Search suggestions and analytics API
  - **Features**:
    - Search autocomplete with debouncing (300ms)
    - Recent searches with remove functionality
    - Search suggestions from transaction history (descriptions, notes, references, tags, payment methods)
    - Filter preset save/load/delete/rename
    - Default preset support
    - Filter count badge
    - Integrated into transactions page

- [ ] **Transaction Receipt/Attachment** (Backend ✅ COMPLETE)
  - **Backend Status**: ✅ All endpoints and services complete
    - ✅ Receipt upload endpoint (`POST /api/v1/finance/transactions/:id/receipt`)
    - ✅ Receipt download endpoint (`GET /api/v1/finance/transactions/:id/receipt`)
    - ✅ Receipt deletion endpoint (`DELETE /api/v1/finance/transactions/:id/receipt`)
    - ✅ Receipt OCR extraction (`POST /api/v1/finance/transactions/:id/receipt/extract`)
    - ✅ Receipt OCR data retrieval (`GET /api/v1/finance/transactions/:id/receipt/ocr`)
    - ✅ Apply OCR data (`PATCH /api/v1/finance/transactions/:id/apply-ocr`)
    - ✅ Discard OCR data (`DELETE /api/v1/finance/transactions/:id/receipt/ocr`)
    - ✅ Merchant category mappings (`GET/POST/PATCH/DELETE /api/v1/finance/merchant-categories`)
    - ✅ Auto-categorization integrated into OCR flow
  - **Frontend Tasks**:
    - [x] **Receipt Upload Component** ✅ COMPLETE
      - [x] Create `ReceiptUpload` component with drag-and-drop support
      - [x] Add image upload support (JPEG, PNG, GIF, WebP)
      - [x] Add PDF attachment support
      - [x] Add file validation (type and size - 10MB max)
      - [x] Add upload progress indicator
      - [x] Add image preview before upload
      - [x] Add error handling with toast notifications
      - [x] Integrate with `POST /api/v1/finance/transactions/:id/receipt` endpoint
      - [x] Create `finance-receipts.ts` API client with all receipt functions
    - [x] **Receipt Display** ✅ COMPLETE
      - [x] Add receipt indicator/icon in transaction table rows
      - [x] Add receipt badge showing file type (image/PDF) with appropriate icon
      - [x] Clickable badge to open receipt viewer
      - [x] Updated Transaction interface to include receipt fields
    - [x] **Receipt Viewer Modal** ✅ COMPLETE
      - [x] Create `ReceiptViewerModal` component
      - [x] Display images (JPEG, PNG, GIF, WebP) with zoom/pan/rotate
      - [x] Display PDFs with iframe viewer
      - [x] Add download button in viewer
      - [x] Add delete button in viewer (with confirmation)
      - [x] Add close button and keyboard navigation (Esc to close, +/- for zoom, R for rotate)
      - [x] Add fullscreen mode (F11)
      - [x] Add file size and type display
      - [x] Add keyboard shortcuts hint
    - [x] **Receipt Actions** ✅ COMPLETE
      - [x] Add receipt download functionality (uses `GET /api/v1/finance/transactions/:id/receipt`) - Implemented in ReceiptViewerModal
      - [x] Add receipt deletion functionality (uses `DELETE /api/v1/finance/transactions/:id/receipt`) - Implemented in ReceiptViewerModal
      - [x] Add confirmation dialog for deletion - ConfirmDialog integrated
      - [x] Add success/error toast notifications - Toast notifications for all actions
    - [x] **Transaction Form Integration** ✅ COMPLETE
      - [x] Add receipt upload section to transaction form - ReceiptUpload component integrated
      - [x] Allow upload during transaction creation - Shows message that receipt can be uploaded after creation
      - [x] Allow upload after transaction creation (edit mode) - Full upload functionality in edit mode
      - [x] Show existing receipt if present - ReceiptUpload displays existing receipt with preview
      - [x] Allow replacing existing receipt - ReceiptUpload supports replace functionality
      - [x] Receipt state management - Local state syncs with transaction data
      - [x] Refresh transaction after receipt changes - onReceiptChange callback refreshes data
    - [x] **Receipt OCR Integration** ✅ COMPLETE
      - [x] Create `ReceiptOcrReviewModal` component - Full modal with editable fields, confidence scores, category selection
      - [x] Display extracted OCR data (merchant, date, amounts, items) - All fields displayed with confidence badges
      - [x] Show confidence scores for each field - Color-coded badges (high/medium/low)
      - [x] Allow user to edit/correct extracted data - All editable fields with input controls
      - [x] Show suggested category with confidence - Category suggestion with confidence badge
      - [x] Allow user to accept/reject suggested category - Category selector with checkbox to apply
      - [x] Add "Apply OCR Data" button - Applies selected fields to transaction
      - [x] Add "Discard OCR Data" button - Discards OCR data
      - [x] Add loading states during OCR extraction - Loading indicators for all async operations
      - [x] Create `ReceiptActions` component - Complete component with extract/review/apply buttons
      - [x] Add "Extract Receipt Data" button (triggers OCR) - Button with loading state
      - [x] Show OCR status (extracted, applied, not extracted) - Status badges with icons
      - [x] Add "Review OCR Data" button (if OCR data exists) - Opens review modal
      - [x] Add "Apply OCR Data" button (if OCR data not applied) - Quick apply button
      - [x] Integrate OCR extraction flow - Integrated into transaction form and table
      - [x] Call `POST /api/v1/finance/transactions/:id/receipt/extract` after upload - Optional auto-extract
      - [x] Show loading state during OCR processing - Loading indicators
      - [x] Display OCR review modal with extracted data - Modal opens automatically after extraction
      - [x] Handle user corrections and apply OCR data - Full edit and apply flow
      - [x] Update transaction with applied OCR data - Transaction refreshes after apply
      - [x] Add OCR status indicators - Status badges in ReceiptActions component
      - [x] Show "OCR Available" badge if OCR data exists - Badge with FileText icon
      - [x] Show "OCR Applied" badge if OCR data was applied - Badge with CheckCircle2 icon
      - [x] Show confidence indicator (high/medium/low) - Color-coded confidence badges
    - [x] **API Integration** ✅ COMPLETE
      - [x] Create `finance-receipts.ts` API client file - File created with all functions
      - [x] Add `uploadReceipt(transactionId, file)` function - Implemented with FormData upload
      - [x] Add `getReceiptUrl(transactionId)` function - Implemented using getData helper
      - [x] Add `deleteReceipt(transactionId)` function - Implemented using del helper
      - [x] Add `extractReceiptOcr(transactionId)` function - Implemented with POST request
      - [x] Add `getReceiptOcr(transactionId)` function - Implemented using getData helper
      - [x] Add `applyOcrData(transactionId, fieldsToApply, categoryId?)` function - Implemented using patch helper with ApplyOcrDataRequest
      - [x] Add `discardReceiptOcr(transactionId)` function - Implemented using del helper
      - [x] Add TypeScript interfaces for receipt data - All interfaces defined
      - [x] `ReceiptMetadata` interface - Defined with receiptUrl, receiptFilename, receiptMimetype, receiptSize, receiptUploadedAt
      - [x] `ReceiptOcrData` interface - Defined with all OCR fields (merchantName, date, totalAmount, items, etc.) and overallConfidence
      - [x] `CategorySuggestion` interface - Defined with categoryId, categoryName, confidence, source
      - [x] `ApplyOcrDataRequest` interface - Defined with fieldsToApply array and optional categoryId
    - [x] **Merchant Category Mappings** ✅ COMPLETE (Optional - Backend Ready)
      - [x] Create merchant category management UI - Created `/finance/categories/merchant-mappings` page
      - [x] Display merchant mappings in settings or transaction details - Added to finance categories section
      - [x] Allow manual creation/editing of merchant mappings - Full CRUD with form, table, and delete confirmation
      - [x] Created `MerchantCategoryForm` component with category selection (expense/income)
      - [x] Created `MerchantCategoryTable` component with columns: merchant name, category, matches, confidence, last used
      - [x] Added API client (`finance-merchant-categories.ts`) with all CRUD functions
      - [x] Added link to merchant mappings in finance main page

    - [x] **Transaction List Virtual Scrolling** ✅ COMPLETE
      - [x] Install `@tanstack/react-virtual` package - Installed successfully
      - [x] Create virtual scrolling wrapper component or enhance DataTable - Added `enableVirtualScrolling` prop to DataTable
      - [x] Integrate virtual scrolling into TransactionTable component - Auto-enabled for datasets > 100 transactions
      - [x] Maintain existing functionality (sorting, filtering, selection) - All features preserved
      - [x] Add loading states for virtual scrolling - Loading states maintained
      - [ ] Test with large datasets (10,000+ transactions) - Recommended for production testing
      - [ ] Ensure smooth scrolling performance - Recommended for production testing
      - [ ] Test with different screen sizes - Recommended for production testing

    - [ ] **Multi-Currency Support**
      - [x] **Phase 1: Currency Selection UI** ✅ COMPLETE
        - [x] Create `CurrencySelector` component:
          - [x] Display currency dropdown/select
          - [x] Show currency symbol and code (e.g., "RM (MYR)")
          - [x] Support ISO 4217 currency codes
          - [x] Default to MYR (Malaysian Ringgit)
          - [x] Show exchange rate when different from base currency
          - [x] Display converted amount in base currency (optional)
        - [x] Add currency selector to TransactionForm:
          - [x] Add currency field to form
          - [x] Show currency selector next to amount field
          - [x] Display exchange rate info if currency differs from base
          - [x] Show converted amount in base currency (optional preview)
        - [x] Update Transaction interface to include currency fields:
          - [x] `currency: string` (default: 'MYR')
          - [x] `exchangeRate?: number`
          - [x] `baseAmount?: number`
          - [x] `baseCurrency?: string`
      - [x] **Phase 2: Currency Display & Formatting** ✅ COMPLETE
        - [x] Create `CurrencyDisplay` component:
          - [x] Format amount with currency symbol
          - [x] Support currency code display (MYR, USD, EUR, etc.)
          - [x] Show currency symbol based on locale
          - [x] Handle currency symbol positioning (before/after amount)
        - [x] Update TransactionTable to display currency:
          - [x] Show currency badge/indicator in amount column
          - [x] Format amounts with currency symbols
          - [x] Show base currency conversion (optional tooltip)
        - [x] Update TransactionCard/Timeline to display currency
        - [x] Update transaction details view to show currency info
        - [x] Add currency filter to transaction filters
      - [x] **Phase 3: Currency Conversion UI** ✅ COMPLETE
        - [x] Create `CurrencyConverter` component:
          - [x] Input fields for amount, from currency, to currency
          - [x] Real-time conversion display
          - [x] Show exchange rate used
          - [x] Show last updated timestamp
          - [x] Loading state during conversion
          - [x] Compact mode for inline use
          - [x] Full card mode for standalone use
          - [x] Optional historical rate selection
        - [x] Add currency conversion calculator (optional):
          - [x] Standalone calculator component (CurrencyConverter with full card mode)
          - [x] Historical rate selection (optional, via showHistoricalRate prop)
        - [x] Add exchange rate display in transaction form:
          - [x] Show current exchange rate when currency selected (already implemented in CurrencySelector)
          - [x] Show converted amount preview (already implemented in CurrencySelector)
      - [x] **Phase 4: User Currency Preferences** ✅ COMPLETE
        - [x] Create currency preferences page/section:
          - [x] Base currency selector (default: MYR)
          - [x] Supported currencies list (multi-select)
          - [x] Currency display preferences (symbol position, format)
        - [x] Add currency preferences to Settings page:
          - [x] Add "Currency" section to settings
          - [x] Base currency selection
          - [x] Currency display format options
        - [x] Store currency preferences in localStorage (for UI preferences)
        - [x] Integrate with backend currency preferences API
      - [x] **Phase 5: Analytics & Reports Currency Support** ✅ COMPLETE
        - [x] Update analytics charts to handle multi-currency:
          - [x] Convert all amounts to base currency for display (backend handles conversion)
          - [x] Add currency filter to analytics queries
          - [x] Show currency breakdown in tooltips (optional - backend provides converted amounts)
        - [x] Update category trends chart:
          - [x] Convert amounts to base currency (via API)
          - [x] Show currency indicator (via filter description)
        - [x] Update comparison charts (MoM/YoY):
          - [x] Handle currency conversion (via API)
          - [x] Show currency in chart labels (via filter description)
        - [x] Update forecast chart:
          - [x] Convert forecast amounts to base currency (via API)
        - [x] Update heatmap:
          - [x] Show amounts in base currency (via API)
        - [x] Update spending patterns:
          - [x] Handle multi-currency data (via API)
        - [x] Add currency filter to analytics page
      - [x] **Phase 6: Transaction Import/Export Currency Support** ✅ COMPLETE
        - [x] Update import to handle currency column:
          - [x] Auto-detect currency column (currency, curr, ccy)
          - [x] Validate currency codes (ISO 4217 format)
          - [x] Set default currency (MYR) if not provided or invalid
        - [x] Update export to include currency:
          - [x] Add currency column to CSV/Excel exports (already included in backend)
          - [x] Include exchange rate and base amount (already included in backend)
          - [x] Add currency parameter to export API function
      - [x] **Phase 7: API Integration** ✅ COMPLETE
        - [x] Create `finance-currency.ts` API client:
          - [x] `getCurrencyPreferences()` - Get user's currency preferences
          - [x] `updateCurrencyPreferences()` - Update base currency
          - [x] `getSupportedCurrencies()` - Get list of supported currencies
          - [x] `convertCurrency(amount, from, to, date?)` - Convert amount
          - [x] `getExchangeRates()` - Get current exchange rates
          - [x] `getHistoricalExchangeRates()` - Get historical rates
        - [x] Update `finance-transactions.ts`:
          - [x] Add currency fields to Transaction interface
          - [x] Add currency parameter to transaction queries
          - [x] Update create/update transaction to include currency
        - [x] Update transaction API calls to include currency
      - [ ] **Phase 8: Testing**
        - [ ] Test currency selector in transaction form
        - [ ] Test currency display in transaction table
        - [ ] Test currency conversion accuracy
        - [ ] Test analytics with multi-currency data
        - [ ] Test import/export with currency data
        - [ ] Test currency preferences persistence
        - [ ] Test responsive design with currency components
      - [ ] **Features**:
        - ✅ MYR (Malaysian Ringgit) as default currency
        - ✅ Currency selector in transaction form
        - ✅ Currency display with proper formatting
        - ✅ Exchange rate integration (real-time or cached)
        - ✅ Currency conversion calculator
        - ✅ Multi-currency analytics support
        - ✅ Currency preferences management
        - ✅ Currency filtering in transaction list
        - ✅ Currency support in import/export

- [x] **Transaction Quick Filters** ✅ COMPLETE
  - [x] Create quick filter buttons component:
    - [x] "This Week" button (filters to current week)
    - [x] "Last Month" button (filters to previous month)
    - [x] "Large Expenses" button (filters expenses > $100 or user's base currency equivalent)
    - [x] "This Month" button (filters to current month)
    - [x] "Last 7 Days" button (filters to last 7 days)
    - [x] "Last 30 Days" button (filters to last 30 days)
  - [x] Add quick filter buttons to transaction page (above search bar)
  - [x] Implement one-click filter application
    - [x] Apply date range filters for time-based quick filters
    - [x] Apply amount filter for "Large Expenses" (client-side filtering)
    - [x] Merge with existing filters (doesn't clear other filters)
  - [x] Add visual indication when quick filter is active (badge with "Active" label)
  - [x] Toggle functionality (click active filter to clear)
  - [x] **Backend**: No backend changes needed (uses existing filter endpoints)

- [x] **Transaction Count Badge** ✅ COMPLETE (Quick Wins)
  - [x] **Sidebar Count Badge** ✅ COMPLETE
    - [x] Add transaction count badge to finance sidebar item
    - [x] Show total transaction count (fetched from statistics API)
    - [x] Update count when transactions are added/removed (via custom event system)
    - [x] Add click handler to navigate to transactions page (already handled by Link component)
    - [x] Created `useTransactionCount` hook for fetching and managing count
    - [x] Added event-based updates (dispatches TRANSACTION_UPDATE_EVENT on create/update/delete)
    - [x] Auto-refreshes when navigating to/from finance pages
  - [x] **Table Filter Count Badge** ✅ COMPLETE
    - [x] Show filtered transaction count in transaction table header
    - [x] Display format: "Showing X of Y transactions" or "X transactions"
    - [x] Update count when filters change (uses pagination.total which updates automatically)
    - [x] Show count badge next to filter chips
    - [x] Badge shows "X transactions" when all results fit on one page
    - [x] Badge shows "Showing X of Y transactions" when paginated
  - [x] **Total Amount in Header** ✅ COMPLETE
    - [x] Add total amount display in transaction table header
    - [x] Show total income, total expenses, and net amount
    - [x] Update totals when filters change (uses useMemo with transactionsForTotals dependency)
    - [x] Format amounts with CurrencyDisplay component
    - [x] Show currency badge if multiple currencies are present
    - [x] Uses baseAmount for multi-currency support (converts to base currency)
    - [x] Works with all view modes (table, timeline, calendar)
    - [x] Color-coded variants (income = green, expense = red, net = based on sign)
  - **Backend**: ✅ No backend changes needed (uses existing transaction statistics endpoint or calculate from filtered results)

- [ ] **Animations**

  - [ ] Add page transition animations
  - [ ] Add component enter/exit animations
  - [ ] Add loading skeleton animations

- [ ] **Error Boundaries**

  - [ ] Create error boundary component
  - [ ] Add error reporting (Sentry or similar)
  - [ ] Add error recovery UI

- [ ] **Offline Support**
  - [ ] Add offline detection
  - [ ] Add offline UI indicators
  - [ ] Add service worker for offline functionality

#### Additional Features

- [ ] **Welcome Message** (Optional)

  - [ ] Show welcome message after successful login/signup

- [ ] **Advanced Security** (Future)
  - [ ] Two-Factor Authentication UI (if backend implemented)
  - [ ] API Keys management UI (if applicable)

---

## 📝 Notes

### Architecture Decisions

- **State Management**: React Context for auth, localStorage for preferences
- **Form Management**: react-hook-form + Zod for validation
- **API Client**: Native fetch with wrapper for consistency
- **UI Components**: shadcn/ui for consistent design system
- **Toast Notifications**: sonner for user feedback

### Development Guidelines

- **TypeScript**: All code must be fully typed
- **Component Structure**: Feature-based organization
- **Environment Variables**: All configuration should come from `.env.local`
- **Best Practices**: Follow Next.js 16 App Router patterns
- **Testing**: Write tests for critical paths (auth, portfolio, admin)
- **Documentation**: Document complex logic and component usage

### Future Considerations

- Consider adding Docker/Docker Compose for easier local development
- Consider adding CI/CD pipeline
- Consider adding automated deployment scripts
- Consider adding component library documentation (Storybook)
- Consider adding performance monitoring (Web Vitals)

---

## 🚀 Quick Reference

### Priority Order

1. **Testing** (High Priority) - Critical for production readiness
2. **Documentation** (High Priority) - Improves developer experience
3. **Remaining Features** (Medium Priority) - Complete existing modules
4. **Enhancements** (Low Priority) - Nice to have features

### Completed Work

See [TODO-COMPLETED.md](./TODO-COMPLETED.md) for:

- Phase 1: Authentication (Complete)
- Phase 2: Portfolio Management (Complete)
- Phase 3: Admin Dashboard (Complete)
- Settings Module (Mostly Complete)
- All implemented features and components

### Planned Work

- All major phases are complete. Remaining work includes testing, documentation, and optional enhancements.

---

**Last Updated**: 04 Dec 2025
