#!/usr/bin/env node

// Life System - Mobile Setup Script
// Automates PWA setup and mobile optimizations

const fs = require('fs');
const path = require('path');

console.log('🎮 Life System - Mobile App Setup');
console.log('=====================================\n');

// Check if we're in the right directory
function checkProjectStructure() {
    const requiredFiles = ['index.html', 'js/system.js', 'css/system.css', 'manifest.json'];
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
        console.log('❌ Missing required files:');
        missingFiles.forEach(file => console.log(`   - ${file}`));
        console.log('\nPlease run this script from your Life System project directory.');
        process.exit(1);
    }
    
    console.log('✅ Project structure looks good!');
}

// Create icons directory
function createIconsDirectory() {
    const iconsDir = 'icons';
    
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir);
        console.log('✅ Created icons/ directory');
    } else {
        console.log('✅ Icons directory already exists');
    }
}

// Generate basic favicon
function generateBasicIcons() {
    console.log('\n📱 Icon Generation:');
    console.log('   1. Open create-icons.html in your browser');
    console.log('   2. Click "Generate All Icons"');
    console.log('   3. Click "Download All Icons"');
    console.log('   4. Move downloaded icons to the icons/ folder');
    console.log('');
}

// Check HTTPS requirement
function checkHTTPS() {
    console.log('🔒 HTTPS Requirement:');
    console.log('   PWAs require HTTPS to work properly.');
    console.log('   Deploy to one of these free HTTPS services:');
    console.log('   • Netlify (netlify.com)');
    console.log('   • Vercel (vercel.com)');
    console.log('   • GitHub Pages (pages.github.com)');
    console.log('   • Firebase Hosting (firebase.google.com)');
    console.log('');
}

// Generate deployment instructions
function generateDeploymentGuide() {
    const deployGuide = `# 🚀 Life System - Deployment Instructions

## Quick Deploy Options:

### Option 1: Netlify (Easiest)
1. Go to netlify.com
2. Drag your project folder to the deploy area
3. Your app is live with HTTPS!

### Option 2: Vercel
1. Go to vercel.com
2. Connect your GitHub repository
3. Auto-deploy on every commit

### Option 3: GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select source branch
4. Your app is live at username.github.io/repository-name

### Option 4: Firebase Hosting
\`\`\`bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
\`\`\`

## After Deployment:
1. Test your PWA on mobile devices
2. Look for "Install App" prompts
3. Install the app to your home screen
4. Enjoy your mobile Life System!

## PWA Features:
✅ Works offline
✅ Installable from browser
✅ App-like experience
✅ Custom app icon
✅ Splash screen
✅ Push notifications (ready)

Happy leveling! 🎮⚔️
`;

    fs.writeFileSync('DEPLOYMENT.md', deployGuide);
    console.log('✅ Created DEPLOYMENT.md with deployment instructions');
}

// Create package.json for Node.js deployment
function createPackageJson() {
    const packageJson = {
        "name": "life-system-solo-leveling",
        "version": "1.0.0",
        "description": "Transform your life into an epic RPG adventure inspired by Solo Leveling",
        "main": "index.html",
        "scripts": {
            "start": "npx http-server . -p 3000 -c-1",
            "dev": "npx http-server . -p 3000 -c-1 -o",
            "build": "echo 'No build step needed for static app'",
            "deploy": "echo 'Deploy to your preferred hosting service'"
        },
        "keywords": [
            "pwa",
            "life-improvement",
            "gamification",
            "solo-leveling",
            "addiction-recovery",
            "fitness",
            "rpg"
        ],
        "author": "Your Name",
        "license": "MIT",
        "devDependencies": {
            "http-server": "^14.1.1"
        },
        "pwa": {
            "name": "Life System - Solo Leveling IRL",
            "short_name": "LifeSystem",
            "theme_color": "#3b82f6",
            "background_color": "#0f0f23",
            "display": "standalone",
            "orientation": "portrait",
            "scope": "/",
            "start_url": "/"
        }
    };

    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Created package.json for deployment');
}

// Validate manifest.json
function validateManifest() {
    try {
        const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
        console.log('✅ Manifest.json is valid');
        
        // Check for required fields
        const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
        const missingFields = requiredFields.filter(field => !manifest[field]);
        
        if (missingFields.length > 0) {
            console.log('⚠️  Missing manifest fields:', missingFields.join(', '));
        }
    } catch (error) {
        console.log('❌ Error in manifest.json:', error.message);
    }
}

// Check service worker
function validateServiceWorker() {
    if (fs.existsSync('sw.js')) {
        console.log('✅ Service worker (sw.js) found');
    } else {
        console.log('❌ Service worker (sw.js) missing');
    }
}

// Mobile optimization check
function checkMobileOptimizations() {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    
    const checks = [
        { name: 'Viewport meta tag', test: /<meta.*viewport.*>/ },
        { name: 'PWA manifest link', test: /<link.*manifest.*>/ },
        { name: 'Apple touch icon', test: /<link.*apple-touch-icon.*>/ },
        { name: 'Theme color', test: /<meta.*theme-color.*>/ }
    ];
    
    console.log('\n📱 Mobile Optimization Check:');
    checks.forEach(check => {
        const found = check.test.test(indexHtml);
        console.log(`   ${found ? '✅' : '❌'} ${check.name}`);
    });
}

// Create test server script
function createTestServer() {
    const serverScript = `#!/usr/bin/env node

// Simple HTTPS test server for PWA testing
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Self-signed certificate for testing (don't use in production)
const options = {
    key: fs.readFileSync(path.join(__dirname, 'test-cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'test-cert', 'cert.pem'))
};

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = https.createServer(options, (req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    if (pathname === '/') pathname = '/index.html';
    
    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        res.writeHead(200, {
            'Content-Type': mimeTypes[ext] || 'text/plain',
            'Service-Worker-Allowed': '/'
        });
        res.end(data);
    });
});

const PORT = 8443;
server.listen(PORT, () => {
    console.log(\`🔒 HTTPS test server running at https://localhost:\${PORT}\`);
    console.log('⚠️  You\\'ll see a security warning - click "Advanced" and "Proceed"');
    console.log('📱 Test your PWA features here!');
});
`;

    fs.writeFileSync('test-server.js', serverScript);
    console.log('✅ Created test-server.js for HTTPS testing');
}

// Main setup function
function runSetup() {
    console.log('Starting mobile app setup...\n');
    
    try {
        checkProjectStructure();
        validateManifest();
        validateServiceWorker();
        createIconsDirectory();
        generateBasicIcons();
        checkMobileOptimizations();
        createPackageJson();
        generateDeploymentGuide();
        checkHTTPS();
        
        console.log('\n🎉 Mobile setup complete!');
        console.log('\nNext steps:');
        console.log('1. Generate app icons using create-icons.html');
        console.log('2. Deploy to an HTTPS hosting service');
        console.log('3. Test PWA installation on mobile devices');
        console.log('4. Share your mobile Life System app!');
        console.log('\n📚 Check DEPLOYMENT.md for detailed instructions');
        console.log('📱 Check MOBILE_DEPLOYMENT.md for all mobile options');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run setup if called directly
if (require.main === module) {
    runSetup();
}

module.exports = { runSetup };
`;

// Run the setup
if (typeof window === 'undefined') {
    // Node.js environment
    console.log('Node.js setup script ready!');
} else {
    // Browser environment
    console.log('Browser-based setup not supported. Use Node.js version.');
}