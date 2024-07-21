import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directories containing your JSX and CSS files
const jsxDir = path.join(__dirname, 'src'); // Assuming JSX files are in src folder
const cssDir = path.join(__dirname, 'src'); // Assuming CSS files are in src folder

// Function to recursively read all files from a directory and its subdirectories
const readAllFilesFromDir = async (dir, fileType) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(entry => {
        const res = path.resolve(dir, entry.name);
        return entry.isDirectory() ? readAllFilesFromDir(res, fileType) : res.endsWith(fileType) ? [res] : [];
    }));
    return Array.prototype.concat(...files);
};

// Function to combine the contents and write to a Markdown file
const combineFilesToMarkdown = async () => {
    try {
        const jsxFiles = await readAllFilesFromDir(jsxDir, '.jsx');
        const cssFiles = await readAllFilesFromDir(cssDir, '.css');

        const jsxContents = jsxFiles.map(file => {
            const content = fs.readFileSync(file, 'utf8');
            return `### ${path.relative(__dirname, file)}\n\`\`\`jsx\n${content}\n\`\`\`\n`;
        });

        const cssContents = cssFiles.map(file => {
            const content = fs.readFileSync(file, 'utf8');
            return `### ${path.relative(__dirname, file)}\n\`\`\`css\n${content}\n\`\`\`\n`;
        });

        const combinedContents = [
            '# Combined JSX and CSS Files\n',
            '## JSX Files\n',
            ...jsxContents,
            '## CSS Files\n',
            ...cssContents
        ].join('\n');

        fs.writeFileSync(path.join(__dirname, 'combined_files.md'), combinedContents, 'utf8');
        console.log('Files combined successfully into combined_files.md');
    } catch (error) {
        console.error('Error combining files:', error);
    }
};

combineFilesToMarkdown();