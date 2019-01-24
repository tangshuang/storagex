export function asyncrun(...fns) {
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

export function parsejson(str) {
  try {
    return JSON.parse(str)
  }
  catch(e) {
    return
  }
}
