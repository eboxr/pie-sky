# Content Management System (CMS) User Guide

## For Website Owner - How to Update Pie Information

This guide will help you update pie information on the website without needing to know how to code.

## Accessing the CMS

1. Go to your website: `https://pieinthesky-eden.com/admin`
2. You'll see a "Login with GitHub" button - click it
3. You'll be redirected to GitHub to authorize the app (if this is your first time)
4. Once authorized, you'll be redirected back to the CMS dashboard
5. You'll see different pie categories you can edit

**Note**: You'll need a GitHub account to use the CMS. If you don't have one, you can create a free account at [github.com](https://github.com). The developer will need to grant you access to the repository first.

## Available Pie Categories

- **Fruit Pies** - Seasonal fruit pies (apple, cherry, peach, etc.)
- **Cream Pies** - Year-round cream pies (chocolate, banana, coconut, etc.)
- **Special Pies** - Holiday and specialty pies (pumpkin, pecan, etc.)
- **Dinner Pies** - Savory pies (beef, chicken, turkey, vegetarian)
- **Hand Pies** - Individual hand pies (sweet and savory)

## How to Edit a Pie

1. Click on the pie category you want to edit (e.g., "Fruit Pies")
2. Find the pie you want to update in the list
3. Click on the pie name to open the editor
4. You'll see the editor with:
   - **Left side**: All the editable fields (title, description, price, images, etc.)
   - **Right side**: A live preview showing how your pie will look on the website
5. Make your changes to the fields - the preview will update automatically as you type
6. The preview shows **two views**:
   - **Card View**: How the pie appears on the homepage (in the pie listing section)
   - **Full Pie Page View**: How the pie appears on its individual page
7. When you're ready to save, click the **"Publish"** button in the top right corner
8. Your changes will be saved to the website and automatically deployed to production (this may take 1-2 minutes)

## Field Descriptions

### Common Fields (All Pie Types)

- **Title**: The name of the pie (e.g., "Apple Pie")
- **Description**: A longer description of the pie (optional)
- **Short Description**: Brief text that appears below the title on the pie card (optional)
- **Ingredients**: List of ingredients (supports markdown formatting)
- **Price**: The price in dollars (e.g., enter "25" for $25)
- **Sold Out**: Check this box to mark the pie as sold out (will show a "SOLD OUT" sticker)
- **Images**: The pie photos (you can upload new images or use existing ones)

### Special Fields for Dinner Pies

Dinner pies have additional fields because they come in two sizes:

- **Family Size Sold Out**: Check if family size pies are sold out
- **Family Size Sold Out Message**: Custom message when family size is sold out (e.g., "*Family size pies are temporary **SOLD OUT***")
- **Personal Size Sold Out**: Check if personal size pies are sold out
- **Personal Size Sold Out Message**: Custom message when personal size is sold out

## Tips

- **Markdown Support**: You can use markdown in text fields:
  - `**bold text**` for bold
  - `*italic text*` for italic
  - `~~strikethrough~~` for strikethrough

- **Sold Out Status**: When you check "Sold Out", a red "SOLD OUT" sticker will automatically appear on the pie image on the website.

- **Saving Changes**: 
  - Click the **"Publish"** button (not "Save") to save your changes
  - The "Publish" button saves your changes to the website's code repository
  - Netlify will automatically detect the changes, rebuild the website, and deploy it to production
  - Your changes will be live on the website within 1-2 minutes
  - **Important**: The "Publish" button deploys directly to production - make sure you're happy with your changes before publishing!

- **Preview Feature**: 
  - The preview panel on the right shows you exactly how your pie will look on the website
  - You'll see both the card view (as it appears on the homepage) and the full pie page view
  - The preview updates automatically as you make changes
  - Use the preview to check that images, text, and formatting look correct before publishing

- **Images**: You can upload new images by clicking on the image field. Images will be stored in the appropriate folder automatically.

## Need Help?

If you encounter any issues or need to make changes that aren't available in the CMS, contact the developer.

## Important Notes

- **Don't delete pies** - The CMS is configured to only allow editing, not deleting
- **Don't change hidden fields** - Fields like "Type" and "Date" are automatically managed
- **Publish = Deploy to Production** - The "Publish" button saves your changes and deploys them to the live website. There's no separate "Save Draft" option - all changes go live immediately
- **Test your changes** - After publishing, wait 1-2 minutes and check the live website to verify your changes appear correctly
- **Use the preview** - Always check the preview panel before publishing to make sure everything looks good

