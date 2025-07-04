# MMX (metamagicX) - Adobe Stock Assistant

A Chrome extension that automates the process of adding metadata to Adobe Stock uploads using AI-powered image analysis.

## Features

- 🖼️ Automatic image analysis using Pollinations.ai API
- ✨ Smart metadata generation (titles, descriptions, keywords, categories)
- ⚡ Real-time form filling
- 🎨 Clean and intuitive user interface
- 🔄 Background processing for multiple uploads
- ⚙️ Configurable settings for advanced users

## Installation

### Development Mode

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `MMX` directory

### Production (Coming Soon)

Once published on the Chrome Web Store, you'll be able to install it with one click.

## Usage

1. Upload your images to Adobe Stock Contributor Portal
2. Click the MMX extension icon in your browser toolbar
3. Click "Start Processing" to begin automatic metadata generation
4. Review the generated metadata
5. Submit your uploads with one click

## Configuration

Access the settings by clicking the gear icon in the extension popup. You can configure:

- API settings
- Form filling behavior
- User interface preferences
- Advanced options

## Development

### Project Structure

```
MMX/
├── manifest.json           # Extension manifest
├── popup/                 # Popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # Content scripts
│   ├── content.js
│   └── content.css
├── background/            # Background scripts
│   └── background.js
├── utils/                 # Utility functions
│   ├── api.js
│   ├── imageProcessor.js
│   └── formHandler.js
├── config/                # Configuration
│   └── config.js
└── icons/                 # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Building

1. Install dependencies (if any):
   ```bash
   npm install
   ```

2. Build the extension (if using a build system)

3. Load the extension in Chrome as described in the Installation section

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy Policy

This extension processes images using Pollinations.ai API. No personal data is collected or stored by the extension.
