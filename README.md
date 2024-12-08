# Website Summarizer Chrome Extension

A Chrome extension that summarizes web pages using AI. The extension converts webpage content to markdown and then uses Claude (Anthropic's AI) to generate concise summaries.

## Features

- Convert webpages to markdown using r.jina.ai
- Generate summaries using Claude AI
- Simple, user-friendly interface
- Secure API key management
- Options page for configuration

## Prerequisites

- Node.js and npm installed
- Chrome browser
- Anthropic API key

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd website-summarizer
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` directory from your project folder

## Configuration

1. Click the extension icon in Chrome
2. Click "Configure API Key" or right-click the extension icon and select "Options"
3. Enter your Anthropic API key
4. Click "Save"

## Usage

1. Navigate to any webpage you want to summarize
2. Click the extension icon in your Chrome toolbar
3. Click "Summarize This Page"
4. Wait a few seconds for the summary to appear

## Development

### File Structure
```
website-summarizer/
├── src/
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── background/
│   │   └── background.js
│   └── config/
│       └── config.js
├── assets/
│   ├── icon48.png
│   └── icon128.png
├── dist/          # Generated after building
├── manifest.json
├── package.json
├── webpack.config.js
├── .env           # Environmental variables (don't commit!)
└── .gitignore
```

### Local Development

1. Make changes to files in the `src` directory
2. Run `npm run build` to build the extension
3. Refresh the extension in Chrome to see your changes

### Building

```bash
npm run build
```

The built extension will be in the `dist` directory.

## Security Notes

- Never commit your API keys
- The extension uses Chrome's storage API to securely store your API key
- API calls are made directly to Anthropic's API with appropriate headers

## Permissions

The extension requires the following permissions:
- `activeTab`: To access the current webpage
- `scripting`: To interact with webpage content
- `storage`: To store API keys
- Host permissions for api.anthropic.com and r.jina.ai

## Acknowledgments

- Uses r.jina.ai for markdown conversion
- Uses Anthropic's Claude for AI summarization
