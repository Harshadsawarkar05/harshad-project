# Palak's Booking — Email Notification Setup

The app is a small Express server ([server.js](server.js)) that serves [Palak_edited.html](Palak_edited.html) and exposes a `POST /send-email` endpoint. The frontend calls that endpoint **only** when the final "lock it in ♥" button is clicked (step 5) — selecting vibe/date/time/food never sends an email, and refreshing the page or restarting the flow can't trigger a duplicate send.

## 1. Install dependencies
```powershell
npm install
```

## 2. Configure environment variables
Create/edit the `.env` file in the project root (already gitignored):
```
RESEND_API_KEY=your_resend_api_key_here
PORT=3000
```
- Get a free API key from [resend.com](https://resend.com).
- By default Resend's sandbox `onboarding@resend.dev` sender only delivers to the account owner's verified email — verify a domain/sender in Resend if you need to send to other addresses.

## 3. Run the server
```powershell
npm start
```
Then open http://localhost:3000 in your browser (don't open the HTML file directly — it needs the backend for `/send-email` to work).

## 4. Test the flow
- Go through steps 1–4 (say yes, pick a date/time, pick a food) — no email is sent during these steps.
- Click **"lock it in ♥"** on step 4. Only this click calls `/send-email`.
- On success, step 5 shows the "✅ Confirmation email sent!" message and `harshadsawarkar05@gmail.com` receives the email with vibe/date/time/food and the final message.
- On failure (e.g. missing/invalid `RESEND_API_KEY`), an error message is shown on step 4 and the button re-enables so you can retry — no false success is shown.
