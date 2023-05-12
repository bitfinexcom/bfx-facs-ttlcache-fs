const Base = require('bfx-facs-base')
const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')
const TTLCache = require('@isaacs/ttlcache')

class TTLCacheFs extends Base {
  constructor (caller, opts = {}, ctx) {
    super(caller, opts, ctx)

    this.name = 'ttlcache_fs'
    this._hasConf = false

    this._cacheDirectory = opts.directory ?? './cache/data'

    if (opts?.deleteCacheDirOnStart ?? true) {
      // Clear cache directory on start
      fs.rm(this._cacheDirectory, {
        force: true,
        recursive: true
      }).catch(err => console.trace(`Could not clear cache directory ${this._cacheDirectory}`, err))
    }

    const cacheOpts = {
      max: 1000,
      ttl: 3600 * 1000,
      dispose: (value, key) => {
        const { filePath } = this._getKeyFilenameInCache(key)
        fs.rm(filePath, { force: true }).catch(err => console.trace(`Could not remove cached file for key ${key}`, err))
      },
      ...opts?.cache
    }

    this._cache = new TTLCache(cacheOpts)

    this.init()
  }

  _getKeyFilenameInCache (key) {
    const encoded = crypto.createHash('md5').update(`${key}`).digest('hex')
    const subDir = encoded.substring(0, 2)

    // We split the cached keys into "n" directories
    // to work around issues with too many files in a single directory.
    const dir = path.join(this._cacheDirectory, subDir)
    const filePath = path.join(dir, encoded)

    return { dir, filePath }
  }

  async get (key) {
    const { filePath } = this._getKeyFilenameInCache(key)
    try {
      const value = await fs.readFile(filePath, 'utf8')
      return JSON.parse(value)
    } catch (err) {
      if (err?.code !== 'ENOENT') {
        console.trace(err)
      }
      return undefined
    }
  }

  async set (key, value, opts = {}) {
    const { dir, filePath } = this._getKeyFilenameInCache(key)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(value))

    return this._cache.set(key, true, opts)
  }

  size () { return this._cache.size }
  getRemainingTTL (key) { return this._cache.getRemainingTTL(key) }
  has (key) { return this._cache.has(key) }
  delete (key) { return this._cache.delete(key) }
  clear () { return this._cache.clear() }
  entries () { return this._cache.entries() }
  keys () { return this._cache.keys() }
  values () { return this._cache.values() }
}

module.exports = TTLCacheFs
