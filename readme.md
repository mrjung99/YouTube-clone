# YouTube Clone with Netlify Serverless Functions

A responsive YouTube clone that uses the YouTube API with automatic API key rotation through Netlify serverless functions.

![home page demo](image.png)

## Key Features

- 🎥 YouTube-like video player with custom controls
- 🔍 Video search and recommendations
- 🔄 Multiple API key fallback system
- 🔒 Secure API key management via Netlify functions
- 📱 Fully responsive design
- ⚡ Fast loading with client-side rendering

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Netlify Serverless Functions
- YouTube Data API v3
- Deployed on Netlify

## Project Structure

youtube-clone/
├── api/
│ └── youtube.js # Serverless function handler
├── js/
│ ├── playVideo.js # Video player logic
│ └── script.js # Main application logic
├── index.html # Home page
├── PlayVideo.html # Video player page
├── netlify.toml # Netlify configuration
└── README.md

## Setup Instructions

### 1. Prerequisites

- Node.js (v14+)
- Netlify account
- YouTube API keys (2-3 recommended)

### 2. Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/youtube-clone.git
cd youtube-clone

# No installation needed for frontend-only development

### Create a .env file for local testing
YOUTUBE_API_KEY_1=your_first_key
YOUTUBE_API_KEY_2=your_second_key
```
