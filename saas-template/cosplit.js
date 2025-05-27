#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import readline from 'readline';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);

class CodeSplitter {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.overwrite = options.overwrite || false;
    this.interactive = options.interactive || false;
    this.rl = null;
    this.createdFiles = [];
    this.skippedFiles = [];
  }

  /**
   * Initialize readline interface for interactive mode
   */
  initInteractive() {
    if (!this.interactive) return;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Close readline interface
   */
  closeInteractive() {
    if (this.rl) {
      this.rl.close();
    }
  }

  /**
   * Ask user a question and return the answer
   */
  async ask(question, defaultValue = '') {
    if (!this.interactive || !this.rl) {
      return defaultValue;
    }

    return new Promise((resolve) => {
      const prompt = defaultValue 
        ? `${question} (${defaultValue}): `
        : `${question}: `;
        
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  /**
   * Ask user for confirmation
   */
  async confirm(question, defaultValue = true) {
    if (!this.interactive) return defaultValue;
    
    const defaultText = defaultValue ? 'Y/n' : 'y/N';
    const answer = await this.ask(`${question} (${defaultText})`);
    
    if (!answer) return defaultValue;
    return answer.toLowerCase().startsWith('y');
  }

  /**
   * Show interactive menu and get user choice
   */
  async showMenu(title, options, allowMultiple = false) {
    if (!this.interactive) return allowMultiple ? options : options[0];

    console.log(`\n📋 ${title}`);
    options.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option}`);
    });

    if (allowMultiple) {
      console.log(`  0. Select all`);
      console.log(`  q. Skip all`);
    }

    const answer = await this.ask(
      allowMultiple 
        ? 'Choose options (comma separated, e.g. 1,3,5)' 
        : 'Choose an option'
    );

    if (allowMultiple) {
      if (answer === 'q') return [];
      if (answer === '0') return options;
      
      const indices = answer.split(',')
        .map(s => parseInt(s.trim()) - 1)
        .filter(i => i >= 0 && i < options.length);
      
      return indices.map(i => options[i]);
    } else {
      const index = parseInt(answer) - 1;
      return index >= 0 && index < options.length ? options[index] : options[0];
    }
  }

  /**
   * Interactive file customization
   */
  async customizeFile(file) {
    if (!this.interactive) return file;

    console.log(`\n📄 Customizing: ${file.path}`);
    console.log(`Content preview (${file.content.length} chars):`);
    console.log('─'.repeat(50));
    console.log(file.content.substring(0, 300) + (file.content.length > 300 ? '\n...' : ''));
    console.log('─'.repeat(50));

    // Ask if user wants to customize this file
    const shouldCustomize = await this.confirm('Customize this file?', false);
    if (!shouldCustomize) return file;

    // Customize path
    const newPath = await this.ask('File path', file.path);
    
    // Show content options
    const contentActions = [
      'Keep original content',
      'Edit content interactively',
      'Add template/boilerplate',
      'Skip this file'
    ];

    const action = await this.showMenu('What do you want to do with the content?', contentActions);
    
    switch (action) {
      case 'Edit content interactively':
        console.log('\n✏️  Enter new content (type "EOF" on a new line to finish):');
        const newContent = await this.readMultilineInput();
        return { ...file, path: newPath, content: newContent };
        
      case 'Add template/boilerplate':
        const template = await this.selectTemplate(file.path);
        const combinedContent = template + '\n\n' + file.content;
        return { ...file, path: newPath, content: combinedContent };
        
      case 'Skip this file':
        return null;
        
      default:
        return { ...file, path: newPath };
    }
  }

  /**
   * Read multiline input until EOF
   */
  async readMultilineInput() {
    if (!this.interactive) return '';

    return new Promise((resolve) => {
      const lines = [];
      
      const readLine = () => {
        this.rl.question('', (line) => {
          if (line.trim() === 'EOF') {
            resolve(lines.join('\n'));
          } else {
            lines.push(line);
            readLine();
          }
        });
      };
      
      readLine();
    });
  }

  /**
   * Select template based on file extension
   */
  async selectTemplate(filePath) {
    const ext = path.extname(filePath);
    const templates = this.getTemplatesForExtension(ext);
    
    if (templates.length === 0) return '';
    
    const selectedTemplate = await this.showMenu('Choose template:', Object.keys(templates));
    return templates[selectedTemplate] || '';
  }

  /**
   * Get available templates for file extension
   */
  getTemplatesForExtension(ext) {
    const templates = {
      '.ts': {
        'Basic TypeScript': '// TypeScript file\nexport {};',
        'Interface': 'export interface MyInterface {\n  // Add properties here\n}',
        'Class': 'export class MyClass {\n  constructor() {\n    // Add constructor logic\n  }\n}',
        'Utility Functions': '// Utility functions\n\nexport function myFunction(): void {\n  // Add implementation\n}'
      },
      '.tsx': {
        'React Component': 'import React from \'react\';\n\ninterface Props {\n  // Add props here\n}\n\nexport const MyComponent: React.FC<Props> = () => {\n  return (\n    <div>\n      {/* Component content */}\n    </div>\n  );\n};',
        'React Hook': 'import { useState, useEffect } from \'react\';\n\nexport function useMyHook() {\n  // Add hook logic\n  return {};\n}'
      },
      '.js': {
        'Basic JavaScript': '// JavaScript file',
        'Module Exports': 'module.exports = {\n  // Add exports here\n};',
        'ES6 Module': 'export default {\n  // Add exports here\n};'
      }
    };

    return templates[ext] || {};
  }

  /**
   * Interactive summary and confirmation
   */
  async showSummary(files) {
    if (!this.interactive) return true;

    console.log('\n📊 Summary:');
    console.log(`   Root directory: ${this.rootPath}`);
    console.log(`   Files to create: ${files.length}`);
    
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.path} (${file.content.length} chars)`);
    });

    return await this.confirm('\nProceed with file creation?', true);
  }

  /**
   * Show final results
   */
  showResults() {
    console.log('\n🎉 Operation completed!');
    
    if (this.createdFiles.length > 0) {
      console.log(`\n✅ Created files (${this.createdFiles.length}):`);
      this.createdFiles.forEach(file => console.log(`   • ${file}`));
    }
    
    if (this.skippedFiles.length > 0) {
      console.log(`\n⏭️  Skipped files (${this.skippedFiles.length}):`);
      this.skippedFiles.forEach(file => console.log(`   • ${file}`));
    }

    if (this.interactive) {
      console.log('\n💡 Tips:');
      console.log('   • Use --verbose for more details');
      console.log('   • Use --dry-run to preview without creating files');
      console.log('   • Use --overwrite to replace existing files');
    }
  }

  /**
   * Parse input content and extract file sections
   * @param {string} content - Input content with file comments
   * @returns {Array} Array of file objects {path, content}
   */
  parseContent(content) {
    const files = [];
    const lines = content.split('\n');
    let currentFile = null;
    let currentContent = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Detect file path comments
      const filePathMatch = this.extractFilePath(trimmedLine);
      
      if (filePathMatch) {
        // Save previous file if exists
        if (currentFile) {
          files.push({
            ...currentFile,
            content: this.cleanContent(currentContent.join('\n'))
          });
        }

        // Start new file
        currentFile = {
          originalPath: filePathMatch,
          path: this.normalizePath(filePathMatch),
          line: i + 1
        };
        currentContent = [];
        inCodeBlock = false;
        continue;
      }

      // Only collect content if we're in a file section
      if (currentFile) {
        // Skip empty lines at the beginning
        if (currentContent.length === 0 && trimmedLine === '') {
          continue;
        }
        currentContent.push(line);
      }
    }

    // Save last file
    if (currentFile && currentContent.length > 0) {
      files.push({
        ...currentFile,
        content: this.cleanContent(currentContent.join('\n'))
      });
    }

    return files;
  }

  /**
   * Extract file path from comment line
   * @param {string} line - Line to check
   * @returns {string|null} File path or null
   */
  extractFilePath(line) {
    // Common patterns for file path comments
    const patterns = [
      /^\/\/\s*(.+\.(?:ts|js|tsx|jsx|vue|py|java|cpp|c|h|cs|php|rb|go|rs|swift|kt|scala))\s*$/i,
      /^#\s*(.+\.(?:ts|js|tsx|jsx|vue|py|java|cpp|c|h|cs|php|rb|go|rs|swift|kt|scala))\s*$/i,
      /^\/\*\s*(.+\.(?:ts|js|tsx|jsx|vue|py|java|cpp|c|h|cs|php|rb|go|rs|swift|kt|scala))\s*\*\/$/i,
      /^<!--\s*(.+\.(?:ts|js|tsx|jsx|vue|py|java|cpp|c|h|cs|php|rb|go|rs|swift|kt|scala))\s*-->$/i,
      // More flexible pattern for any extension
      /^(?:\/\/|#|\/\*|\<!--)\s*([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+)(?:\s*\*\/|\s*-->)?\s*$/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Normalize and validate file path
   * @param {string} filePath - Original file path
   * @returns {string} Normalized path
   */
  normalizePath(filePath) {
    // Remove leading slash if present
    let normalized = filePath.replace(/^\/+/, '');
    
    // Normalize path separators
    normalized = normalized.replace(/\\/g, '/');
    
    // Validate file name
    const fileName = path.basename(normalized);
    if (!this.isValidFileName(fileName)) {
      throw new Error(`Invalid file name: ${fileName}`);
    }

    // Validate directory path
    const dirPath = path.dirname(normalized);
    if (dirPath !== '.' && !this.isValidDirectoryPath(dirPath)) {
      throw new Error(`Invalid directory path: ${dirPath}`);
    }

    return normalized;
  }

  /**
   * Check if file name is valid
   * @param {string} fileName - File name to check
   * @returns {boolean} True if valid
   */
  isValidFileName(fileName) {
    // Check for invalid characters
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(fileName)) return false;

    // Check for reserved names (Windows)
    const reservedNames = /^(?:CON|PRN|AUX|NUL|COM\d|LPT\d)(?:\..+)?$/i;
    if (reservedNames.test(fileName)) return false;

    // Check length
    if (fileName.length > 255) return false;

    // Must have extension
    if (!fileName.includes('.')) return false;

    return true;
  }

  /**
   * Check if directory path is valid
   * @param {string} dirPath - Directory path to check
   * @returns {boolean} True if valid
   */
  isValidDirectoryPath(dirPath) {
    const parts = dirPath.split('/');
    return parts.every(part => {
      if (part === '' || part === '.' || part === '..') return false;
      const invalidChars = /[<>:"|?*\x00-\x1f]/;
      return !invalidChars.test(part) && part.length <= 255;
    });
  }

  /**
   * Clean content by removing excessive whitespace
   * @param {string} content - Content to clean
   * @returns {string} Cleaned content
   */
  cleanContent(content) {
    // Remove leading and trailing whitespace
    content = content.trim();
    
    // Remove excessive blank lines (more than 2 consecutive)
    content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    return content;
  }

  /**
   * Create file with content
   * @param {Object} file - File object {path, content}
   */
  async createFile(file) {
    const fullPath = path.join(this.rootPath, file.path);
    const dirPath = path.dirname(fullPath);

    if (this.verbose) {
      console.log(`📁 Creating: ${file.path}`);
    }

    if (this.dryRun) {
      console.log(`[DRY RUN] Would create: ${fullPath}`);
      console.log(`Content (${file.content.length} chars):`);
      console.log('─'.repeat(50));
      console.log(file.content.substring(0, 200) + (file.content.length > 200 ? '...' : ''));
      console.log('─'.repeat(50));
      return;
    }

    // Check if file exists
    if (fs.existsSync(fullPath) && !this.overwrite) {
      if (this.interactive) {
        const shouldOverwrite = await this.confirm(`File exists: ${file.path}. Overwrite?`, false);
        if (!shouldOverwrite) {
          console.log(`⏭️  Skipped: ${file.path}`);
          this.skippedFiles.push(file.path);
          return;
        }
      } else {
        console.warn(`⚠️  File exists, skipping: ${file.path} (use --overwrite to replace)`);
        this.skippedFiles.push(file.path);
        return;
      }
    }

    try {
      // Create directory if not exists
      await mkdir(dirPath, { recursive: true });
      
      // Write file
      await writeFile(fullPath, file.content, 'utf8');
      
      console.log(`✅ Created: ${file.path}`);
      this.createdFiles.push(file.path);
    } catch (error) {
      console.error(`❌ Error creating ${file.path}:`, error.message);
    }
  }

  /**
   * Process input file or content
   * @param {string} input - File path or content string
   */
  async process(input) {
    let content;

    // Initialize interactive mode
    this.initInteractive();

    try {
      // Try to read as file first
      if (fs.existsSync(input)) {
        content = await readFile(input, 'utf8');
        if (this.verbose) {
          console.log(`📖 Reading from file: ${input}`);
        }
      } else {
        // Treat as content string
        content = input;
        if (this.verbose) {
          console.log(`📝 Processing content string (${content.length} chars)`);
        }
      }
    } catch (error) {
      console.error('❌ Error reading input:', error.message);
      this.closeInteractive();
      return;
    }

    try {
      let files = this.parseContent(content);
      
      if (files.length === 0) {
        console.log('ℹ️  No files found to create');
        this.closeInteractive();
        return;
      }

      console.log(`🔍 Found ${files.length} files to create:`);
      files.forEach(file => {
        console.log(`   • ${file.path} (${file.content.length} chars)`);
      });

      // Interactive customization
      if (this.interactive) {
        console.log('\n🎛️  Interactive Mode - Customize each file:');
        
        const customizedFiles = [];
        for (const file of files) {
          const customized = await this.customizeFile(file);
          if (customized) {
            customizedFiles.push(customized);
          }
        }
        files = customizedFiles;

        if (files.length === 0) {
          console.log('ℹ️  No files selected for creation');
          this.closeInteractive();
          return;
        }

        // Show summary and confirm
        const shouldProceed = await this.showSummary(files);
        if (!shouldProceed) {
          console.log('🚫 Operation cancelled');
          this.closeInteractive();
          return;
        }
      }

      if (this.dryRun) {
        console.log('\n🧪 DRY RUN MODE - No files will be created\n');
      } else {
        console.log(`\n📂 Target directory: ${this.rootPath}\n`);
      }

      // Create files
      for (const file of files) {
        await this.createFile(file);
      }

      // Show results
      this.showResults();

    } catch (error) {
      console.error('❌ Error processing content:', error.message);
    } finally {
      this.closeInteractive();
    }
  }
}

// CLI interface
function showHelp() {
  console.log(`
Code Splitter Tool - Automatically create files from commented code

Usage:
  node code-splitter.js [options] <input>

Options:
  --root <path>     Set root directory (default: current directory)
  --dry-run         Preview mode, don't create files
  --verbose         Show detailed output
  --overwrite       Overwrite existing files
  --interactive     Interactive mode with customization options
  --help            Show this help

Examples:
  # Basic usage
  node code-splitter.js code.txt
  
  # Interactive mode (recommended)
  node code-splitter.js --interactive --root ./src code.txt
  
  # Set custom root directory
  node code-splitter.js --root ./src code.txt
  
  # Dry run to preview
  node code-splitter.js --dry-run code.txt
  
  # Process from stdin
  cat code.txt | node code-splitter.js --interactive
  
  # Direct content
  node code-splitter.js --interactive "// types/state.ts
  export interface State { ... }"

Interactive Mode Features:
  • 🎛️  Customize each file before creation
  • 📝 Edit content inline or add templates
  • 🔄 Skip unwanted files
  • 📊 Preview and confirm before creating
  • 🎯 Smart templates for TypeScript/React/etc

Supported file path formats:
  // path/to/file.ts
  # path/to/file.py
  /* path/to/file.js */
  <!-- path/to/file.html -->
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const options = {
    rootPath: process.cwd(),
    dryRun: false,
    verbose: false,
    overwrite: false,
    interactive: false
  };

  let input = '';
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--root':
        options.rootPath = path.resolve(args[++i]);
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--overwrite':
        options.overwrite = true;
        break;
      case '--interactive':
      case '-i':
        options.interactive = true;
        break;
      default:
        if (!arg.startsWith('--')) {
          input = arg;
        }
        break;
    }
  }

  // Check if reading from stdin
  if (!input && !process.stdin.isTTY) {
    const chunks = [];
    process.stdin.on('data', chunk => chunks.push(chunk));
    process.stdin.on('end', async () => {
      input = Buffer.concat(chunks).toString();
      const splitter = new CodeSplitter(options);
      await splitter.process(input);
    });
    return;
  }

  if (!input) {
    console.error('❌ No input provided. Use --help for usage information.');
    process.exit(1);
  }

  const splitter = new CodeSplitter(options);
  await splitter.process(input);
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default CodeSplitter;