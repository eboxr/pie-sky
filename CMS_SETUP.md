# CMS Setup Guide for Developers

## Overview

This project uses **Decap CMS** (formerly Netlify CMS) to provide a user-friendly web interface for non-technical users to edit pie content. The CMS works directly with Git using GitHub OAuth, so no database or Netlify Identity is required. **This works on any Netlify plan, including the free plan!**

## What Was Added

1. **`static/admin/index.html`** - The CMS admin interface
2. **`static/admin/config.yml`** - CMS configuration defining editable fields
3. **`CMS_USER_GUIDE.md`** - User guide for the website owner

## Setup Steps

To enable the CMS, you need to create a GitHub OAuth App. This is free and works on any plan:

### 1. Create a GitHub OAuth App

1. Go to GitHub and navigate to your repository: `https://github.com/eboxr/pie-sky`
2. Go to **Settings** → **Developer settings** → **OAuth Apps** (or go directly to: `https://github.com/settings/developers`)
3. Click **New OAuth App**
4. Fill in the form:
   - **Application name**: `Pie in the Sky CMS` (or any name you prefer)
   - **Homepage URL**: `https://pieinthesky-eden.com`
   - **Authorization callback URL**: `https://pieinthesky-eden.com/admin/`
5. Click **Register application**
6. **Important**: Copy the **Client ID** (you'll need this)
7. Click **Generate a new client secret** and copy the **Client secret** (you'll need this too)

### 2. Add Environment Variables to Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:
   - **Key**: `GITHUB_CLIENT_ID` → **Value**: (paste your Client ID from step 1)
   - **Key**: `GITHUB_CLIENT_SECRET` → **Value**: (paste your Client secret from step 1)
4. Click **Save**

### 3. Update the CMS Config (if needed)

The CMS is already configured with your repository (`eboxr/pie-sky`) and branch (`master`). If your production branch is different:

1. Edit `static/admin/config.yml`
2. Change the `branch` value under `backend`:
   ```yaml
   backend:
     name: github
     repo: eboxr/pie-sky
     branch: your-production-branch
   ```

### 4. Grant Repository Access

The owner (or anyone who needs to edit) will need:

1. A GitHub account
2. Write access to the repository (you can add them as a collaborator in GitHub repository settings)
3. To visit `https://pieinthesky-eden.com/admin` and log in with GitHub

## How It Works

1. User visits `https://pieinthesky-eden.com/admin`
2. User clicks "Login with GitHub" and authorizes the app
3. User edits content through the web interface
4. CMS commits changes directly to your Git repository
5. Netlify automatically detects the commit and rebuilds the site
6. Changes go live within 1-2 minutes

## Development Workflow

- **For you (developer)**: Continue working as normal. The CMS only edits content files in `content/` directories.
- **For the owner**: They use the web interface at `/admin` to make updates.
- **No conflicts**: Since the CMS only edits content files and you're likely working on templates/styles, conflicts are rare.

## Local Development

To test the CMS locally, you can enable local backend mode:

1. Edit `static/admin/config.yml`
2. Uncomment the line:
   ```yaml
   local_backend: true
   ```
3. Run `npx netlify-cms-proxy-server` in a separate terminal
4. Access the CMS at `http://localhost:1313/admin` (or your Hugo dev server URL)

**Remember to comment out `local_backend: true` before deploying!**

## Security Notes

- The CMS only allows editing existing content (no creating/deleting pies)
- Hidden fields (type, date, etc.) are protected from accidental changes
- Users must authenticate with GitHub and have write access to the repository
- All changes are tracked in Git, so you can review and revert if needed
- Only users you grant repository access to can edit content

## Granting Access to the Owner

To allow the owner to edit content:

1. Go to your GitHub repository: `https://github.com/eboxr/pie-sky`
2. Click **Settings** → **Collaborators** → **Add people**
3. Enter the owner's GitHub username or email
4. They'll receive an invitation email
5. Once they accept, they can access `/admin` and log in with GitHub

**Note**: If the owner doesn't have a GitHub account, they'll need to create one (it's free).

## Troubleshooting

### CMS doesn't load or shows authentication error
- Verify the GitHub OAuth App is created correctly
- Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in Netlify environment variables
- Ensure the Authorization callback URL in GitHub OAuth App matches: `https://pieinthesky-eden.com/admin/`
- After adding environment variables, you may need to trigger a new Netlify deploy

### "Repository not found" error
- Verify the `repo` field in `config.yml` matches your repository (currently: `eboxr/pie-sky`)
- Check that the user has access to the repository

### Changes don't appear
- Check Netlify build logs for errors
- Verify the branch in `config.yml` matches your production branch
- Check that the user has write access to the repository

### Can't save changes
- Verify the user has write access to the GitHub repository
- Check GitHub repository settings to ensure the user is a collaborator
- Look for errors in the browser console (F12)

## Customization

To add more editable fields or collections, edit `static/admin/config.yml`. The Decap CMS documentation is available at: https://decapcms.org/docs/

