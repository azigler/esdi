/**
 * General utility methods for ES6
 *
 * @class
 * @namespace
 */
class ZigUtils {
  /**
   * Determines the days, hours, minutes, and seconds represented in a provided string (e.g., `'1d2h3m4s'`, `'10h15s'`, `'5m'`)
   *
   * @static
   * @param {String} str
   * @returns {Object} object of properties for each unit of time: `day`, `hr`, `min`, and `sec`
   * @memberof ZigUtils
   */
  static parseIntervalString (str) {
    const day = parseInt(str.match(/(\d+)d/g) ? str.match(/(\d+)d/g)[0].slice(0, -1) : 0)
    const hr = parseInt(str.match(/(\d+)h/g) ? str.match(/(\d+)h/g)[0].slice(0, -1) : 0)
    const min = parseInt(str.match(/(\d+)m/g) ? str.match(/(\d+)m/g)[0].slice(0, -1) : 0)
    const sec = parseInt(str.match(/(\d+)s/g) ? str.match(/(\d+)s/g)[0].slice(0, -1) : 0)

    return { day, hr, min, sec }
  }

  /**
   * Capitalizes the first character of the provided string
   *
   * @static
   * @param {String} str string to capitalize
   * @returns {String} capitalized string
   * @memberof ZigUtils
   */
  static capitalize (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

module.exports = ZigUtils
