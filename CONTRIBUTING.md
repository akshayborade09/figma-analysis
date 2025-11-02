# Contributing to Figma UX Analysis Tool

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/your-repo/issues)
2. If not, create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Figma version, etc.)

### Suggesting Features

1. Check [Discussions](https://github.com/your-repo/discussions) for similar ideas
2. Create a new discussion or issue with:
   - Clear use case
   - Proposed solution
   - Alternative approaches considered
   - Impact on existing functionality

### Code Contributions

#### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/figma-ux-analysis.git
   cd figma-ux-analysis
   ```

3. Install dependencies:
   ```bash
   # Cloudflare Worker
   cd cloudflare-worker
   npm install
   
   # Figma Plugin
   cd ../figma-plugin
   npm install
   
   # Shared utilities
   cd ../shared
   npm install
   ```

4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Making Changes

**For Cloudflare Worker:**
- Edit `cloudflare-worker/src/index.js`
- Test locally: `npm run dev`
- Verify with curl or Postman

**For Figma Plugin:**
- Edit `figma-plugin/code.ts` or `ui.html`
- Build: `npm run build`
- Test in Figma desktop app

**For Shared Utilities:**
- Edit files in `shared/`
- Ensure both worker and plugin can import

#### Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code patterns
- Keep functions focused and small
- Use TypeScript types where applicable

#### Testing

Before submitting:
1. Test basic workflow (select frame → analyze → view comments)
2. Test error cases (no selection, invalid config, API failures)
3. Test with different platforms (iOS, Android, Web)
4. Verify no console errors
5. Check Worker logs for issues

#### Commit Guidelines

Use conventional commits:
- `feat: Add new feature`
- `fix: Fix bug in analysis`
- `docs: Update README`
- `style: Format code`
- `refactor: Restructure worker`
- `test: Add tests`
- `chore: Update dependencies`

Examples:
```bash
git commit -m "feat: Add support for dark mode analysis"
git commit -m "fix: Handle missing frame dimensions"
git commit -m "docs: Add troubleshooting section to README"
```

#### Pull Request Process

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create Pull Request on GitHub with:
   - Clear title and description
   - Link to related issues
   - Screenshots/demos if applicable
   - Testing steps

3. Wait for review:
   - Address feedback
   - Make requested changes
   - Push updates to same branch

4. Once approved:
   - PR will be merged
   - Your contribution will be credited!

## Development Guidelines

### Project Structure

```
figma-ux-analysis/
├── figma-plugin/       # Figma plugin (TypeScript)
├── cloudflare-worker/  # Backend API (JavaScript)
├── shared/             # Shared code
└── docs/               # Documentation
```

### Adding New Analysis Frameworks

1. **Add constants** in `shared/constants.js`:
   ```javascript
   export const NEW_FRAMEWORK = {
     name: 'Framework Name',
     principles: [...]
   };
   ```

2. **Update prompt** in `cloudflare-worker/src/index.js`:
   ```javascript
   if (config.frameworks.newFramework) {
     frameworks.push('- **New Framework:** Description');
   }
   ```

3. **Add checkbox** in `figma-plugin/ui.html`:
   ```html
   <div class="checkbox-item">
     <input type="checkbox" id="newFramework" checked>
     <label for="newFramework">New Framework</label>
   </div>
   ```

4. **Update types** in `shared/types.ts`:
   ```typescript
   frameworks: {
     newFramework: boolean;
     // ... other frameworks
   }
   ```

### Adding New Design Types

1. Add to `shared/constants.js`:
   ```javascript
   export const DESIGN_TYPES = {
     NEW_TYPE: 'new_type'
   };
   ```

2. Add option in `figma-plugin/ui.html`:
   ```html
   <option value="new_type">New Type</option>
   ```

### Modifying Analysis Prompt

Edit `buildAnalysisPrompt()` in `cloudflare-worker/src/index.js`:
- Adjust instructions
- Change output format
- Add new categories
- Modify severity levels

### Improving Comment Formatting

Edit formatting functions in `cloudflare-worker/src/index.js`:
- `formatSummary()` - Summary comment
- `formatComment()` - Individual feedback
- `calculatePosition()` - Comment placement

## Common Tasks

### Update Dependencies

```bash
# Check for updates
cd cloudflare-worker && npm outdated
cd ../figma-plugin && npm outdated

# Update
npm update

# Test after updating
npm run dev
```

### Debug Worker

```bash
cd cloudflare-worker

# View logs in real-time
npm run tail

# Test endpoint
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Debug Plugin

1. Open Figma desktop app
2. Open DevTools: **Plugins** → **Development** → **Open Console**
3. View `console.log()` outputs
4. Check network requests

## Questions?

- 💬 [GitHub Discussions](https://github.com/your-repo/discussions)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)
- 📧 Email: support@example.com

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on what's best for the project
- Show empathy towards others

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making this project better! 🙏

