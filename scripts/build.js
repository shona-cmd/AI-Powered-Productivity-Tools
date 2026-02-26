/**
 * Build Script
 * Bundles the application for production
 */

import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

console.log('🔨 Starting build...');
console.log(`📦 Mode: ${isProduction ? 'production' : 'development'}`);

// Ensure dist directory exists
const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy static files to dist
const staticFiles = ['index.html', 'styles.css', 'auth.css', 'payment.css'];
staticFiles.forEach(file => {
    const src = path.join(process.cwd(), file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${file}`);
    }
});

// Build core modules
try {
    await esbuild.build({
        entryPoints: ['src/core/index.js', 'src/components/index.js'],
        bundle: true,
        outdir: 'dist/src',
        format: 'esm',
        minify: isProduction,
        sourcemap: !isProduction,
        target: ['es2020'],
        logLevel: 'info'
    });
    console.log('✅ Core modules bundled successfully');
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}

console.log('🎉 Build complete!');
console.log('📁 Output directory: dist/');
