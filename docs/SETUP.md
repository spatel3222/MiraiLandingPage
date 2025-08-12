# Internal Documentation Setup Guide

## 🎯 Overview

This setup provides a GitHub-based internal documentation system for CRTX.in that's accessible through web browsers and integrates with your existing development workflow.

## 📁 Directory Structure Created

```
/docs/
├── README.md              # Main documentation overview
├── index.md               # Navigation hub
├── SETUP.md               # This setup guide
├── decisions/             # Architecture Decision Records (ADRs)
│   └── 2024-08-12-agentic-ai-branding-consistency.md
├── reviews/               # Code, design, content reviews
├── internal/              # Meeting notes, planning docs
├── processes/             # Development workflows, procedures
└── templates/             # Document templates
    ├── decision-record.md
    ├── review-template.md
    └── meeting-notes.md
```

## 🌐 How to Access Documentation

### Method 1: GitHub Web Interface (Primary)
1. Navigate to: `https://github.com/spatelCRTX/crtx.in/tree/main/docs`
2. Click on any `.md` file to view rendered markdown
3. Use GitHub's built-in search to find documents
4. Edit files directly in GitHub web interface

### Method 2: Local Development
1. Clone the repository: `git clone https://github.com/spatelCRTX/crtx.in.git`
2. Navigate to docs: `cd crtx.in/docs`
3. View files in your preferred markdown editor
4. Use VS Code with markdown preview for rich viewing

### Method 3: GitHub Pages (Optional Enhancement)
To enable a browsable website for your docs:
1. Go to repository Settings → Pages
2. Select "Deploy from a branch"
3. Choose "main" branch and "/docs" folder
4. Docs will be available at: `https://spatelCRTX.github.io/crtx.in/docs/`

## 📝 Creating New Documents

### 1. Decision Records
```bash
# Copy template
cp docs/templates/decision-record.md docs/decisions/YYYY-MM-DD-your-decision.md
# Edit and commit
```

### 2. Reviews
```bash
# Copy template  
cp docs/templates/review-template.md docs/reviews/YYYY-MM-DD-review-type-component.md
# Edit and commit
```

### 3. Meeting Notes
```bash
# Copy template
cp docs/templates/meeting-notes.md docs/internal/YYYY-MM-DD-meeting-topic.md
# Edit and commit
```

## 🔄 Workflow Integration

### With GitHub Issues
- Link documents to issues using `#issue-number`
- Reference documents in issue discussions
- Create issues from action items in meeting notes

### With Pull Requests
- Include decision records in PR descriptions
- Reference relevant documentation
- Update docs as part of feature development

### With Team Collaboration
- Use @mentions to tag team members
- Add reviewers to documentation PRs
- Track changes through git history

## 🏷️ Recommended Naming Conventions

### Files
- **Dates:** Always start with `YYYY-MM-DD-`
- **Descriptive:** Use clear, searchable names
- **No spaces:** Use hyphens instead of spaces
- **Lowercase:** Keep filenames lowercase

### Examples
```
2024-08-12-consulting-page-redesign-decision.md
2024-08-12-ux-review-side-by-side-comparison.md
2024-08-12-weekly-planning-meeting.md
2024-08-12-agent-collaboration-process.md
```

## 🔍 Search and Discovery

### GitHub Search
- Use repository search: `path:docs/ your-search-term`
- Search within files: `path:docs/ "specific phrase"`
- Filter by file type: `path:docs/ extension:md your-term`

### Organization Tips
- Update the index.md file when adding important docs
- Use consistent tags in decision records
- Cross-reference related documents
- Maintain a changelog for major decisions

## 🛡️ Security and Access

### Current Setup
- Documents stored in private repository
- Access controlled by GitHub repository permissions
- Version history preserved through git
- No sensitive information should be stored in these docs

### Best Practices
- Don't include API keys, passwords, or sensitive data
- Use environment variables or separate secure storage for secrets
- Keep internal discussions separate from public documentation

## 📊 Maintenance

### Regular Tasks
- [ ] Update index.md with new documents
- [ ] Archive old meeting notes periodically  
- [ ] Review and update process documentation
- [ ] Clean up outdated decision records

### Quality Checks
- [ ] Ensure all templates are up to date
- [ ] Verify links are working
- [ ] Check for consistent formatting
- [ ] Review naming conventions compliance

## 🚀 Next Steps

1. **Move existing docs:** Relocate existing .md files from root to appropriate docs subdirectories
2. **Create first decision record:** Document a recent important decision using the template
3. **Set up regular review process:** Schedule periodic documentation reviews
4. **Train team members:** Ensure everyone knows how to create and find documents

---
*Setup completed: August 12, 2024 | Next review: September 12, 2024*