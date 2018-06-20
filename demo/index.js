import HelloStorage from '../hello-storage'

let store = new HelloStorage({ 
  storage: sessionStorage,
  namespace: 'my_test',
})

store.set('key1', { a: 1 })

console.log(sessionStorage.getItem('my_test.key1'), store.get('key1'))