module.exports = {
  run() {
    return Promise.reject(new Error('some error'))
  }
}
