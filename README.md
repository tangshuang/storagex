# frontend-storage-optimize
optimize frontend storage for window.localStorage &amp; window.sessionStorage

# Install

1. require by node, require.js, sea.js

2. script src link

# Methods

1. window.storage.local(name,value,expires)

use window.localStorage to store data.

name - the key of data item, required.
value - the data you want to store, optional.
expires - how long do you want to store? by seconds. optional.

i.e.

```
// get
var val = window.storage.local('key');
// set
window.storage.local('key','val',3600*12); // support object value, object will be change to string by JSON.stringfy, and JSON.parse when you get data.
// remove
window.storage.local('key',null); // use null to clean the item.
```

2. window.storage.session(name,value,expires)

use window.sessionStorage to store data. you can use this the same with window.storage.local .

3. window.storage.object(name,value,expires)

use a object variable to store data, so when you refresh window, data will be cleaned. this may be useful when you create one-pagefull app.