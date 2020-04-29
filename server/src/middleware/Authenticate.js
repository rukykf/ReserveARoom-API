const _ = require("lodash")

module.exports = function (req, res, next) {
  if (_.get(req, ["session", "user"]) == null) {
    return res.status(401).json({ messages: ["unauthorized access"] })
  }
  return next()
}
