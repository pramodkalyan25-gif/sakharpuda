const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'screenshots', '.gemini', 'scratch'];

function generateTree(dir, prefix = '') {
    let output = '';
    const files = fs.readdirSync(dir);
    const filteredFiles = files.filter(file => !IGNORE_DIRS.includes(file));
    
    filteredFiles.forEach((file, index) => {
        const isLast = index === filteredFiles.length - 1;
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        const marker = isLast ? '└── ' : '├── ';
        output += `${prefix}${marker}${file}\n`;
        
        if (stats.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            output += generateTree(filePath, newPrefix);
        }
    });
    
    return output;
}

const rootDir = 'c:\\Users\\User\\.gemini\\antigravity\\scratch\\matrimony-app';
const tree = 'matrimony-app\n' + generateTree(rootDir);

const artifactContent = `
# Project Structure

Here is the file structure of your project (excluding \`node_modules\`, \`.git\`, and \`dist\`). You can keep this artifact open on the side for reference, just like a VS Code sidebar!

\`\`\`
${tree}
\`\`\`
`;

fs.writeFileSync(path.join(rootDir, 'scratch', 'tree_output.txt'), artifactContent);
console.log('Tree generated in scratch/tree_output.txt');
