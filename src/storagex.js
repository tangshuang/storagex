export class StorageX {
  constructor(options) {
    const { namespace, storage, expire, stringify } = options

    this.storage = storage || makeStorage({})
    this.expire = expire || 0
    this.async = !!options.async
    this.stringify = stringify === undefined ? true : !!stringify

    this.namespace = namespace ? namespace + '.' : ''
    this.namespace_keys = namespace ? namespace + '.__keys' : ''
  }
  set(key, value, expire) {
    const name = this.namespace + key
    const state = {
      time : Date.now(),
      expire: expire || this.expire,
      data : value,
    }
    const json = this.namespace ? state : value
    const data = this.stringify ? JSON.stringify(json) : json

    const setData = () => this.storage.setItem(name, data)

    // without namespace, save directly
    if (!this.namespace) {
      return setData()
    }

    const getKeys = () => this.keys()
    const parseKeys = (keys) => {
      if (keys.indexOf(key) === -1) {
        keys.push(key)
      }
      return this.stringify ? JSON.stringify(keys) : keys
    }
    const setKeys = (keys) => this.storage.setItem(this.namespace_keys, keys)

    // async store
    if (this.async) {
      return Promise.resolve().then(setData).then(getKeys).then(parseKeys).then(setKeys)
    }
    // sync store
    else {
      setData()
      let keys = getKeys()
      keys = parseKeys(keys)
      setKeys(keys)
      return this
    }
  }
  get(key) {
    const name = this.namespace + key

    const getData = () => this.storage.getItem(name)

    if (!this.namespace) {
      return getData()
    }

    const parseData = (data) => {
      if (!data) {
        return
      }

      const parsed = parseJSON(data)

      if (!parsed) {
        return
      }

      const expire = parsed.expire
      const origin = parsed.data

      if (expire) {
        const createTime = parsed.time
        const expireTime = createTime + expire
        const currentTime = Date.now()
        if (currentTime > expireTime) {
          return { expired: true }
        }
        return { expired: false, data: origin }
      }
      else {
        return { expired: false, data: origin }
      }
    }

    if (this.async) {
      return Promise.resolve().then(getData).then(parseData).then((parsed) => {
        if (!parsed) {
          return
        }

        const { expired, data } = parsed

        if (expired) {
          return this.remove(name).then(() => undefined)
        }

        return data
      })
    }
    else {
      const stored = getData()
      const parsed = parseData(stored)

      if (!parsed) {
        return
      }

      const { expired, data } = parsed

      if (expired) {
        this.remove(name)
        return
      }

      return data
    }
  }
  remove(key) {
    const name = this.namespace + key

    const removeData = () => this.storage.removeItem(name)

    // without namespace
    if (!this.namespace) {
      return removeData()
    }

    const getKeys = () => this.storage.getItem(this.namespace_keys)
    const parseKeys = (keys) => {
      keys = parseJSON(keys) || []
      keys = keys.filter(item => item !== key)
      return this.stringify ? JSON.stringify(keys) : keys
    }
    const setKeys = (keys) => this.storage.setItem(this.namespace_keys, keys)

    // async store
    if (this.async) {
      return Promise.resolve().then(removeData).then(getKeys).then(parseKeys).then(setKeys)
    }
    // sync store
    else {
      removeData()
      let keys = getKeys()
      keys = parseKeys(keys)
      setKeys(keys)
      return this
    }
  }
  keys() {
    const getKeys = () => this.storage.getItem(this.namespace_keys)
    const parseKeys = (keys) => parseJSON(keys) || []

    if (this.async) {
      return Promise.resolve().then(getKeys).then(parseKeys)
    }
    else {
      const keys = getKeys()
      return parseKeys(keys)
    }
  }
  key(i) {
    const getKeys = () => this.keys()
    const findKey = (keys) => keys[i]

    if (this.async) {
      return Promise.resolve().then(getKeys).then(findKey)
    }
    else {
      const keys = getKeys()
      const key = findKey(keys)
      return key
    }
  }
  all() {
    const getKeys = () => this.keys()
    const getItems = (keys) => keys.map(key => this.get(key))

    if (this.async) {
      return Promise.resolve().then(getKeys).then((keys) => Promise.all([getItems(keys)]))
    }
    else {
      const keys = getKeys()
      const items = getItems(keys)
      return items
    }
  }
  clear() {
    const getKeys = () => this.keys()
    const removeItems = (keys) => keys.map(key => this.remove(key))
    const removeKeys = () => this.storage.setItem(this.namespace_keys, [])

    if (this.async) {
      return Promise.resolve().then(getKeys).then(removeItems).then(removeKeys)
    }
    else {
      const keys = getKeys()
      removeItems(keys)
      removeKeys()
      return this
    }
  }
}

export default StorageX

function makeStorage(obj) {
  const data = {}
  obj.getItem = key => data[key]
  obj.setItem = (key, value) => { data[key] = value }
  obj.removeItem = key => { delete data[key] }
  obj.keys = () => Object.keys(data)
  obj.key = i => obj.keys()[i]
  obj.clear = () => obj.keys().map(key => StorageX.removeItem(key))
}

function parseJSON(input) {
  if (!input) {
    return
  }

  if (typeof input === 'object') {
    return input
  }

  if (typeof input !== 'string') {
    return
  }

  try {
    return JSON.parse(input)
  }
  catch(e) {
    return
  }
}
