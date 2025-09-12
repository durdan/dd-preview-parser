const fs = require('fs');
const path = require('path');

describe('README.md Validation', () => {
  let readmeContent;

  beforeAll(() => {
    const readmePath = path.join(__dirname, '..', 'README.md');
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  });

  test('should contain all required sections', () => {
    const requiredSections = [
      '# Next.js Application',
      '## 🏗️ Architecture Overview',
      '## 🚀 Tech Stack',
      '## 🛠️ Local Development Setup',
      '## 📚 API Documentation',
      '## 🚀 Deployment',
      '## 📝 Migration Notes',
      '## 🧪 Testing'
    ];

    requiredSections.forEach(section => {
      expect(readmeContent).toContain(section);
    });
  });

  test('should contain mermaid diagrams', () => {
    const mermaidBlocks = readmeContent.match(/