# Talk No Filter — Youth SRH & HIV Education Platform

This is the full-stack codebase for **Talk No Filter**, a youth-friendly digital platform delivering safe, private, and accurate sexual and reproductive health (SRH) education and consultations.

---

## Technical Stack

* **Frontend**: Next.js 14 (TypeScript, App Router, Tailwind CSS, Context API)
* **Backend**: Node.js + Express (TypeScript, REST APIs, JSON Web Tokens)
* **Database**: SQLite (via Prisma ORM) for low-friction local testing
* **Security**: AES-256-GCM field-level encryption for sensitive health content

---

## Getting Started

### 1. Initialize & Start the Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. The database has been automatically created (`prisma/dev.db`) and seeded with clinical experts, availability slots, and debunking entries.
3. Start the Express backend engine:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### 2. Start the Next.js Frontend

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   *The client dashboard will run on `http://localhost:3000`.*

---

## 🔑 Mock Credentials for Sandbox Testing

### 1. Standard Client / Youth Login
* Standard users do not require passwords or pre-registration.
* Simply click **"Join / Sign In"** in the navigation header, select standard login, and input any phone number (e.g. `+250 788 123 456`).
* The system will automatically instantiate a pseudonymous profile and credit wallet.

### 2. Verified Clinical Expert Login
* To login as one of our seeded practitioners, select **"Log in as Verified Expert"** inside the login portal and enter one of these seeded identifiers:
  * `expert1` (Dr. Keza Aline — HIV Prevention & Care Specialist)
  * `expert2` (Dr. Ntwari Jean — Youth SRH Consultant)
  * `expert3` (Dr. Uwase Marie — Adolescent Gynaecologist)
  * `expert4` (Dr. Mugisha Eric — Clinical Psychologist & Mental Health Specialist)
  * `expert5` (Dr. Umutoni Divine — Sexual & Reproductive Health Practitioner)

---

## 📲 Testing the Core User Journeys

1. **Book a Consult & Simulate Mobile Money**:
   * Log in as a User, navigate to `/book`.
   * Pick standard pass, pick an expert and select a timeslot.
   * Fill in your phone number and provider, click "Confirm and Pay".
   * A simulated USSD payment push modal will appear. Click **"Simulate PIN success"** to trigger the MTN/Airtel webhook, confirmation, and automatic timeslot booking lock.
2. **Consultation Rooms**:
   * Navigate to `My Bookings` on the user dashboard or `Consultations` on the expert dashboard.
   * Click **"Enter Room"** to launch the video room. You can chat, view the session clock, and trigger the emergency RBC crisis hotline overlays by entering key flags (e.g. *rape, overdose, emergency*).
3. **Generalize & Publish FAQ**:
   * Submit an anonymous question from the FAQ page.
   * Log in as `expert1`, go to the Admin Dashboard (`/dashboard/admin`).
   * Answer the question in the inbox, review/generalize content, and click "Publish" to sync to the public searchable FAQ.
