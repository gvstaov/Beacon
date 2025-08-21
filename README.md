# Beacon

A modern, full-featured productivity app built with Electron and TypeScript. It provides local storage, a modern interface, and essential features for organization and productivity.

## Main Features

* **Secure Local Storage** — All data stays on your computer
* **Modern Interface** — Optimized, responsive UX/UI
* **Optimized Performance** — Built with TypeScript and Webpack
* **Native Windows App** — Desktop application
* **Smart Auto-save** — Automatically saves your changes
* **Rich Editor** — Text formatting, lists, headings
* **Pages System** — Organize your content in pages
* **Import/Export** — Backup and data migration
* **Keyboard Shortcuts** — Productivity-focused shortcuts

## Technologies Used

* **Frontend:** TypeScript, HTML5, CSS3
* **Desktop:** Electron
* **Build:** Webpack
* **Packaging:** Electron Builder
* **Linting:** ESLint
* **Styling:** CSS Modules with CSS variables

## 📦 Prerequisites

* Node.js 16+
* npm or yarn
* Git

## Installation & Development

### 1. Clone the repository

```bash
git clone https://github.com/gvstaov/Beacon.git
cd Beacon
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Project structure

```
Beacon/
├── src/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Secure preload script
│   └── renderer/            # User interface
│       ├── index.html       # Main template
│       ├── index.ts         # App entry
│       ├── app/             # Application logic
│       │   └── Beacon.ts
│       └── styles/          # CSS styles
│           └── app.css
├── assets/                  # Icons and assets
├── dist/                    # Compiled files
├── release/                 # Generated executables
├── package.json             # Project configuration
├── tsconfig.json            # TypeScript configuration
├── webpack.main.config.js   # Webpack config (main)
└── webpack.renderer.config.js # Webpack config (renderer)
```

## Development Scripts

### Development

```bash
# Start in development mode
npm run dev

# Only the main process
npm run dev:main

# Only the renderer
npm run dev:renderer
```

### Build

```bash
# Full build
npm run build

# Production build
npm run build:prod

# Clean build files
npm run clean
```

### Distribution

```bash
# Create packaged executable (folder)
npm run pack

# Create full installer
npm run dist

# Windows specific
npm run dist:win

# macOS specific
npm run dist:mac

# Linux specific
npm run dist:linux
```

## Detailed Features

### Rich Text Editor

* Formatting: **bold**, *italic*, <u>underline</u>
* Headings: H1, H2, H3
* Bulleted lists
* Interactive task lists (todos)
* Organized blocks with visual handles

### Pages System

* Unlimited page creation
* Customizable icons (emojis)
* Fast navigation via sidebar
* Editable titles in real time

### Storage & Backup

* **Secure local storage** via Electron API
* Auto-save every 15 seconds
* Export to HTML and JSON
* Import from JSON
* No internet dependency

### Themes & Customization

* Light and dark themes
* Smooth transitions
* Responsive interface
* CSS variables for easy customization

### Keyboard Shortcuts

* `Ctrl+N` - New page
* `Ctrl+S` - Save
* `Ctrl+B` - Bold
* `Ctrl+I` - Italic
* `Ctrl+U` - Underline
* `Ctrl+1/2/3` - Headings
* `Ctrl+Shift+T` - Toggle theme
* `F11` - Fullscreen
* `Esc` - Close modals

## Security

* **Context Isolation** enabled
* **Node Integration** disabled in renderer
* **Content Security Policy** implemented
* **Preload script** with a limited, secure API
* Data stored locally only

## Architecture

### Main Process (main.ts)

* Manages the application window
* Controls native menu
* Handles filesystem operations
* Secure data storage

### Renderer Process (renderer/)

* User interface
* Application logic
* Text editor
* State management

### IPC Communication

* Secure channel between main and renderer
* APIs exposed via `contextBridge`
* Handlers for file operations

## Theme Customization

The theme system uses CSS variables for easy customization:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #37352f;
  --accent-color: #2383e2;
  /* ... other variables */
}

[data-theme="dark"] {
  --bg-primary: #191919;
  --text-primary: #ffffff;
  /* ... overrides for dark theme */
}
```

## Responsiveness

* Adaptive layout for different screen sizes
* Collapsible sidebar on mobile
* Toolbar optimized for touch
* Scalable fonts and spacing

## Debug & Logs

### Development Mode

```bash
# Enables DevTools automatically
NODE_ENV=development npm run dev
```

### Application Logs

* Renderer console for UI logs
* Main console for system logs
* Auto-save and file operation logs

## Distribution Builds

### Windows

* NSIS installer format
* Portable single-executable format
* x64 and x86 support

### macOS

* DMG disk image format
* ZIP archive format
* Intel and Apple Silicon support

### Linux

* AppImage format (universal)
* DEB (Debian/Ubuntu)
* RPM (Red Hat/Fedora)

## Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Code Standards

* TypeScript strict mode enabled
* ESLint configured for consistency
* Comments in Portuguese for main functions
* Variable and function names in English

## 🐛 Known Issues

### Windows

* Antivirus software may flag unsigned executable
* First run may be slower

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙋 Support

* 📧 Email: [gustavoavlis@icloud.com](mailto:gustavoavlis@icloud.com)
* 🐛 Issues: [GitHub Issues](https://github.com/gvstaov/Beacon/issues)
* 📚 Wiki: [Full Documentation](https://github.com/seu-usuario/Beacon/wiki)

---

**Beacon** — Your productivity, your rules. 🚀
