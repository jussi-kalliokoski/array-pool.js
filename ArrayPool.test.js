"use strict";

const ArrayPool = require("./ArrayPool.js");

describe("ArrayPool", () => {
  it("should reset the arrays upon release", () => {
    const pool = new ArrayPool();
    expect(pool.size()).toBe(0);
    const array = pool.get();
    expect(pool.size()).toBe(1);
    array.push(123);
    expect(array.length).toBe(1);
    pool.release(array);
    expect(array.length).toBe(0);
  });

  it("should do an initial allocation of `poolSize` arrays", () => {
    const pool = new ArrayPool(5, 6);
    expect(pool.size()).toBe(5);
    const array = pool.get();
    expect(pool.size()).toBe(5);
    pool.release(array);
  });
});
