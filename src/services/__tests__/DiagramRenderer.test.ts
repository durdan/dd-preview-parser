import { DiagramRenderer } from '../DiagramRenderer';

// Mock mermaid
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn()
}));

import mermaid from 'mermaid';

describe('DiagramRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should initialize mermaid once', async () => {
    await DiagramRenderer.initialize();
    await DiagramRenderer.initialize(); // Second call

    expect(mermaid.initialize).toHaveBeenCalledTimes(1);
  });

  it('should render empty state for empty content', async () => {
    document.body.innerHTML = '<div id="test-container"></div>';
    
    await DiagramRenderer.render('', 'test-container');
    
    const element = document.getElementById('test-container');
    expect(element?.innerHTML).toContain('Enter diagram content');
  });

  it('should render diagram content', async () => {
    const mockSvg = '<svg>test diagram</svg>';
    (mermaid.render as jest.Mock).mockResolvedValue({ svg: mockSvg });
    
    document.body.innerHTML = '<div id="test-container"></div>';
    
    await DiagramRenderer.render('flowchart TD\n A --> B', 'test-container');
    
    const element = document.getElementById('test-container');
    expect(element?.innerHTML).toBe(mockSvg);
    expect(mermaid.render).toHaveBeenCalledWith(
      expect.stringMatching(/diagram-\d+/),
      'flowchart TD\n A --> B'
    );
  });

  it('should handle rendering errors', async () => {
    (mermaid.render as jest.Mock).mockRejectedValue(new Error('Syntax error'));
    
    document.body.innerHTML = '<div id="test-container"></div>';
    
    await expect(
      DiagramRenderer.render('invalid content', 'test-container')
    ).rejects.toThrow('Rendering failed: Syntax error');
  });
});