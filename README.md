# Hello Storage

A local storage resolution which help developer to use localStorage/sessionStorage/cookie/object storage mode easliy.

## Install

```
npm install --save hello-storage
```

## Usage

```
import HelloStorage from 'hello-storage'

let store = new HelloStorage({
  namespace: 'my.ns'
  expires: 10*60,
  storage: 'sessionStorage',
})

store.set('my_key', { value: 'ok' })

let value = store.get('my_key') // you will get an object
```

## Options

**namespace**

String to prepend to each key. It is recommended to use '.' like 'com.docker.service.data'.

Notice: two HelloStorage instances should NOT have same namespace, or same conflict may come out.

**expires**

How long the value will be expired. Unit is second. If you set '0', it means the value will never expire.

**storage**

Which storage driver do you want to use: localStorage, sessionStorage, cookie, object.

## Methods

### set(key, value)

Add a data to the storage. `key` is a string, which will be connected with 'namespace'. `value` can be object.

```
store.set('the_key', 'value')
```

### get(key)

Get data from storage by key. If no data found by the key, or the data is expired, `null` will be returned.

### remove(key)

Remove a data from the storage by key.

### clean()

Clean expired data.

### getAll()

Get all data from storage. An object will be returned.

### removeAll()

All data in storage will be removed.

