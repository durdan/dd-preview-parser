import { DebounceTimer } from '../debounce-timer.js';

describe('DebounceTimer', () => {
  let callback;
  let timer;

  beforeEach(() => {
    callback = jest.fn();
    timer = new DebounceTimer(100, callback);
  });

  afterEach(() => {
    timer.cancel();
  });

  test('should execute callback after delay', async () => {
    timer.trigger();
    expect(callback).not.toHaveBeenCalled();
    
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should debounce multiple triggers', async () => {
    timer.trigger();
    timer.trigger();
    timer.trigger();
    
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should cancel pending execution', async () => {
    timer.trigger();
    timer.cancel();
    
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(callback).not.toHaveBeenCalled();
  });

  test('should report pending status correctly', () => {
    expect(timer.isPending()).toBe(false);
    
    timer.trigger();
    expect(timer.isPending()).toBe(true);
    
    timer.cancel();
    expect(timer.isPending()).toBe(false);
  });
});