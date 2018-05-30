export default class HelloStorage {
    constructor(options) {
        let { storage, namespace, expires } = options
        this.storage = storage || 'object'
        this.namespace = namespace || ''
        this.expires = expires || 0
        this.data = {}
        this.keys = []
    }
    set(key, value) {
        let expires = this.expires
        let id = this.namespace + '.' + key
        let data = {
            time : new Date().getTime(),
            expires,
            data : value,
        }
        if (this.storage === 'localStorage') {
            localStorage.setItem(id, JSON.stringify(data))
        }
        else if (this.storage === 'sessionStorage') {
            sessionStorage.setItem(id, JSON.stringify(data))
        }
        else if (this.storage === 'cookie') {
            let expiresTime = new Date(new Date().getTime() + expires * 1000).toGMTString()
            document.cookie = `${id}=${JSON.stringify(data)}` + (expires ? `; expires=${expiresTime}` : '') + '; path=/'
        }
        else {
            this.data[id] = data
        }

        this.keys.push(key)

        return this
    }
    get(key) {
        let expires = this.expires
        let id = this.namespace + '.' + key
        let getData = data => {
            if (!data) {
                return null
            }
            if (data.expires) {
                let createTime = data.time
                let expiresTime = createTime + data.expires * 1000
                let currentTime = new Date().getTime()
                if (currentTime > expiresTime) {
                    this.remove(key)
                    return null
                }
                return data.data
            }
            else {
                return data.data
            }
        }
        let data
        if (this.storage === 'localStorage') {
            data = localStorage.getItem(id)
            data = JSON.parse(data)
            data = getData(data)
        }
        else if (this.storage === 'sessionStorage') {
            data = sessionStorage.getItem(id)
            data = JSON.parse(data)
            data = getData(data)
        }
        else if (this.storage === 'cookie') {
            let getCookie = (cookiename) => {
                let cookieString = RegExp(""+cookiename+"[^;]+").exec(document.cookie)
                let data = !!cookieString ? cookieString.toString().replace(/^[^=]+./,"") : ""
                return !!data ? JSON.parse(data) : null
            }
            data = getCookie(id)
        }
        else {
            data = this.data[id]
            data = getData(data)
        }

        return data
    }
    remove(key) {
        let id = this.namespace + '.' + key
        if (this.storage === 'localStorage') {
            localStorage.removeItem(id)
        }
        else if (this.storage === 'sessionStorage') {
            sessionStorage.removeItem(id)
        }
        else if (this.storage === 'cookie') {
            document.cookie = `${id}=null; expires=-1; path=/`
        }
        else {
            delete this.data[id]
        }

        this.keys = this.keys.filter(item => item !== key)

        return this
    }
    clean() {
        let removeKeys = []
        this.keys.forEach(key => {
            let value = this.get(key)
            if (value === null) {
                this.remove(key)
                removeKeys.push(key)
            }
        })
        this.keys = this.keys.filter(key => removeKeys.indexOf(key) === -1)
        return this
    }
    getAll() {
        let data = {}
        this.keys.forEach(key => {
            let value = this.get(key)
            if (value) {
                data[key] = value
            }
        })
        return data
    }
    removeAll() {
        this.keys.forEach(key => {
            this.remove(key)
        })
        return this
    }
}