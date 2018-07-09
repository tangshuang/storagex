function asyncFn(fn) {
    return Promise.resolve().then(() => fn())
}

export default class HelloStorage {
    constructor(options) {
        this.storage = options.storage || sessionStorage
        this.namespace = options.namespace || '__HELLO_STORAGE__'
        this.expires = options.expires || 0
        this.async = !!options.async
        this.keys_namespace = this.namespace + '__KEYS__'
    }
    set(key, value, expires) {
        let fn = () => {
            let id = this.namespace + '.' + key
            let data = {
                time : Date.now(),
                expires: expires || this.expires,
                data : value,
            }
            this.storage.setItem(id, JSON.stringify(data))

            let keys = this.storage.getItem(this.keys_namespace)
            if (keys) {
                keys = JSON.parse(keys)
            }
            else {
                keys = []
            }
            if (keys.indexOf(id) === -1) {
                keys.push(id)
            }
            this.storage.setItem(this.keys_namespace, JSON.stringify(keys))
        }
        
        if (this.async) {
            return asyncFn(fn)
        }

        fn()
        return this
    }
    get(key) {
        let fn = () => {
            let id = this.namespace + '.' + key
            let data = this.storage.getItem(id)

            if (!data) {
                return
            }

            let parsed = JSON.parse(data)
            let expires = parsed.expires

            if (expires) {
                let createTime = parsed.time
                let expiresTime = createTime + expires * 1000
                let currentTime = Date.now()
                if (currentTime > expiresTime) {
                    this.remove(key)
                    return null
                }
                return parsed.data
            }
            else {
                return parsed.data
            }
        }
        
        if (this.async) {
            return asyncFn(fn)
        }

        return fn()
    }
    remove(key) {
        let fn = () => {
            let id = this.namespace + '.' + key
            this.storage.removeItem(id)

            let keys = this.storage.getItem(this.keys_namespace)
            if (keys) {
                keys = JSON.parse(keys)
                keys = keys.filter(item => item !== id)
                this.storage.setItem(this.keys_namespace, JSON.stringify(keys))
            }
        }
        
        if (this.async) {
            return asyncFn(fn)
        }

        fn()
        return this
    }
    clean() {
        let fn = () => {
            let keys = this.storage.getItem(this.keys_namespace)
            if (keys) {
                keys = JSON.parse(keys)
                keys.forEach(key => this.storage.removeItem(key))
                this.storage.removeItem(this.keys_namespace)
            }
        }

        if (this.async) {
            return asyncFn(fn)
        }
        
        fn()
        return this
    }
    getAllKeys() {
        let fn = () => {
            let keys = this.storage.getItem(this.keys_namespace)
            if (keys) {
                keys = JSON.parse(keys)
                keys = keys.map(key => key.replace(this.namespace + '.', ''))
                return keys
            }
            return []
        }
        
        if (this.async) {
            return asyncFn(fn)
        }

        return fn()
    }
}