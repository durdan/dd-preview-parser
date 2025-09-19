import * as monaco from 'monaco-editor';

export const DIAGRAM_LANGUAGE = 'diagram';

export function registerDiagramLanguage() {
  // Register the language
  monaco.languages.register({ id: DIAGRAM_LANGUAGE });

  // Define syntax highlighting
  monaco.languages.setMonarchTokensProvider(DIAGRAM_LANGUAGE, {
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/\w+:/, 'keyword'],
        [/->/, 'operator'],
        [/\(start\)|\(end\)/, 'type.start-end'],
        [/\(process\)|\(decision\)/, 'type.process'],
        [/\[.*?\]/, 'string'],
        [/\w+/, 'identifier'],
      ]
    }
  });

  // Define theme
  monaco.editor.defineTheme('diagram-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'operator', foreground: 'D4D4D4', fontStyle: 'bold' },
      { token: 'type.start-end', foreground: '4EC9B0' },
      { token: 'type.process', foreground: 'DCDCAA' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'identifier', foreground: '9CDCFE' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
    }
  });
}

export const MONACO_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  theme: 'diagram-theme',
  fontSize: 14,
  lineNumbers: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on',
  tabSize: 2,
};