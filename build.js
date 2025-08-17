const fs = require('fs').promises;
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const pagesDir = path.join(srcDir, 'pages');

async function build() {
    console.log('Starting build...');

    await fs.rm(distDir, { recursive: true, force: true });
    await fs.mkdir(distDir, { recursive: true });

    const header = await fs.readFile(path.join(srcDir, 'templates', 'header.html'), 'utf-8');
    const footer = await fs.readFile(path.join(srcDir, 'templates', 'footer.html'), 'utf-8');

    const findHtmlFiles = async (dir) => {
        let results = [];
        const list = await fs.readdir(dir);
        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(await findHtmlFiles(filePath));
            } else if (path.extname(filePath) === '.html') {
                results.push(filePath);
            }
        }
        return results;
    };

    const htmlFiles = await findHtmlFiles(pagesDir);

    for (const file of htmlFiles) {
        let content = await fs.readFile(file, 'utf-8');
        
        // --- FRONTMATTER LOGIC (remains the same) ---
        const meta = { title: 'NumberVerse', description: 'The Ultimate Number Playground & Quiz Hub' };
        const metaRegex = /<!-- meta:(.+) = (.+) -->/g;
        let match;
        while ((match = metaRegex.exec(content)) !== null) {
            meta[match[1].trim()] = match[2].trim();
        }
        content = content.replace(metaRegex, '');

        let finalHeader = header
            .replace(/<title>.*<\/title>/, `<title>${meta.title}</title>`)
            .replace('</head>', `<meta name="description" content="${meta.description}"></head>`);

        const finalHtml = finalHeader + content.replace('<!-- HEADER -->', '').replace('<!-- FOOTER -->', '') + footer;

        // --- NEW BUILD LOGIC FOR CORRECT SRC STRUCTURE ---
        const relativePath = path.relative(pagesDir, file);
        const parsedPath = path.parse(relativePath);
        
        // Example: relativePath = 'practice/number-system-bridge.html'
        // parsedPath.dir = 'practice'
        // parsedPath.name = 'number-system-bridge'

        let destDir;
        if (parsedPath.name === 'index') {
            // For files like scoreboard/index.html, the destDir is dist/scoreboard/
            destDir = path.join(distDir, parsedPath.dir);
        } else {
            // For files like practice/number-system-bridge.html, the destDir is dist/practice/number-system-bridge/
            destDir = path.join(distDir, parsedPath.dir, parsedPath.name);
        }

        await fs.mkdir(destDir, { recursive: true });
        const destPath = path.join(destDir, 'index.html');
        await fs.writeFile(destPath, finalHtml);
        console.log(`- Built ${path.relative(distDir, destPath)}`);
    }
    
    await fs.cp(path.join(srcDir, 'css'), path.join(distDir, 'css'), { recursive: true });
    await fs.cp(path.join(srcDir, 'js'), path.join(distDir, 'js'), { recursive: true });
    console.log('- Copied CSS and JS assets.');

    console.log('Build complete! Your site is ready in the /dist folder.');
}

build();