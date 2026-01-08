# 📘 VISA CONSULTANCY SAAS PLATFORM (ENTERPRISE EDITION)
> **Version:** 2.2 (UI/UX Detailed)
> **Type:** Investor-Grade Technical & Product Blueprint  
> **Architecture:** PWA + Next.js 15 (App Router) + Docker + PostgreSQL  

---

## 📌 1. EXECUTIVE SUMMARY
A "Business-in-a-Box" multi-tenant SaaS platform designed specifically for Immigration Consultants, Visa Agencies, and Travel Firms. The platform digitizes the entire lifecycle of visa processing—from lead management and document collection to expiry tracking and automated reminders.

---

## 📱 2. UI/UX & PAGE DETAILS (DETAILED SPECIFICATION)

### **A. Dashboard (`/dashboard`)**
**Goal:** Provide an instant "Health Check" of the business.

#### **1. Visualization & Charts**
*   **Expiry Funnel (Bar Chart):**
    *   *X-Axis:* Time (This Week, This Month, Next 3 Months)
    *   *Y-Axis:* Number of Documents
    *   *Color:* Red (Expired), Orange (< 30 days), Green (Safe)
*   **Application Pipeline (Donut Chart):**
    *   Segments: New Lead (20%), Docs Collected (30%), Applied (40%), Approved (10%).
*   **Revenue Trend (Line Chart - Admin Only):**
    *   Monthly processed applications vs rejected.

#### **2. Key Metrics Widgets (Top Row)**
*   **Urgent Actions:** "5 Passports expiring this week" (Hyperlink to filtered list).
*   **Active Pipeline:** "12 Applications in 'Applied' stage".
*   **Pending Tasks:** "3 New Leads assigned to you".
*   **Storage Used:** "4.5GB / 10GB" (Progress Bar).

#### **3. Recent Activity Feed**
*   *Format:* Avatar + Action + Timestamp.
*   *Example:* "Rahul uploaded 'Passport Front' for Client John Doe (2 mins ago)."

---

### **B. Customer Management (`/customers`)**

#### **1. Customer List Page (`/customers`)**
*   **Columns:**
    *   Avatar + Full Name (Link to Profile).
    *   Status (Lead/Active/Archived).
    *   Phone (Click-to-WhatsApp).
    *   Next Expiry (Date Badge).
    *   Assigned Agent.
*   **Filters:**
    *   Status: [All, Leads, Customers]
    *   Expiry: [Next 30 Days, Expired]
    *   Agent: [Me, Unassigned]

#### **2. Add/Edit Customer Form (Modal/Drawer)**
> **Design Principle:** Split into logical steps to avoid "Long Form Fatigue".

*   **Step 1: Basic Info**
    *   `Full Name` (Text, Required)
    *   `Gender` (Select: Male/Female/Other)
    *   `Date of Birth` (Date Picker)
    *   `Email` (Email, optional for family members)
    *   `Phone Number` (Phone Input with Country Code)
    *   `Nationality` (Select with Search)
    *   `Reference/Source` (Select: Walk-in, Website, Referral)

*   **Step 2: Passport Details (Optional at creation)**
    *   `Passport Number` (Text, Validation: Alphanumeric)
    *   `Issue Date` (Date Picker)
    *   `Expiry Date` (Date Picker, **Critical Field**)
    *   `Place of Issue` (Text)
    *   `Front Image` (File Upload, Accept: JPG/PNG/PDF)
    *   `Back Image` (File Upload)

*   **Step 3: Family Grouping**
    *   `Is Family Head?` (Checkbox)
    *   *If No:* `Select Family Head` (Searchable Dropdown of existing customers)

---

### **C. Application Pipeline (`/applications`)**

#### **1. Kanban Board Page**
*   **Columns (Configurable):**
    1.  **Inquiry:** New leads from website/walk-in.
    2.  **Document Collection:** Waiting for customer uploads.
    3.  **Processing:** Form filling in progress.
    4.  **Submitted:** Application lodged with embassy.
    5.  **Result:** Approved/Rejected.

*   **Card Design:**
    *   **Header:** Customer Name + Country Flag (e.g., 🇨🇦 Canada).
    *   **Body:** Visa Type (Tourist/Work) + Priority Badge (High/Medium).
    *   **Footer:** "3 Days in this stage" (Aging Alert).

#### **2. New Application Form**
*   `Customer` (Searchable Select, Required)
*   `Target Country` (Select: USA, UK, Canada, etc.)
*   `Visa Type` (Select: Tourist, Student, Work Permit, PR)
*   `Target Submission Date` (Date Picker)
*   `Priority` (Radio: Normal, Urgent)
*   `Notes` (Textarea)

