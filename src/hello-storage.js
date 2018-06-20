export default class HelloStorage {
    constructor(options) {
        let { storage, namespace, expires } = options
        this.storage = storage || sessionStorage
        this.namespace = namespace || '__hellostorage__'
        this.expires = expires || 0
        this.keys_namespace = this.namespace + '__keys__'
    }
    set(key, value, expires) {
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

        return this
    }
    get(key) {
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
    remove(key) {
        let id = this.namespace + '.' + key
        this.storage.removeItem(id)

        let keys = this.storage.getItem(this.keys_namespace)
        if (keys) {
            keys = JSON.parse(keys)
            keys = keys.filter(item => item !== id)
            this.storage.setItem(this.keys_namespace, JSON.stringify(keys))
        }

        return this
    }
    clean() {
        let keys = this.storage.getItem(this.keys_namespace)
        if (keys) {
            keys = JSON.parse(keys)
            keys.forEach(key => this.storage.removeItem(key))
            this.storage.removeItem(this.keys_namespace)
        }
        return this
    }
}