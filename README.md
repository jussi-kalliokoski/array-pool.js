# array-pool

A simple and fast array pool implementation for avoiding allocations and garbage collection overhead.

[![Build Status](https://travis-ci.org/jussi-kalliokoski/array-pool.js.svg?branch=master)](https://travis-ci.org/jussi-kalliokoski/array-pool.js)
[![Coverage Status](https://img.shields.io/coveralls/jussi-kalliokoski/array-pool.js.svg)](https://coveralls.io/r/jussi-kalliokoski/array-pool.js)

## Installation

```
npm i --save array-pool
```

## Usage

```javascript
const ArrayPool = require('array-pool');

const arraysToAllocateInitially = 10;
const initialArrayCapacity = 50;
const pool = new ArrayPool(arraysToAllocateInitially, initialArrayCapacity);

// get an array from the pool
const array = pool.get();

// do something with the array
for (let i = 0; i < 100; i++) { array.push(i); }

// release the array back to the pool. IMPORTANT: THE ARRAY CAN NO LONGER BE SAFELY USED AFTER THIS POINT
pool.release(array);

// get the number of arrays the pool has allocated in total (including the ones in use)
console.log(pool.size());
```

## Safety

The library has been designed to be as safe as possible to reduce the likelihood of bugs caused by using it, i.e. with most mistakes you just end up using more memory than you need to. For example, never releasing an array back to the pool is not an issue because the pool only retains a reference to the currently available arrays and thus the forgotten array would just be garbage collected normally.

However, like with any pooling implementation, use-after-free bugs are easy to introduce if you're not very careful:

```
// A WARNING EXAMPLE: DO NOT DO THIS
function printEverySecond(v) {
    console.log(v);
    setTimeout(() => printEverySecond(v));
}
const array = pool.get();
array.push(1, 2, 3);
printEverySecond(array);
// array will be emptied when released to the pool and will eventually be overwritten by some other piece of code
pool.release(array);
```

As a general rule of thumb, you should try to make sure the arrays from the pool never escape the scope of the function where they were fetched from the pool. If you pass the arrays to functions, you should make sure that the functions are either pure (BUT NEVER MEMOIZED) or at the very least stateless (i.e. perform mutation, but only to provided as arguments).

## Performance considerations / tips

### Just don't do it

Generally you'll want to avoid using this library (or pooling in general) as much as possible. If it's possible to solve the problem without pooling, it's probably best to do so.

### Measure

You'll always want to measure before and after implementing pooling. Pooling is not a nitrous you can just add to get more performance; inappropriate use will be detrimental to the performance of your application and will quite possibly sky rocket your memory usage.

### Avoid polymorphism

You should avoid using the same pool for different types of data. This will most likely cause the JIT to just abandon all hope of ever optimizing the usage of the arrays in the pool.

### Avoid sharing pools for different purposes

You should try to keep the pools as specific to a certain task as possible. Different tasks often deal with different sizes of arrays and as the pool tracks the sizes of the arrays and adjusts automatically, you will end up with excess capacity for the tasks that don't require as much, needlessly increasing your memory usage. Sharing pools also easily leads to unintended polymorphism as a refactoring hazard.

### Estimate your usage patterns

By default, the pool is completely dynamic and adjusts its allocation patterns based on usage. However, if you can correctly estimate the number of arrays needed in the pool and the maximum capacity needed for those arrays and pass them to the constructor, the pool will never have to allocate on the fly and you'll end up with more predictable performance characteristics.

## Benchmarks

The repo includes an unfair (in favor of native, because the pool is not preallocated and is with varying types of data) micro-benchmark.

You can run the benchmarks yourself with `./scripts/benchmark`. Here are the results on my computer (MacBook Pro (Retina, 13-inch, Early 2015), 3,1 GHz Intel Core i7, 16 GB 1867 MHz DDR3, `node -v` 9.5.0):

```
filterPooled median: 20.51587200164795ms average: 25.32200444266796ms min: 17.5102379322052ms max: 275.7377769947052ms
filterNative median: 24.807639002799988ms average: 28.991705557644366ms min: 22.115664958953857ms max: 170.6902370452881ms
arrayFromPooled median: 20.304154992103577ms average: 20.144703529405593ms min: 11.689600110054016ms max: 146.0108119249344ms
arrayFromNative median: 65.12847995758057ms average: 65.4233433881402ms min: 52.43484807014465ms max: 497.36474001407623ms
```

Lower is better.

## License

ISC License. See the LICENSE file for more details.
