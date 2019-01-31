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

export function parsejson(input) {
  if (!input) {
    return
  }

  if (typeof input === 'object') {
    return input
  }

  if (typeof input !== 'string') {
    return
  }

  try {
    return JSON.parse(input)
  }
  catch(e) {
    return
  }
}
