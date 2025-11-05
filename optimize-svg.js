const { optimize } = require("svgo");
const fs = require("fs");
const path = require("path");

// Read the original SVG file
const svgPath = path.join(__dirname, "public/logo/vector/default512x512.svg");
const svgContent = fs.readFileSync(svgPath, "utf8");

// SVGO configuration to merge paths
const svgoConfig = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // Remove viewBox if width/height are set
          removeViewBox: false,
          // Keep path data
          convertPathData: false,
        },
      },
    },
    // Try to merge paths
    "mergePaths",
    // Convert to paths (if needed)
    "convertShapeToPath",
  ],
};

// Optimize the SVG
const result = optimize(svgContent, svgoConfig);

if (result.error) {
  console.error("❌ SVGO Error:", result.error);
  process.exit(1);
}

// Check if we still have multiple paths
const pathCount = (result.data.match(/<path/g) || []).length;

if (pathCount > 1) {
  console.log(
    `⚠️  Warning: Still ${pathCount} path elements after optimization`
  );
  console.log("   Telegram requires exactly 1 path element.");
  console.log("\n   Trying manual path combination...");

  // Extract all paths and combine them
  const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/g;
  const paths = [];
  let match;

  while ((match = pathRegex.exec(result.data)) !== null) {
    paths.push(match[1].trim());
  }

  // Extract SVG attributes
  const viewBoxMatch = result.data.match(/viewBox="([^"]*)"/);
  const widthMatch = result.data.match(/width="([^"]*)"/);
  const heightMatch = result.data.match(/height="([^"]*)"/);

  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 512 512";
  const width = widthMatch ? widthMatch[1].replace(/px|"/g, "").trim() : "512";
  const height = heightMatch
    ? heightMatch[1].replace(/px|"/g, "").trim()
    : "512";

  // Combine paths
  const combinedPath = paths.join(" ");

  // Create new SVG with single path
  const newSvg = `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
<path d="${combinedPath}" fill="#000000"/>
</svg>`;

  // Write the optimized file
  const outputPath = path.join(
    __dirname,
    "public/logo/vector/default512x512-single-path.svg"
  );
  fs.writeFileSync(outputPath, newSvg, "utf8");

  console.log(`✅ Created single-path SVG with ${paths.length} combined paths`);
  console.log(`📁 Output: ${outputPath}`);
} else {
  // Write the optimized file directly
  const outputPath = path.join(
    __dirname,
    "public/logo/vector/default512x512-single-path.svg"
  );
  fs.writeFileSync(outputPath, result.data, "utf8");

  console.log(`✅ Optimized SVG (${pathCount} path element)`);
  console.log(`📁 Output: ${outputPath}`);
}

console.log("\n📝 If Telegram still rejects it:");
console.log("   1. The path data might be too complex");
console.log(
  "   2. Try using an online tool like https://jakearchibald.github.io/svgomg/"
);
console.log("   3. Consider creating a simpler outline/stroke version");
