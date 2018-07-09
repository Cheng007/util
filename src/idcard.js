const idcardLen = 18
const divisor = 11
const ratio = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const match = '10X98765432'
const provinces = {
  11: '北京市',
  12: '天津市',
  13: '河北省',
  14: '山西省',
  15: '内蒙古自治区',
  21: '辽宁省',
  22: '吉林省',
  23: '黑龙江省',
  31: '上海市',
  32: '江苏省',
  33: '浙江省',
  34: '安徽省',
  35: '福建省',
  36: '江西省',
  37: '山东省',
  41: '河南省',
  42: '湖北省',
  43: '湖南省',
  44: '广东省',
  45: '广西壮族自治区',
  46: '海南省',
  50: '重庆市',
  51: '四川省',
  52: '贵州省',
  53: '云南省',
  54: '西藏自治区',
  61: '陕西省',
  62: '甘肃省',
  63: '青海省',
  64: '宁夏回族自治区',
  65: '新疆维吾尔自治区',
  71: '台湾省',
  81: '香港特别行政区',
  82: '澳门特别行政区'
}

/**
 * 验证身份证
 *
 * @param {string} idcard
 * @returns {boolean} 身份证是否正确
 */
function verify (idcard) {
  const lastChar = idcard.slice(-1)
  const pre17Chars = idcard.slice(0, -1)
  const birthday = idcard.slice(6, 14)
  const province = idcard.slice(0, 2)

  if (
    typeof idcard !== 'string' ||
    idcard.length !== idcardLen ||
    !/^\d{17}$/.test(pre17Chars) ||
    !/^[\dX]$/.test(lastChar) ||
    !isBirthday(birthday) ||
    !isProvince(province)
  ) return false
  const total = pre17Chars.split('').reduce((prev, cur, idx) => prev + cur * ratio[idx], 0)
  const remainder = total % divisor
  return match.slice(remainder, remainder + 1) === lastChar
}

/**
 * 验证生日
 *
 * @param {string} birthday 生日，如19900718
 * @returns {boolean} 生日是否正确
 */
function isBirthday (birthday) {
  if (
    typeof birthday !== 'string' ||
    !/^\d{8}$/.test(birthday)
  ) return false
  const year = Number(birthday.slice(0, 4))
  const month = Number(birthday.slice(4, 6)) - 1
  const date = Number(birthday.slice(6, 8))
  const time = new Date()
  const birth = new Date(year, month, date)
  const now = new Date(time.getFullYear(), time.getMonth(), time.getDate())
  return now - birth > 0 &&
    birth.getFullYear() === year &&
    birth.getMonth() === month &&
    birth.getDate() === date
}

/**
 * 验证省份（直辖市、自治区、特别行政区）编码
 * TODO:未验证下级区域
 *
 * @param {string} code 编码
 * @returns {boolean} 编码是否正确
 */
function isProvince (code) {
  if (!/^\d{2}$/.test(code)) return false
  return code in provinces
}

export { verify }
