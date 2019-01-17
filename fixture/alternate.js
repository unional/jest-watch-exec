let value = true
module.exports = {
  run() {
    const result = !!value
    value = !value
    return result
  }
}
