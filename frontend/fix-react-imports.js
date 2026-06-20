import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addReactImport(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            addReactImport(fullPath);
        } else if (file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Check if React is already imported
            if (!content.match(/import\s+React[\s,]/) && !content.match(/import\s+\{\s*.*React.*\s*\}\s+from\s+['"]react['"]/)) {
                // Prepend import React from 'react';
                content = `import React from 'react';\n` + content;
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Added React import to: ${fullPath}`);
            }
        }
    }
}

addReactImport(path.join(__dirname, 'src'));
console.log('Finished checking all files!');
