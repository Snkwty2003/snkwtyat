// Build Script for Minification
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// قائمة الملفات المراد ضغطها
const filesToMinify = {
    css: [
        "css/variables.css",
        "css/base.css",
        "css/components.css",
        "css/advanced.css",
        "css/navbar.css",
        "css/hero.css",
        "css/features.css",
        "css/stats.css",
        "css/templates.css",
        "css/about.css",
        "css/testimonials.css",
        "css/contact.css",
        "css/faq.css"
    ],
    js: [
        "js/navbar.js",
        "js/advanced.js",
        "js/counters.js",
        "js/main.js"
    ]
};

// دالة لضغط ملف CSS
function minifyCSS(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        // إزالة التعليقات والمسافات الزائدة
        const minified = content
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\s+/g, " ")
            .replace(/\s*([{}:;,])\s*/g, "$1")
            .replace(/;\}/g, "}")
            .trim();

        return minified;
    } catch (error) {
        console.error(`Error minifying CSS file ${filePath}:`, error);
        return null;
    }
}

// دالة لضغط ملف JS
function minifyJS(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        // إزالة التعليقات والمسافات الزائدة
        const minified = content
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\/\/.*$/gm, "")
            .replace(/\s+/g, " ")
            .replace(/\s*([{}();,:<>])\s*/g, "$1")
            .trim();

        return minified;
    } catch (error) {
        console.error(`Error minifying JS file ${filePath}:`, error);
        return null;
    }
}

// دالة لإنشاء مجلد الإخراج
function ensureOutputDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// دالة رئيسية لضغط الملفات
function build() {
    console.log("🚀 Starting build process...\n");

    // ضغط ملفات CSS
    console.log("📦 Minifying CSS files...");
    const cssOutputDir = "dist/css";
    ensureOutputDir(cssOutputDir);

    filesToMinify.css.forEach(file => {
        const minified = minifyCSS(file);
        if (minified) {
            const outputPath = path.join(cssOutputDir, path.basename(file));
            fs.writeFileSync(outputPath, minified);

            const originalSize = fs.statSync(file).size;
            const minifiedSize = Buffer.byteLength(minified, "utf8");
            const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

            console.log(`  ✓ ${file}: ${originalSize}B → ${minifiedSize}B (${reduction}% reduction)`);
        }
    });

    // ضغط ملفات JS
    console.log("\n📦 Minifying JavaScript files...");
    const jsOutputDir = "dist/js";
    ensureOutputDir(jsOutputDir);

    filesToMinify.js.forEach(file => {
        const minified = minifyJS(file);
        if (minified) {
            const outputPath = path.join(jsOutputDir, path.basename(file));
            fs.writeFileSync(outputPath, minified);

            const originalSize = fs.statSync(file).size;
            const minifiedSize = Buffer.byteLength(minified, "utf8");
            const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

            console.log(`  ✓ ${file}: ${originalSize}B → ${minifiedSize}B (${reduction}% reduction)`);
        }
    });

    console.log("\n✅ Build completed successfully!");
}

// تشغيل البناء
build();
