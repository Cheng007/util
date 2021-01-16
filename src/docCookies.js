const docCookies = {
  getItem (name) {
    const regExp = new RegExp(`(?:(?:^|.*;)\\s*${encodeURIComponent(name).replace(/[-.+*]/g, '\\$&')}\\s*\\=\\s*([^;]*).*$)|^.*$`)
    return decodeURIComponent(document.cookie.replace(regExp, '$1')) || null
  },
  setItem (name, value, end, path, domain, secure) {
    if (!name || /^(?:expires|max-age|path|domain|secure)$/i.test(name)) return false
    let expires = ''
    if (end) {
      switch (end.constructor) {
        case Number:
          expires = end === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + end
          break
        case String:
          expires = '; expires=' + end
          break
        case Date:
          expires = '; expires=' + end.toUTCString()
          break
      }
    }
    document.cookie = [
      encodeURIComponent(name) + '=' + encodeURIComponent(value),
      expires,
      domain ? '; domain=' + domain : '',
      path ? '; path=' + path : '',
      secure ? '; secure' : ''
    ].join('')
    return true
  },
  removeItem (name, path, domain) {
    if (!name || !this.hasItem(name)) return false
    document.cookie = [
      encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      domain ? '; domain=' + domain : '',
      path ? '; path=' + path : ''
    ].join('')
    return true
  },
  clear () {
    this.keys().forEach(i => this.removeItem(i))
    return true
  },
  hasItem (name) {
    const regExp = new RegExp('(?:^|;\\s*)' + encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') + '\\s*\\=')
    return regExp.test(document.cookie)
  },
  keys () {
    let keys = document.cookie
      .replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, '')
      .split(/\s*(?:=[^;]*)?;\s*/)
    keys.forEach(i => (i = decodeURIComponent(i)))
    return keys
  }
}

export default docCookies
