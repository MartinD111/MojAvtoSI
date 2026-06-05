import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const distAvtoDir = path.resolve('dist-avto');
const distNavtikaDir = path.resolve('dist-navtika');

console.log('Assembling GitHub Pages builds...');

// Clean up and recreate dist
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy dist-avto contents to dist (MojAvto as root)
if (fs.existsSync(distAvtoDir)) {
    console.log('Copying MojAvto build (dist-avto) to dist...');
    fs.cpSync(distAvtoDir, distDir, { recursive: true });
} else {
    console.error('Error: dist-avto directory not found. Run build:avto first.');
    process.exit(1);
}

// Copy dist-navtika contents to dist/navtika (MojaNavtika as subfolder)
if (fs.existsSync(distNavtikaDir)) {
    console.log('Copying MojaNavtika build (dist-navtika) to dist/navtika...');
    const navtikaTargetDir = path.join(distDir, 'navtika');
    fs.mkdirSync(navtikaTargetDir, { recursive: true });
    fs.cpSync(distNavtikaDir, navtikaTargetDir, { recursive: true });
} else {
    console.error('Error: dist-navtika directory not found. Run build:navtika first.');
    process.exit(1);
}

console.log('GitHub Pages build assembly completed successfully!');
