export default class HelloStorage {
    constructor(options) {
        this.storage = options.storage || window.sessionStorage
        this.namespace = options.namespace || '__HELLO_STORAGE__'
        this.expires = options.expires || 0
        this.async = !!options.async
        this.keys_namespace = this.namespace + '__KEYS__'
    }
    set(key, value, expires) {
        let id = this.namespace + '.' + key
        let data = {
            time : Date.now(),
            expires: expires || this.expires,
            data : value,
        }

        let fn1 = () => this.storage.setItem(id, JSON.stringify(data))
        let fn2 = () => this.storage.getItem(this.keys_namespace)
        let fn3 = (keys) => {
            if (keys) {
                keys = JSON.parse(keys)
            }
            else {
                keys = []
            }
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
        
        return this
    }
    get(key) {
        let id = this.namespace + '.' + key

        let fn1 = () => this.storage.getItem(id)
        let fn2 = (data) => {
            if (!data) {
                return
            }

            let parsed = JSON.parse(data)
            let expires = parsed.expires

            if (expires) {
                let createTime = parsed.time
                let expiresTime = createTime + expires
                let currentTime = Date.now()
                if (currentTime > expiresTime) {
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
        fn3(value)

        return value
    }
    remove(key) {
        let id = this.namespace + '.' + key

        let fn1 = () => this.storage.removeItem(id)
        let fn2 = () => this.storage.getItem(this.keys_namespace)
        let fn3 = (keys) => {
            if (keys) {
                keys = JSON.parse(keys)
                keys = keys.filter(item => item !== id)
                return this.storage.setItem(this.keys_namespace, JSON.stringify(keys))
            }
        }
        
        if (this.async) {
            return asyncrun(fn1, fn2, fn3)
        }

        fn1()
        let keys = fn2()
        fn3(keys)

        return this
    }
    clear() {
        let fn1 = () => this.storage.getItem(this.keys_namespace)
        let fn2 = (keys) => {
            if (keys) {
                keys = JSON.parse(keys)
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
                keys = JSON.parse(keys)
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
            return asyncrun(fn1).then(fn2)
        }

        let keys = fn1()
        return fn2(keys)
    }
}

function asyncrun(...fns) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            let i = 0
            let run = (args) => {
                let fn = fns[i]
                if (!fn) {
                    resolve(args)
                    return
                }
                i ++
                return Promise.resolve(fn(args)).then(run).catch(reject)
            }
            return run()
        })
    })
}
