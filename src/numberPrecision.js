// 解决浮点数运算精度问题
// 如：0.1 + 0.2 = 0.30000000000000004，0.3 - 0.1 = 0.19999999999999998
// 参考：https://github.com/nefe/number-precision
// 原项目是 ts 版本，这里转换成了 js 版本

/**
 * 获取实际的小数位数，支持科学计数法
 *
 * @param {number} num
 * @returns {number} 实际小数位数
 */
function digitLength (num) {
  const eSplit = num.toString().split(/[eE]/)
  const len = (eSplit[0].split('.')[1] || '').length - (eSplit[1] || 0)
  return len > 0 ? len : 0
}

/**
 * 小数转整数，若是小数则放大成整数
 *
 * @param {number} num
 * @returns {number} 转换后的整数
 */
function float2Fixed (num) {
  if (!num.toString().includes('e')) {
    return Number(num.toString().replace('.', ''))
  }
  const len = digitLength(num)
  return len > 0 ? num * 10 ** len : num
}

/**
 * 检查数字是否越界
 *
 * @param {number} num
 */
function checkBoundary (num) {
  if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
    console.warn(`${num} is beyound boundary when transfer to interger, the results may not be accurate`)
  }
}

/**
 * 精确乘法
 *
 * @param {number} num1
 * @param {number} num2
 * @param {number[]} others
 * @returns {number}
 */
function times (num1, num2, ...others) {
  if (others.length > 0) {
    return times(times(num1, num2), others[0], ...others.slice(1))
  }
  const num1Changed = float2Fixed(num1)
  const num2Changed = float2Fixed(num2)
  const multiple = digitLength(num1) + digitLength(num2)
  const leftValue = num1Changed * num2Changed

  checkBoundary(leftValue)

  return leftValue / 10 ** multiple
}

/**
 * 精确加法
 *
 * @param {number} num1
 * @param {number} num2
 * @param {number[]} others
 * @returns {number}
 */
function add (num1, num2, ...others) {
  if (others.length > 0) {
    return add(add(num1, num2), others[0], ...others.slice(1))
  }
  const multiple = 10 ** Math.max(digitLength(num1), digitLength(num2))
  return (times(num1, multiple) + times(num2, multiple)) / multiple
}

/**
 * 精确减法
 *
 * @param {number} num1
 * @param {number} num2
 * @param {number[]} others
 * @returns {number}
 */
function sub (num1, num2, ...others) {
  if (others.length > 0) {
    return sub(sub(num1, num2), others[0], ...others.slice(1))
  }
  const multiple = 10 ** Math.max(digitLength(num1), digitLength(num2))
  return (times(num1, multiple) - times(num2, multiple)) / multiple
}

/**
 * 精确除法
 *
 * @param {number} num1
 * @param {number} num2
 * @param {number[]} others
 * @returns {number}
 */
function divide (num1, num2, ...others) {
  if (others.length > 0) {
    return divide(divide(num1, num2), others[0], ...others.slice(1))
  }
  const num1Changed = float2Fixed(num1)
  const num2Changed = float2Fixed(num2)

  checkBoundary(num1Changed)
  checkBoundary(num1Changed)

  return times((num1Changed / num2Changed), 10 ** (digitLength(num2) - digitLength(num1)))
}

export default { add, sub, times, divide }
