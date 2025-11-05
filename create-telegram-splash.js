const fs = require("fs");
const path = require("path");

// Read the original SVG file
const svgPath = path.join(__dirname, "public/logo/vector/default512x512.svg");
const svgContent = fs.readFileSync(svgPath, "utf8");

// Extract all path elements with their data
const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/g;
const paths = [];
let match;

while ((match = pathRegex.exec(svgContent)) !== null) {
  const pathData = match[1].trim();
  // Ensure each path starts with a move command
  if (pathData && pathData.length > 0) {
    paths.push(pathData);
  }
}

// Extract dimensions
const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
const widthMatch = svgContent.match(/width="([^"]*)"/);
const heightMatch = svgContent.match(/height="([^"]*)"/);

const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 512 512";
const width = widthMatch ? widthMatch[1].replace("px", "").trim() : "512";
const height = heightMatch ? heightMatch[1].replace("px", "").trim() : "512";

// Combine paths - each path should be a separate sub-path
// In SVG, you can combine multiple paths in one path element by separating them
const combinedPath = paths.join(" ");

// Create a minimal, clean SVG that Telegram can parse
// Remove XML declaration and use simple attributes
const newSvg = `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
<path d="${combinedPath}" fill="#000000"/>
</svg>`;

// Write the new SVG file
const outputPath = path.join(
  __dirname,
  "public/logo/vector/default512x512-single-path.svg"
);
fs.writeFileSync(outputPath, newSvg, "utf8");

console.log(`✅ Created single-path SVG`);
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Combined ${paths.length} paths`);
console.log(`\n📝 Note: If Telegram still rejects it, the issue might be:`);
console.log(`   1. Path data is too complex`);
console.log(`   2. Need to use an SVG optimizer (like SVGO)`);
console.log(`   3. Consider creating a simpler outline version`);
