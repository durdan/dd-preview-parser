export class DebounceTimer {
  constructor(delay, callback) {
    this.delay = delay;
    this.callback = callback;
    this.timeoutId = null;
  }

  trigger() {
    this.cancel();
    this.timeoutId = setTimeout(() => {
      this.callback();
      this.timeoutId = null;
    }, this.delay);
  }

  cancel() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  isPending() {
    return this.timeoutId !== null;
  }
}