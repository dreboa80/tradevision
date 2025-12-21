<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1vYXDaItA9XbzmuNYa0Cn4LyUTNthc7UO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a local env file:
   - Copy `.env.example` to `.env.local`
   - Set `GEMINI_API_KEY` to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Vercel
1. Push this repo to GitHub.
2. In Vercel, import the repo.
3. In **Project Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your key
   - (optional) `GEMINI_MODEL` = model name
4. Build settings (Vite defaults usually work):
   - Build Command: `npm run build`
   - Output Directory: `dist`
