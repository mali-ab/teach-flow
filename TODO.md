To elevate **TeachFlow** into an enterprise-grade platform (like Zoom, Loom, or Google Meet with monetization), here is a strategic feature expansion list, followed by an actionable step-by-step **Implementation TODO Plan**.

---

### 💡 High-Value Features You Can Add (Ideas Expansion)

1. **Payment System & Monetization**:
* **Pay-per-Meeting / Paid Webinars**: Integration with Stripe to host paid online classes or 1-on-1 tutoring sessions.
* **Subscription Tiers (Freemium)**: Free tier (max 40 mins meeting, 5 participants) vs. Pro tier (unlimited time, recording, up to 100 participants).


2. **Meeting Scheduling & Calendar Sync**:
* **Scheduled Rooms**: Generate upcoming meeting links with date, time, and custom passcodes.
* **Google/Outlook Calendar Export**: Download `.ics` invite files or add direct "Add to Google Calendar" links.


3. **Meeting Duration & Limits Enforcement**:
* **Live Meeting Timer & Countdown Warning**: Visual banner showing elapsed time and a "5 minutes left" pop-up.
* **Auto-Termination**: Server/Frontend automatically ends the meeting when the limit expires (unless extended by the host).


4. **Interactive Whiteboard**:
* Collaborative drawing canvas embedded directly into the meeting room (built with **Excalidraw** or **TLDraw** synced over WebSockets/Jitsi data channel).


5. **Additional High-Impact Features**:
* **Cloud / Local Recording**: WebM browser recording or backend media recording via Jibri/FFmpeg.
* **AI Meeting Summaries & Transcripts**: Integrate OpenAI / Whisper API to generate meeting notes and action items automatically after the call.
* **Breakout Rooms**: Divide large classes into smaller groups for interactive exercises.
* **Email/SMS Notifications**: Send automated email reminders (via SendGrid/Resend) 15 minutes before a scheduled meeting starts.



---

### 📋 Complete Todo Implementation Plan

#### **Phase 1: Database Schema Expansion (Go Backend)**

* [ ] **Database Migration (PostgreSQL / GORM / SQL)**:
* [ ] Update `users` table: Add `subscription_plan` (`free`, `pro`), `stripe_customer_id`.
* [ ] Update `meetings` table: Add fields for `scheduled_at`, `duration_minutes`, `is_paid`, `price_cents`, `whiteboard_data`.
* [ ] Create `payments` table: Track `user_id`, `meeting_id`, `stripe_payment_intent_id`, `status`, `amount`.



---

#### **Phase 2: Payment System Integration (Stripe)**

* [ ] **Backend (Go)**:
* [ ] Install Stripe SDK (`github.com/stripe/stripe-go/v74`).
* [ ] Create `/api/payments/create-checkout-session` endpoint for paid meeting tickets or plan upgrades.
* [ ] Implement Stripe Webhook handler (`/api/webhooks/stripe`) to catch `checkout.session.completed` events and verify ticket access.


* [ ] **Frontend (React & TypeScript)**:
* [ ] Add `@stripe/stripe-js` and `@stripe/react-stripe-js`.
* [ ] Create `<CheckoutModal />` component on the Schedule / Join Meeting page for locked or paid meetings.



---

#### **Phase 3: Meeting Scheduling System**

* [ ] **Backend (Go)**:
* [ ] Create `POST /api/meetings/schedule` route to save future meeting dates, duration, title, and access keys.
* [ ] Create `GET /api/meetings/upcoming` route to fetch scheduled calls for the user's dashboard.


* [ ] **Frontend (React)**:
* [ ] Build a `<ScheduleMeetingModal />` with date/time pickers and duration selectors.
* [ ] Update `Dashboard.tsx` and `UpcomingMeeting.tsx` to list scheduled sessions dynamically with an "Add to Calendar" (.ics generation) button.



---

#### **Phase 4: Meeting Duration Enforcement & Timers**

* [ ] **Backend (Go)**:
* [ ] Include `max_duration_seconds` in the response when a participant joins via `/api/meetings/:id/join`.


* [ ] **Frontend (React - `MeetingRoom.tsx` & `MeetingHeader.tsx`)**:
* [ ] Create a custom React hook `useMeetingTimer(durationMinutes)`.
* [ ] Display a live digital timer in `MeetingHeader.tsx`.
* [ ] Trigger a toast/modal alert when **5 minutes remaining**.
* [ ] Trigger `leaveConference()` and auto-redirect to an "Ended Meeting Summary" page when timer hits `00:00`.



---

#### **Phase 5: Interactive Collaborative Whiteboard**

* [ ] **Whiteboard Setup**:
* [ ] Install `@excalidraw/excalidraw` or `tldraw` in the frontend (`/frontend`).
* [ ] Create a `<WhiteboardModal />` or full-screen overlay component inside `src/components/meetings/`.


* [ ] **Real-time Syncing**:
* [ ] Connect the whiteboard state using Jitsi’s native `api.executeCommand('send-endpoint-text-message')` or a custom Go WebSocket server to sync drawings across all active participants in real time.


* [ ] **Controls Overlay**:
* [ ] Add a "Toggle Whiteboard" button to `MeetingControls.tsx`.



---

#### **Phase 6: AI Features & Enhancements (Bonus)**

* [ ] Add automated email notification service via SendGrid or Resend when a meeting is scheduled.
* [ ] Integrate Whisper API for audio transcription on recorded sessions.