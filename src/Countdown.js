export default class Countdown {
  constructor(duration) {
    this.originalDuration = duration; // 原始时长(毫秒)
    this.remainingTime = duration;    // 剩余时间(毫秒)
    this.animationFrameId  = null;   // requestAnimationFrame ID
    this.isPaused = true;            // 初始状态为暂停
    this.startTime = null;           // 开始时间
    this.pauseTime = null;           // 暂停时间
    this.elapsedBeforePause = 0;     // 暂停前已过去的时间
    this.onUpdateCallbacks = [];     // 更新回调函数数组
    this.resolvePromise = null;      // Promise resolve函数
    this.rejectPromise = null;       // Promise reject函数
  }

  // 开始倒计时
  start() {
    if (this.animationFrameId  || this.remainingTime <= 0) {
      return Promise.reject(new Error('Countdown already started or finished'));
    }

    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;

      this.startTime = performance.now();
      this.isPaused = false;
      this.elapsedBeforePause = 0;

      this.update();
    });
  }

  // 创建定时器
  update() {
    if (this.isPaused) return;

    const now = performance.now();
    const elapsed = this.elapsedBeforePause + (now - this.startTime);
    this.remainingTime = Math.max(0, this.originalDuration - elapsed);

    // 触发更新回调
    this.onUpdateCallbacks.forEach(cb => cb(this.remainingTime));

    if (this.remainingTime <= 0) {
      this.stop();
      this.resolvePromise();
    } else {
      this.animationFrameId = requestAnimationFrame(() => this.update());
    }
  }

  // 暂停倒计时
  pause() {
    if (!this.isPaused && this.animationFrameId) {
      this.isPaused = true;
      this.pauseTime = performance.now();
      this.elapsedBeforePause += this.pauseTime - this.startTime;
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId  = null;
    }
  }

  // 继续倒计时
  resume() {
    if (this.isPaused && this.remainingTime > 0) {
      this.isPaused = false;
      this.startTime = performance.now();
      this.update();
    }
  }

  // 重置倒计时
  reset(duration = this.originalDuration) {
    this.stop();
    this.originalDuration = duration;
    this.remainingTime = this.originalDuration;
    this.isPaused = true;
    this.startTime = null;
    this.pauseTime = null;
    this.elapsedBeforePause = 0;
    // 触发更新回调
    this.onUpdateCallbacks.forEach(cb => cb(this.remainingTime));
  }

  // 停止倒计时
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId  = null;
    }
    this.isPaused = true;
  }

  // 添加更新回调
  onUpdate(callback) {
    if (typeof callback === 'function') {
      this.onUpdateCallbacks.push(callback);
    }
    return this; // 支持链式调用
  }

  // 获取剩余时间
  getRemainingTime() {
    return this.remainingTime;
  }
}
