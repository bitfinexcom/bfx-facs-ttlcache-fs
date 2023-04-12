# TTL Cache with file system storage

A time-based cache with support for storing large objects in a file system instead of memory.

## Quick start

```js
this.setInitFacs([
  ['fac', 'bfx-facs-ttlcache-fs', '0', '0', {
    max: 300, // max 300 objects
    ttl: 3600 * 1000 // 1h
  }],
])

const largeBlockObject = {
  txs: [...]
}

this.ttlcacheFs_0.set('block-123', largeBlockObject)
const block = this.ttlcacheFs_0.get('block-123')

// block has the same value as the largeBlockObject variable set previously
```

## How it works?

The facility uses TTL Cache to expire keys and automatically remove cached files from the file system
once the key expires.
The stored value is stringified with JSON and saved to disk.
The value returned from the cache is parsed and returned as provided to the cache.

## Configuration

During initialization, the following options, with their defaults, are supported:
```js
{
  directory: "./cache/data",    // Directory where to store cached files
  deleteCacheDirOnStart: true,  // True to delete cache on startup
  cache: {                      // Options object passed to TTLCache on startup. See https://github.com/isaacs/ttlcache for more details
    max: 1000,                  // Maximum number of objects in cache
    ttl: 3600 * 1000,           // TTL for objects
  },
}
```
