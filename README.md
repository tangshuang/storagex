# Hello Storage

A local storage scaffold which help developer to use localStorage/sessionStorage/Storage easliy.

## Install

```
npm install --save hello-storage
```

## Usage
ES6:

```js
import HelloStorage from 'hello-storage'
```

CommonJS:

```js
const { HelloStorage } = require('hello-storage')
```

Normal Browsers:

```html
<script src="./node_modules/hello-storage/dist/hello-storage.js"></script>
<script>
const { HelloStorage } = window['hello-storage']
</script>
```

To use:

```js
let store = new HelloStorage()
store.set('my_key', { value: 'ok' })

let value = store.get('my_key') // { value: 'ok' }
```

## Options

**namespace**

String to be prepended to each key. It is recommended to use '.' like 'com.docker.service.data'.

Notice: two HelloStorage instances SHOULD NOT have same namespace, or some conflict may come out.

**expire**

How long the value will be expired. Unit is ms. If you set '0', it means the value will never expire.

**storage**

Which storage driver do you want to use: localStorage, sessionStorage, AsyncStorage or any other Storage such as HelloStorage. Yes, you can use HelloStorage like a Native Storage with temporary variables.

```js
HelloStorage.setItem('key', 'value')
HelloStorage.getItem('key')
```

[AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) is used for react-native, when you pass AsyncStorage, options.async should MUST be `true`.
[HelloIndexedDB](https://github.com/tangshuang/hello-indexeddb) is a library to use indexedDB as storage, you can use its key-value mode and with options.async=true to use it too.

**async**

If options.async is set to be true, all methods will return a promise, so that you can use async functions easliy:

```js
let store = new HelloStorage({
  async: true,
})

;(async function() {
  let value = await store.get('my_key')
})()
```

**stringify**

Whether to use JSON.stringify to stringify data before put into storage.
Default is true, if you set to be false, you should must not use localStorage/sessionStorage, because they do not support storing object.

## Methods

### set(key, value, expire)

Add a data to the storage. `key` is a string, which will be connected with 'namespace'. `value` can be object.

```js
store.set('the_key', 'value')
```

If expire is not set, options.expire will be used.

### get(key)

Get data from storage by key. If no data found by the key, or the data is expired, `null` will be returned.

### remove(key)

Remove a certain data from the storage by key.

### clear()

Clear the whole store data.

### keys()

Return all keys of this namespace.
