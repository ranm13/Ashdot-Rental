# Real Estate Management System – Functional Specification Document (FSD)

[cite_start]This document outlines the core functional requirements, technical architecture, and data structures for the internal Real Estate Management System developed for Ashdot Yaakov Meuhad[cite: 1].

---

## 1. Project Overview & Scope
* [cite_start]**Objective:** Centralize, organize, and make real estate data accessible for efficient kibbutz property management[cite: 2].
* **Target Audience:** Internal management team (1–10 total users, max 2 concurrent users).
* [cite_start]**Language:** The underlying database and codebase architecture use English standards, but the user interface (UI) and all data entries must be entirely in **Hebrew**[cite: 1, 36].
* [cite_start]**Core Principles:** * Strict tabular data views[cite: 36].
  * [cite_start]Visual spatial tracking via a coordinate-mapped aerial photography layer (תצ"א)[cite: 3].
  * Bulletproof data preservation (Zero data-loss policy).
  * [cite_start]Role-Based Access Control (RBAC)[cite: 39].

---

## 2. Core Functional Requirements

### 2.1 Visual Map Integration
* [cite_start]The frontend must feature an interactive aerial map (תצ"א) displaying all kibbutz property sectors: Students (סטודנטים), Residents (תושבים), and Businesses (עסקים)[cite: 3].
* The map will render spatial coordinates onto an interactive layer using custom pinpoint/polygon data.

### 2.2 Dashboards & Filtering
* [cite_start]**Departmental Dashboards:** Each organizational department requires an independent dashboard[cite: 36].
* **Global Dashboard:** A master dashboard aggregating overall system expenses, including:
  * [cite_start]Employee salaries (משכורות עובדים)[cite: 36].
  * [cite_start]Legal fees (עו"ד)[cite: 36].
  * [cite_start]Construction & maintenance (בינוי ואחזקה)[cite: 36].
  * [cite_start]IT & software expenses (הוצאות מחשוב ותוכנות)[cite: 36].
* **Status Filtering:** Real-time property filters based on operational status to clearly identify:
  * [cite_start]Vacant units (פנוי)[cite: 36].
  * [cite_start]Allocation potential / upcoming absorption for new residents (בפוטנציאל לשיוך/שיווק לנקלטים)[cite: 36].

### 2.3 Data Export
* Built-in native support for generating and downloading tabular data views directly into Microsoft Excel formatting.

---

## 3. Sector & Entity Specifications

### 3.1 Residential Units / Resident Apartments (בתי מגורים / דירות תושבים)
Every residential entry must support the following specific attributes:
* [cite_start]**House Number:** (מספר בית)[cite: 5].
* [cite_start]**Units Per Building:** (מספר דירות בבית)[cite: 6].
* [cite_start]**Ownership Matrix:** Tracks allocation status and unit ownership[cite: 7]. [cite_start]Standard shared buildings default to 4 physical owners (בכל בית משותף יש 4 בעלים)[cite: 7].
* [cite_start]**Structural Splitting/Merging:** * The system must dynamically support "split apartments" where a 4-owner building contains up to 8 functional apartments (חלק מהדירות מפוצלות כך שיש מצב בו בבית משותף יש 8 דירות ו-4 בעלי דירות)[cite: 8].
  * [cite_start]Administrators must have the interface capacity to physically merge or split apartments within the system (אפשרות לחבר או לפצל דירות בבתים משותפים)[cite: 9].
* [cite_start]**Mixed Ownership Support:** Flexibility to flag multi-party ownership combinations, including the Kibbutz, external heirs, or estate members (בעלות מעורבת = קיבוץ, יורשים, חברי משק)[cite: 10].
* [cite_start]**Tenant Profile:** Full name, phone number, and email address (שם דייר כולל מייל וטלפון)[cite: 11].
* **Payment Routing Target:** Identifies exactly who receives the rental payment:
  * [cite_start]The Kibbutz directly (קיבוץ)[cite: 12].
  * [cite_start]Heirs under Kibbutz management (יורשים בניהול הקיבוץ)[cite: 12].
  * [cite_start]Direct payment to external heirs (ישירות ליורשים)[cite: 12].
* **Financials & Logistics:**
  * [cite_start]Monthly rent amount (סכום שכ"ד)[cite: 13].
  * [cite_start]Municipal property tax ID (מס' נכס ארנונה)[cite: 14].
  * [cite_start]Water meter identifier (מס' מונה מים)[cite: 15].
  * [cite_start]Contract termination date (תאריך סיום חוזה)[cite: 16].
* [cite_start]**Maintenance Tracker:** Operational logger tracking internal apartment issues and external infrastructural issues (e.g., roofs, stairwells) alongside cost values (תחזוקה נדרשת – גם פנימית בכל דירה וגם חיצונית כולל עלויות)[cite: 17].

### 3.2 Student Housing (דירות סטודנטים)
Student residential properties track simplified parameters:
* [cite_start]**House & Unit IDs:** (מספר בית, מספר דירות בבית)[cite: 19, 20].
* [cite_start]**Tenant Profile:** Full name, phone, and email (שם דייר כולל מייל וטלפון)[cite: 21].
* [cite_start]**Payment Destination:** (קיבוץ / יורשים בניהול הקיבוץ / ישירות ליורשים)[cite: 22].
* [cite_start]**Core Unit Attributes:** Rent amount [cite: 23][cite_start], Arnona tax ID [cite: 24][cite_start], Water meter ID [cite: 25][cite_start], and Contract end date[cite: 26].
* [cite_start]**Maintenance & Costs:** Tracker for internal and external maintenance logs with dedicated fields for calculating costs[cite: 27].

### 3.3 Commercial Properties (עסקים)
Commercial spaces track corporate-specific parameters:
* [cite_start]**Business Profile:** Business name, owner's name, email, and contact number (שם העסק, שם בעלי העסק כולל מייל וטלפון)[cite: 29].
* [cite_start]**Core Unit Attributes:** Rent amount [cite: 30][cite_start], Arnona tax ID [cite: 31][cite_start], Water meter ID [cite: 32][cite_start], and Contract end date[cite: 33].
* [cite_start]**Maintenance:** General tracking field for commercial structural upkeep[cite: 34].
* **Usage Regulation (הסדרת שימושים):** Strict status state containing exactly one of the following selections:
  * [cite_start]Regulated (הוסדר)[cite: 35].
  * [cite_start]In Progress (בטיפול)[cite: 35].
  * [cite_start]ILA Report Not Received (לא התקבל דו"ח מרמ"י)[cite: 35].

---

## 4. System Security & Access Control

### 4.1 Role-Based Access Control (RBAC)
[cite_start]The system strictly segregates application access to enforce strict data containment and authorization parameters[cite: 39]:
* [cite_start]**Editor Accounts (4 Users):** Full creation, read, and mutation/update capabilities across all data tables[cite: 39].
* **Viewer Accounts (3 Users):** Read-only data access. [cite_start]Viewers are restricted from altering any records or executing data changes[cite: 39].

### 4.2 Data Retention Policy (Soft Deletes)
* **Rule:** Data must live in perpetuity; destructive physical deletes are strictly banned.
* **Implementation:** The backend framework must intercept application removals by executing a **Soft Delete** pattern. Tables must maintain an `is_active` boolean or a `deleted_at` timestamp. Database user profiles must be stripped of standard SQL `DELETE` permissions to ensure compliance.

---

## 5. Proposed Technology Stack

The application will be built as a custom full-stack software application tailored to support low-concurrency, high-integrity tabular interactions.

* **Frontend Framework:** React.js (TypeScript) paired with **Leaflet.js** (`react-leaflet`) for custom coordinate mapping over satellite views.
* **UI Design Engine:** Mantine UI or Ant Design (leveraging robust built-in Right-to-Left RTL configuration to support Hebrew text formatting).
* **Backend Runtime:** Node.js (TypeScript) running Express or Fastify.
* **Database Management:** PostgreSQL (Relational structure required to handle nested building-to-apartment parent-child relationships).
* **Excel Processor:** `exceljs` or `xlsx` on the backend server layer.

---

## 6. Phase 2 Roadmap & Future Migrations
[cite_start]Future system expansions will introduce external microservices and third-party API hookups[cite: 37]:
* [cite_start]**ERP Financial Integration:** Direct data mapping with Hashavshevet (חשבשבת) accounting systems[cite: 38].
* [cite_start]**Automated Communications:** Automated outbound messaging through WhatsApp and standard Email relays[cite: 38].
* [cite_start]**Ticketing Systems:** Operational dispatch mechanics to receive incoming notifications and technical service requests (קריאות שירות)[cite: 38].
* [cite_start]**Legal Automation:** External syncing with legally binding digital contract execution tools[cite: 38].