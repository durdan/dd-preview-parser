import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';

jest.useFakeTimers();

describe('useDebouncedValue', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial'); // Still old value

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated'); // Now updated
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'change1' });
    act(() => {
      jest.advanceTimersByTime(150);
    });

    rerender({ value: 'change2' });
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current).toBe('initial'); // Still initial

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current).toBe('change2'); // Final value
  });
});