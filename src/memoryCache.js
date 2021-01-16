class MemoryCache {
  _cache = Object.create(null);
  _size = 0;
  _debug = false;

  setItem(key, value, time, timeoutCallback) {
    if (this._debug) {
      console.log(`caching: ${key} = ${value} (${time}ms)`);
    }

    if (typeof time !== 'undefined' && (typeof time !== 'number' || isNaN(time) || time <= 0)) {
      throw new Error('Cache timeout must be a positive number');
    } else if (typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
      throw new Error('Cache timeout callback must be a function');
    }

    const oldRecord = this._cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
    } else {
      this._size ++;
    }

    let record = {
      value,
      expire: time + Date.now()
    };

    if (!isNaN(record.expire)) {
      record.timeout = setTimeout(() => {
        this._removeItem(key);
        if (timeoutCallback) {
          timeoutCallback(key, value);
        }
      }, time);
    }

    this._cache[key] = record;

    return value;
  }

  removeItem(key) {
    let canDelete = true;

    const oldRecord = this._cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
      if (!isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
        canDelete = false;
      }
    } else {
      canDelete = false;
    }

    if (canDelete) {
      this._removeItem(key);
    }

    return canDelete;
  }

  _removeItem(key) {
    this._size--;
    delete this._cache[key];
  }

  clear() {
    for (let key in this._cache) {
      clearTimeout(this._cache[key].timeout);
    }
    this._size = 0;
    this._cache = Object.create(null);
  }

  getItem(key) {
    const data = this._cache[key];
    if (typeof data != "undefined") {
      if (isNaN(data.expire) || data.expire >= Date.now()) {
        return data.value;
      } else {
        this._size--;
        delete this._cache[key];
      }
    }
    return null;
  }

  get debug() {
    return this._debug
  }

  set debug(bool) {
    this._debug = bool
  }

  get size() {
    return this._size
  }

  keys() {
    return Object.keys(this._cache);
  }

  hasItem(key) {
    return key in this._cache;
  }

  exportJson() {
    let plainJsCache = {};

    // Discard the `timeout` property.
    // Note: JSON doesn't support `NaN`, so convert it to `'NaN'`.
    for (let key in this._cache) {
      const record = this._cache[key];
      plainJsCache[key] = {
        value: record.value,
        expire: record.expire || 'NaN',
      };
    }

    return JSON.stringify(plainJsCache);
  }

  importJson(jsonToImport, options) {
    const cacheToImport = JSON.parse(jsonToImport);
    const currTime = Date.now();

    const skipDuplicates = options?.skipDuplicates;

    for (let key in cacheToImport) {
      if (cacheToImport.hasOwnProperty(key)) {
        if (skipDuplicates) {
          let existingRecord = this._cache[key];
          if (existingRecord) {
            if (this._debug) {
              console.log('Skipping duplicate imported key \'%s\'', key);
            }
            continue;
          }
        }

        const record = cacheToImport[key];

        // record.expire could be `'NaN'` if no expiry was set.
        // Try to subtract from it; a string minus a number is `NaN`, which is perfectly fine here.
        let remainingTime = record.expire - currTime;

        if (remainingTime <= 0) {
          // Delete any record that might exist with the same key, since this key is expired.
          this.removeItem(key);
          continue;
        }

        // Remaining time must now be either positive or `NaN`,
        // but `setItem` will throw an error if we try to give it `NaN`.
        remainingTime = remainingTime > 0 ? remainingTime : undefined;

        this.setItem(key, record.value, remainingTime);
      }
    }

    return this.size;
  }
}

export default MemoryCache
