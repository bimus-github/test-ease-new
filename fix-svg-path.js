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
  paths.push(match[1].trim());
}

// Extract viewBox and dimensions
const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
const widthMatch = svgContent.match(/width="([^"]*)"/);
const heightMatch = svgContent.match(/height="([^"]*)"/);

const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 512 512";
const width = widthMatch ? widthMatch[1].replace("px", "") : "512";
const height = heightMatch ? heightMatch[1].replace("px", "") : "512";

// Combine paths properly - each path should be separated but can be in the same path element
// The key is that each sub-path should be independent
const combinedPath = paths.join(" ");

// Create a cleaner SVG with proper formatting
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
console.log(
  `\n⚠️  If Telegram still rejects it, try using a simpler monochrome version or use an online SVG optimizer.`
);
