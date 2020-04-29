const sanitize = require("sanitize-caja")
const _ = require("lodash")

function recursiveSanitize(value) {
  if (_.isString(value)) {
    return sanitize(value)
  }

  if (_.isArray(value)) {
    return value.map((el) => recursiveSanitize(el))
  }

  if (_.isObject(value)) {
    let result = {}
    Object.entries(value).forEach(([key, element]) => {
      result[key] = recursiveSanitize(element)
    })
    return result
  }

  return value
}

module.exports = function (req, res, next) {
  req.body = recursiveSanitize(req.body)
  req.query = recursiveSanitize(req.query)
  req.params = recursiveSanitize(req.params)
  next()
}
