import { DiagramService } from '../../src/services/diagramService';
import { UserService } from '../../src/services/userService';
import { connectDatabase, disconnectDatabase } from '../../src/config/database';
import { User } from '../../src/models/User';
import { Diagram } from '../../src/models/Diagram';

describe('DiagramService', () => {
  let userId: string;

  beforeAll(async () => {
    await connectDatabase();
    const user = await UserService.createUser({
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id.toString();
  });

  afterAll(async () => {
    await Diagram.deleteMany({});
    await User.deleteMany({});
    await disconnectDatabase();
  });

  afterEach(async () => {
    await Diagram.deleteMany({});
  });

  it('should create a diagram', async () => {
    const diagramData = {
      title: 'Test Diagram',
      content: 'Test content',
      owner: userId
    };

    const diagram = await DiagramService.createDiagram(diagramData);
    expect(diagram.title).toBe(diagramData.title);
    expect(diagram.content).toBe(diagramData.content);
    expect(diagram.owner.toString()).toBe(userId);
  });

  it('should find diagrams by owner', async () => {
    const diagramData = {
      title: 'Test Diagram',
      content: 'Test content',
      owner: userId
    };

    await DiagramService.createDiagram(diagramData);
    const diagrams = await DiagramService.findDiagramsByOwner(userId);
    
    expect(diagrams).toHaveLength(1);
    expect(diagrams[0].title).toBe(diagramData.title);
  });

  it('should reject invalid owner ID', async () => {
    const diagramData = {
      title: 'Test Diagram',
      content: 'Test content',
      owner: 'invalid-id'
    };

    await expect(DiagramService.createDiagram(diagramData)).rejects.toThrow('Invalid owner ID');
  });

  it('should update diagram', async () => {
    const diagramData = {
      title: 'Test Diagram',
      content: 'Test content',
      owner: userId
    };

    const diagram = await DiagramService.createDiagram(diagramData);
    const updated = await DiagramService.updateDiagram(diagram._id.toString(), {
      title: 'Updated Title'
    });

    expect(updated?.title).toBe('Updated Title');
    expect(updated?.content).toBe(diagramData.content);
  });
});