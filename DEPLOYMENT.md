# CRTX.in Deployment Guide

## Branch Strategy

### Production Environment
- **Branch:** `main`
- **URL:** https://crtx.in
- **Deploy:** Automatic on push to `main`

### Staging Environment  
- **Branch:** `staging`
- **URL:** https://spatelCRTX.github.io/staging/
- **Deploy:** Automatic on push to `staging`

### Development Environment
- **Branch:** `develop` 
- **Purpose:** Feature integration and testing

## Workflow

```
feature-branch → develop → staging → main (production)
```

### 1. Feature Development
```bash
git checkout develop
git checkout -b feature/your-feature-name
# Make changes
git commit -m "Add new feature"
git push origin feature/your-feature-name
```

### 2. Integration Testing
```bash
# Create PR: feature/your-feature → develop
# After merge to develop:
git checkout staging
git merge develop
git push origin staging
# Check staging: https://spatelCRTX.github.io/staging/
```

### 3. Production Release
```bash
# Create PR: staging → main
# After merge to main:
# Production automatically deploys to https://crtx.in
```

## GitHub Pages Configuration

### Required Settings (GitHub Web Interface)
1. **Repository Settings → Pages**
   - Source: Deploy from a branch
   - Branch: `main` / `(root)`
   - Custom domain: `crtx.in`

2. **Branch Protection Rules**
   - Protect `main` branch
   - Require pull request reviews
   - Require status checks to pass

## Manual Setup Steps

### 1. Push Branches (when connectivity restored)
```bash
git push origin staging develop
```

### 2. Configure Branch Protection
Go to: **GitHub → Settings → Branches → Add rule**
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging

### 3. Enable GitHub Pages for Staging
- Create separate GitHub Pages site for staging branch
- Or use GitHub Pages environment deployments

## Files Created
- `.github/workflows/staging-deploy.yml` - Staging deployment
- `.github/workflows/production-deploy.yml` - Production deployment  
- `.gitignore` - Updated to exclude build artifacts
- `DEPLOYMENT.md` - This documentation

## Benefits
- 🚀 **Automated deployments** for both staging and production
- 🛡️ **Branch protection** prevents direct pushes to production
- 🔄 **Clean workflow** for testing before production
- 📱 **Preview changes** on staging before going live