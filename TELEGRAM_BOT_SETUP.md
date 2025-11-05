#### RUNNIG WEB HOOK

```
curl -X POST "https://api.telegram.org/bot8399156152:AAEZCvknDgJ8RLH6LQXTTlOL0Nw75efj6dQ/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://test-ease-new.vercel.app/api/telegram/webhook",
    "allowed_updates": ["message", "callback_query"],
    "drop_pending_updates": true
  }'
```

#### SPLASH SCREEN SETUP

The splash screen is displayed at the center of the screen while the Mini App loads. Follow these requirements when setting it up through BotFather:

**Recommended: SVG Format**

- **Canvas Size**: 512x512 pixels
- **Structure**: Single `<path>` element inside the SVG
- **Example structure**:
  ```svg
  <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <path d="M..."/>
  </svg>
  ```
- **Quality**: High quality, optimized for display

**Alternative Formats (Not Recommended)**

- **WEBP**: 512x512 pixels
  - An outline will be automatically generated
  - Lower quality than SVG
- **TGS**: 512x512 pixels
  - An outline will be automatically generated
  - Lower quality than SVG

**Notes:**

- SVG with a single `<path>` element is the preferred and recommended format
- Alternative formats (WEBP/TGS) may result in lower quality as an outline is auto-generated
- The icon will be displayed centered on the screen during Mini App loading
- Upload the splash screen file through BotFather when configuring your Mini App

**How to Convert Your SVG to Single Path:**

Your SVG file (`public/logo/vector/default512x512.svg`) has been converted to a single-path version:

- **Converted file**: `public/logo/vector/default512x512-single-path.svg`
- This file contains all 17 path elements combined into a single `<path>` element
- The file uses `fill="currentColor"` which will adapt to the theme color

**How to Send the Splash Screen:**

1. **Using BotFather**:

   - Open BotFather in Telegram
   - Send `/mybots` and select your bot
   - Choose "Bot Settings" → "Mini App"
   - Select "Splash Screen"
   - Upload the file: `public/logo/vector/default512x512-single-path.svg`

2. **File Requirements Check**:
   - ✅ Canvas size: 512x512 pixels
   - ✅ Single `<path>` element
   - ✅ Valid SVG format
   - ✅ Ready for Telegram Mini App

**Troubleshooting: "Unable to extract the contents of the SVG file"**

If Telegram rejects your SVG with this error, try the following solutions:

1. **Use SVGO Optimizer** (Recommended):

   ```bash
   yarn optimize-svg
   # or manually:
   node optimize-svg.js
   ```

   This will optimize and merge paths using SVGO.

2. **Use Online SVG Optimizer**:

   - Visit https://jakearchibald.github.io/svgomg/
   - Upload your `default512x512.svg` file
   - Enable "Merge paths" option
   - Download the optimized version
   - Ensure it has only 1 `<path>` element

3. **Create a Simpler Outline Version**:

   - If your logo is too complex, create a simplified outline/stroke version
   - Use vector graphics software (Illustrator, Inkscape) to:
     - Convert to outline/stroke
     - Simplify paths
     - Merge all paths into one
   - Export as SVG with 512x512 canvas

4. **Check Path Data Format**:

   - Ensure the path `d` attribute doesn't have syntax errors
   - Remove any extra spaces or invalid characters
   - Verify each sub-path starts with `M` (move) command when combined

5. **Alternative: Use WEBP/TGS Format**:
   - If SVG continues to fail, convert to WEBP or TGS format
   - Telegram will auto-generate an outline (lower quality but works)
   - Use a 512x512 pixel image

**Current Status**:

- ✅ Optimized file created: `public/logo/vector/default512x512-single-path.svg`
- ⚠️ If still rejected, the path data may be too complex for Telegram's parser
- 💡 Consider using an online optimizer or creating a simpler version