---

### **D. Document Vault (`/documents`)**

#### **1. File Manager View**
*   **Folder Structure:** Root > Customer Name > Category (Personal/Financial).
*   **Visuals:**
    *   Grid View with Thumbnail Previews for Images/PDFs.
    *   List View with "Size", "Uploaded By", "Date".

#### **2. Upload Component**
*   **Dropzone:** "Drag 'n' drop files here, or click to select".
*   **Fields per File:**
    *   `Category` (Select: ID Proof, Financial, Legal, Other)
    *   `Expiry Date` (Optional, if the document expires like a Driver's License)

---

### **E. Settings & Admin (`/settings`)**

#### **1. Firm Profile Form**
*   `Firm Name` (Text)
*   `Brand Color` (Color Picker) - Affects sidebar/button colors.
*   `Logo` (Image Upload)
*   `Currency` (Select: USD, INR, EUR)

#### **2. User Management (Table)**
*   `Name`, `Email`, `Role` (Admin/Agent), `Status` (Active/Suspended).
*   **Action:** "Reset Password", "Deactivate".

#### **3. Notification Rules**
*   `Reminders`: [x] Email, [x] WhatsApp, [ ] SMS.
*   `Schedule`: Send at [ 9:00 AM ] Timezone [ IST ].
*   `Alerts`: Notify [ 6 Months ], [ 3 Months ], [ 1 Month ] before expiry.

---

## 🏗️ 3. OPTIMIZED APP ARCHITECTURE ("Feature-First")

Instead of grouping by file type (pages, components), we group by **Feature**. This ensures code related to "Customers" stays together, making maintenance easier as the app grows.

```
src/
├── app/                        # Next.js App Router (Routing Layer ONLY)
│   ├── (auth)/                 # Login, Register, Forgot Password
│   ├── (dashboard)/            # Authenticated Routes
│   │   ├── layout.tsx          # Sidebar & Header Logic
│   │   ├── page.tsx            # Dashboard Home
│   │   ├── [firmId]/           # Tenant Scope
│   │   │   ├── customers/
│   │   │   ├── applications/
│   │   │   └── settings/
│   │   └── super-admin/
│   └── api/                    # Route Handlers (Webhooks, External)
│
├── features/                   # ⭐️ BUSINESS LOGIC CORE
│   ├── auth/
│   ├── customers/
│   │   ├── components/         # CustomerList, CustomerForm
│   │   ├── hooks/              # useCustomer, useCreateCustomer
│   │   ├── server/             # Server Actions (createCustomer.ts)
│   │   └── types.ts            # Zod Schemas & TS Interfaces
│   ├── documents/
│   ├── applications/
│   └── billing/
│
├── core/                       # Shared Utilities
│   ├── db/                     # Prisma Client & Extensions
│   ├── ui/                     # Shadcn UI Components (Button, Input)
│   ├── lib/                    # Helper functions (date-fns, formatting)
│   └── hooks/                  # Global hooks (useToast, useSession)
│
└── styles/                     # Global CSS & Tailwind Config
```

---

## 🗄️ 4. ROBUST DATABASE SCHEMA (PRISMA)

**Key Improvements:**
*   **Soft Deletes:** Added `deletedAt` to all critical models to prevent accidental data loss.
*   **Indexing:** Added `@@index` for high-performance querying on frequent filters.
*   **Enums:** Strictly typed status fields.
*   **JSON Fields:** Used for flexible configuration (Settings, Logs).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- ENUMS ---
enum Role {
  SUPER_ADMIN
  FIRM_OWNER
  AGENT
}

enum FirmStatus {
  ACTIVE
  SUSPENDED
  PENDING_VERIFICATION
}

enum AppStatus {
  LEAD
  DOCS_COLLECTED
  APPLIED
  BIOMETRICS
  APPROVED
  REJECTED
}

// --- CORE MODELS ---

model Firm {
  id              String        @id @default(uuid())
  name            String
  slug            String        @unique // For vanity URLs (app.com/firm-name)
  email           String        // Official contact email
  phone           String?
  logoUrl         String?
  subscriptionPlan String       @default("FREE") 
  status          FirmStatus    @default(ACTIVE)
  
  settings        Json?         // { "branding": { "color": "#000" }, "smtp": {...} }
  
  users           User[]
  customers       Customer[]
  applications    Application[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?     // 🗑️ Soft Delete
  
  @@index([status])
}

model User {
  id        String    @id @default(uuid())
  firmId    String?   // Null for Super Admins
  firm      Firm?     @relation(fields: [firmId], references: [id])
  
  name      String
  email     String    @unique
  password  String    // Argon2 hashed
  role      Role      @default(AGENT)
  isActive  Boolean   @default(true)
  
  lastLogin DateTime?
  
  // Audits
  actions   ActivityLog[]
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? 
  
  @@index([firmId])
  @@index([email])
}

// --- BUSINESS MODELS ---

model Customer {
  id            String    @id @default(uuid())
  firmId        String
  firm          Firm      @relation(fields: [firmId], references: [id])
  
  fullName      String
  email         String?   // Can be null for family members
  phone         String?   
  passportMeta  String?   // Quick search field (e.g. Passport Number)
  
  // Family Logic
  familyGroupId String?
  familyGroup   FamilyGroup? @relation(fields: [familyGroupId], references: [id])
  isFamilyHead  Boolean      @default(false)
  
  visas         Visa[]
  passports     Passport[]
  documents     Document[]
  applications  Application[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  
  @@index([firmId])
  @@index([phone])
  @@index([email])
  @@index([familyGroupId])
}

model FamilyGroup {
  id        String     @id @default(uuid())
  firmId    String
  name      String     // e.g. "The Patel Family"
  members   Customer[]
  
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Passport {
  id          String    @id @default(uuid())
  customerId  String
  customer    Customer  @relation(fields: [customerId], references: [id])
  
  number      String
  country     String
  issueDate   DateTime
  expiryDate  DateTime
  
  frontImage  String?   // Path to file
  backImage   String?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  @@index([expiryDate]) // ⚡️ CRITICAL for Expiry Cron Jobs
  @@index([number])
}

model Visa {
  id          String    @id @default(uuid())
  customerId  String
  customer    Customer  @relation(fields: [customerId], references: [id])
  
  country     String
  type        String    // e.g. "Work", "Tourist"
  grantDate   DateTime?
  expiryDate  DateTime
  status      String    // Active, Expired
  
  fileUrl     String?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  @@index([expiryDate]) // ⚡️ CRITICAL for Expiry Cron Jobs
}

model Application {
  id          String    @id @default(uuid())
  firmId      String
  firm        Firm      @relation(fields: [firmId], references: [id])
  customerId  String
  customer    Customer  @relation(fields: [customerId], references: [id])
  
  targetCountry String
  visaType      String
  status        AppStatus @default(LEAD)
  priority      String    @default("MEDIUM") // LOW, MEDIUM, HIGH
  
  notes       String?   @db.Text
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  
  @@index([firmId, status]) // For Kanban Board filtering
}

model Document {
  id          String    @id @default(uuid())
  customerId  String
  customer    Customer  @relation(fields: [customerId], references: [id])
  
  name        String
  category    String    // "ID Proof", "Financial", "Legal"
  fileUrl     String
  fileSize    Int       // In bytes
  mimeType    String
  
  uploadedAt  DateTime  @default(now())
  deletedAt   DateTime?
}

model ActivityLog {
  id        String   @id @default(uuid())
  firmId    String
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  
  action    String   // "VIEW_CUSTOMER", "DELETE_DOCUMENT"
  ipAddress String?
  userAgent String?
  details   Json?    // { "targetId": "123", "oldValue": "A", "newValue": "B" }
  
  createdAt DateTime @default(now())
  
  @@index([firmId, createdAt]) // For audit trails
}
```

---

## ⚡️ 5. OPTIMIZATION STRATEGIES

### **A. Performance**
1.  **Server Components (RSC):** Fetch data directly in data-heavy pages. Zero client-side JS bundle overhead for data fetching.
2.  **Debounced Search:** Global search input debounced by 300ms to save DB hits.
3.  **Image Optimization:** Use `next/image` for Passport previews with `blurDataURL`.
4.  **Pagination:** Cursor-based pagination (using Prisma) for infinite scroll lists to handle 10k+ records.

### **B. Security**
1.  **Rate Limiting:** `upstash/ratelimit` on all API routes (e.g., 100 requests/min per IP) to prevent abuse.
2.  **Input Sanitization:** Zod middleware to strip dangerous characters from inputs before db operations.
3.  **Signed URLs:** S3/MinIO downloads must use temporary signed URLs (expire in 15 mins), never public buckets.

### **C. Reliability**
1.  **Transaction Support:** Use `prisma.$transaction([])` when creating a Customer + Application simultaneously to ensure atomic writes.
2.  **Error Boundaries:** Wrap major feature sections in React Error Boundaries to prevent full app crashes on isolated component errors.
3.  **Offline Mode:** Service Worker caches static assets (CSS/JS) so the app opens instantly even on flaky internet.