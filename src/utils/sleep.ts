function msleep(n: number) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
  }
  function sleep(n: number) {
    msleep(n*1000);
  }
  
export { sleep }