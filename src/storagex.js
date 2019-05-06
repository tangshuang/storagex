import { asyncrun, parsejson } from './utils'

export class StorageX {
  constructor(options) {
    this.storage = options.storage || StorageX
    this.namespace = options.namespace || '__STORAGEX__'
    this.expire = options.expire || 0
    this.async = !!options.async
    this.stringify = options.stringify === undefined ? true : !!options.stringify
    this.keys_namespace = this.namespace + '__KEYS__'
  }
  set(key, value, expire) {
    let id = this.namespace + '.' + key
    let data = {
      time : Date.now(),
      expire: expire || this.expire,
      data : value,
    }

    let fn1 = () => this.storage.setItem(id, this.stringify ? JSON.stringify(data) : data)
    let fn2 = () => this.storage.getItem(this.keys_namespace)
    let fn3 = (keys) => {
      keys = parsejson(keys) || []
      if (keys.indexOf(id) === -1) {
        keys.push(id)
      }
      return this.storage.setItem(this.keys_namespace, JSON.stringify(keys))
    }

    if (this.async) {
      return asyncrun(fn1, fn2, fn3)
    }

    fn1()
    let keys = fn2()
    fn3(keys)
  }
  get(key) {
    let id = this.namespace + '.' + key

    let fn1 = () => this.storage.getItem(id)
    let fn2 = (data) => {
      if (!data) {
        return
      }

      let parsed = parsejson(data)
      if (!parsed) {
        return
      }

      let expire = parsed.expire
      if (expire) {
        let createTime = parsed.time
        let expireTime = createTime + expire
        let currentTime = Date.now()
        if (currentTime > expireTime) {
          return null
        }
        return parsed.data
      }
      else {
        return parsed.data
      }
    }
    let fn3 = (value) => {
      if (value === null) {
        return this.remove(key)
      }
      return value
    }

    if (this.async) {
      return asyncrun(fn1, fn2, fn3)
    }

    let data = fn1()
    let value = fn2(data)
    value = fn3(value)

    return value
  }
  remove(key) {
    let id = this.namespace + '.' + key

    let fn1 = () => this.storage.removeItem(id)
    let fn2 = () => this.storage.getItem(this.keys_namespace)
    let fn3 = (keys) => {
      if (keys) {
        keys = parsejson(keys) || []
        keys = keys.filter(item => item !== id)
        return this.storage.setItem(this.keys_namespace, this.stringify ? JSON.stringify(keys) : keys)
      }
    }

    if (this.async) {
      return asyncrun(fn1, fn2, fn3)
    }

    fn1()
    let keys = fn2()
    fn3(keys)
  }
  clear() {
    let fn1 = () => this.storage.getItem(this.keys_namespace)
    let fn2 = (keys) => {
      if (keys) {
        keys = parsejson(keys) || []
        return keys.map(key => this.storage.removeItem(key))
      }
      return []
    }
    let fn3 = () => this.storage.removeItem(this.keys_namespace)

    if (this.async) {
      return asyncrun(fn1).then((keys) => {
        let defers = fn2(keys).map(item => asyncrun(() => item))
        return Promise.all(defers)
      }).then(fn3)
    }

    let keys = fn1()
    fn2(keys)
    fn3()

    return this
  }
  keys() {
    let fn1 = () => this.storage.getItem(this.keys_namespace)
    let fn2 = (keys) => {
      if (keys) {
        keys = parsejson(keys) || []
        keys = keys.map(key => key.replace(this.namespace + '.', ''))
        return keys
      }
      return []
    }

    if (this.async) {
      return asyncrun(fn1, fn2)
    }

    let keys = fn1()
    return fn2(keys)
  }
  key(i) {
    let fn1 = () => this.keys()
    let fn2 = (keys) => keys[i]

    if (this.async) {
      return asyncrun(fn1, fn2)
    }

    let keys = fn1()
    return fn2(keys)
  }
  all() {
    let build = (keys, results) => {
      let res = {}
      results.forEach((value, i) => {
        let key = keys[i]
        res[key] = value
      })
      return res
    }
    let fn1 = () => this.keys()
    let fn2 = (keys) => {
      let reuslts = keys.map(key => this.get(key))
      return build(keys, reuslts)
    }
    let fn3 = (keys) => {
      return Promise.all(keys.map(key => this.get(key))).then(results => build(keys, results))
    }

    if (this.async) {
      return asyncrun(fn1, fn3)
    }

    let keys = fn1()
    return fn2(keys)
  }
}

const data = {}
StorageX.getItem = key => data[key]
StorageX.setItem = (key, value) => { data[key] = value }
StorageX.removeItem = key => { delete data[key] }
StorageX.keys = () => Object.keys(data)
StorageX.key = i => StorageX.keys()[i]
StorageX.clear = () => StorageX.keys().forEach(key => StorageX.removeItem(key))

export default StorageX
