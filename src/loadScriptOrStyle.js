/**
 * 获取数据类型
 * @param {*} data
 * @return 'string' | 'number' | 'object' | 'array' | 'function' | 'undefined' | 'null' | 'date' | 'regexp' | 'error' | 'map' | 'weakmap' | 'boolean' | 'math' | 'set' | 'weakset' | 'json'
 */
/* function type (data) {
  return Object.prototype.toString.call(data).slice(8, -1).toLowerCase()
} */

/**
 * 文件是否已加载（js 或 css）
 * @param {String} src 文件地址
 * @param {Number} type文件类型 0-js 1-css
 */
function isFileLoaded (src, type = 0) {
  const tagName = type === 0 ? 'script' : 'link'
  const attribute = type === 0 ? 'src' : 'href'
  const files = Array.from(document.getElementsByTagName(tagName))
  return files.includes(i => i.getAttribute(attribute) === src)
}

/**
 * 加载文件（js 或 css）
 * @param {String} src 文件地址
 * @param {Number} type 文件类型 0-js 1-css
 */
function loadFile (src, type = 0) {
  return new Promise((resolve, reject) => {
    if (!isFileLoaded(src, type)) {
      const tagName = type === 0 ? 'script' : 'link'
      const attribute = type === 0 ? 'src' : 'href'
      const file = document.createElement(tagName)
      document.head.appendChild(file)
      file.setAttribute(attribute, src)
      if (type !== 0) file.setAttribute('rel', 'stylesheet')
      file.onload = resolve
      file.onerror = reject
    } else {
      resolve()
    }
  })
}

/**
 * 加载 js 文件
 * @param {String | String[]} src 文件地址
 * @param {Boolean} isSeries 是否串行获取 js 文件，否则并行获取，默认串行
 * @return {Promise<T>}
 */
async function loadScript (src, isSeries = true) {
  if (typeof src === 'string') {
    return loadFile(src, 0)
  }
  if (Array.isArray(src) === true) {
    if (isSeries) {
      for (let i = 0; i < src.length; i++) {
        await loadFile(src[i], 0)
      }
    } else {
      return Promise.all(src.map(i => loadFile(i, 0)))
    }
  }
}

/**
 * 加载 css 文件
 * @param {String | String[]} src 文件地址
 */
function loadStyle (src) {
  if (typeof src === 'string') {
    return loadFile(src, 1)
  }
  if (Array.isArray(src) === true) {
    return Promise.all(src.map(i => loadFile(i, 1)))
  }
}

export { loadScript, loadStyle }
