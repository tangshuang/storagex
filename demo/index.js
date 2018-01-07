import HelloStorage from '../dist/hello-storage'

let store = new HelloStorage({ 
  storage: 'sessionStorage',
  namespace: 'my_test_',
})

store.set('key1', { a: 1 })

console.log(sessionStorage.getItem('my_test_key1'), store.get('key1'))