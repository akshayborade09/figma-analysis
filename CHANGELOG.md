# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-30

### Added
- Initial release of Figma UX Analysis automation tool
- Figma plugin with frame selection and analysis triggering
- Cloudflare Worker backend for serverless processing
- Claude AI integration for vision-based UX analysis
- Support for multiple analysis frameworks:
  - WCAG Accessibility guidelines
  - Nielsen's 10 Heuristics
  - Gestalt Principles
  - Platform Guidelines (iOS/Android/Web)
  - UX Laws (Fitts's, Hick's, Miller's, Jakob's)
- Automated comment posting back to Figma
- Multi-frame batch analysis support
- Configurable design types (mobile, web, desktop, landing)
- Platform-specific analysis (iOS, Android, Web)
- Severity-based feedback (critical, high, medium, low, positive)
- Detailed feedback with actionable recommendations
- Connection testing in plugin UI
- Rate limiting to respect API limits
- Error handling and logging
- CORS support for Figma plugin
- Shared utilities and constants
- Comprehensive documentation (README, SETUP, CONTRIBUTING)

### Features
- **Plugin UI**
  - Frame selection counter
  - Live selection updates
  - Configuration options
  - Test connection button
  - Status messages and progress indicators
  - Local storage for Worker URL
  
- **Analysis Engine**
  - Image export from Figma (2x resolution)
  - Base64 encoding for Claude API
  - Structured prompt engineering
  - JSON response parsing
  - 10-15 specific findings per frame
  - Positive feedback inclusion
  
- **Comment System**
  - Summary comment with statistics
  - Individual detailed comments
  - Distributed positioning around frame
  - Emoji severity indicators
  - Markdown formatting
  - Timestamp tracking

### Technical
- TypeScript for Figma plugin
- JavaScript ES modules for Worker
- Figma Plugin API integration
- Figma REST API for images and comments
- Anthropic Claude API (claude-sonnet-4)
- Cloudflare Workers platform
- Git version control
- MIT License

### Documentation
- Complete README with overview and usage
- Step-by-step SETUP guide
- CONTRIBUTING guidelines
- API documentation
- Troubleshooting section
- Security best practices
- Pricing and limits info

[1.0.0]: https://github.com/your-repo/releases/tag/v1.0.0

