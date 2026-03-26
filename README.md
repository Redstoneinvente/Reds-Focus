<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/47507a50-3e82-4be7-83e5-6043e9044242

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

Push to `main` and GitHub Actions will build and deploy the site with the included workflow at [.github/workflows/deploy-pages.yml](/g:/Reds-Focus/.github/workflows/deploy-pages.yml).

In GitHub, open `Settings -> Pages` and set `Source` to `GitHub Actions`.
