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
4. Make your changes to the fields (see field descriptions below)
5. Click **"Save"** in the top right corner
6. Your changes will be saved and the website will automatically update (this may take a minute)

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

- **Saving Changes**: After clicking "Save", your changes are saved to the website's code repository. Netlify will automatically rebuild and deploy the updated website within 1-2 minutes.

- **Images**: You can upload new images by clicking on the image field. Images will be stored in the appropriate folder automatically.

## Need Help?

If you encounter any issues or need to make changes that aren't available in the CMS, contact the developer.

## Important Notes

- **Don't delete pies** - The CMS is configured to only allow editing, not deleting
- **Don't change hidden fields** - Fields like "Type" and "Date" are automatically managed
- **Test your changes** - After saving, wait a minute and check the live website to see your changes

