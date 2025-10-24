# Logo Setup Instructions

## Required Logo File
Please add your Goshawk AI logo PNG file to the project:

**File Location:** `public/goshawk-ai-logo.png`

## Logo Specifications
- **Format:** PNG with transparent background
- **Recommended Size:** 200x60 pixels (or similar aspect ratio)
- **Content:** The logo should include both the hawk head and "GOSHAWKAI" text as shown in the provided design

## Where the Logo Will Appear
1. **Auth Page** (`/auth`) - Above the sign-in buttons, centered
2. **App Sidebar** - In the main application layout sidebar

## Implementation Details
The logo is implemented using Next.js Image component with:
- Responsive sizing
- Proper alt text for accessibility
- Priority loading for better performance
- Transparent background support

## Next Steps
1. Add your `goshawk-ai-logo.png` file to the `public/` directory
2. The logo will automatically appear in both locations
3. Test the application to ensure the logo displays correctly

The code is already set up to use the logo - you just need to add the actual PNG file!
