# Change Your Search 🔍

A world-class, customizable search engine that automatically appends contextual phrases (like "metaphysical properties of") to your queries. Built with React, Supabase for Cloud Sync, and Gemini AI for grounded insights.

## Features

- **Customizable Context**: Automatically prepend or append specific phrases to every search.
- **Cloud Sync**: Secure login via Supabase to keep your search records synchronized across devices.
- **Hall of Records**: A persistent, searchable history of your inquiries with AI-powered summaries.
- **AI Insights**: Integrated Google Search grounding via Gemini 3 to provide instant summaries of your topics.
- **Data Privacy**: Secure authentication with password complexity requirements and email verification.
- **Export Ready**: Download your research in CSV, TXT, or GitHub-optimized Markdown.

## Tech Stack

- **Frontend**: React (ESM-based, no-build setup)
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase
- **AI Engine**: Google Gemini API (@google/genai)
- **Language**: TypeScript

## Getting Started

1. Clone the repository.
2. Open `index.html` in any modern browser OR run `npm start`.
3. Configure your Supabase credentials in `services/supabase.ts`.
4. (Optional) Provide your Gemini API key via environment variables.

## License

MIT
# changeyoursearch
