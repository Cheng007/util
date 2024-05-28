const CHAR = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const ZERO_CHAR = CHAR[0]
// 根据情况去添加更多单位吧，正常情况下够用了
const BIG_UNIT = ['', '万', '亿', '兆', '京', '垓', '秭']

/**
 * 万以内整数转中文
 * @param {number | string} num 
 * @example
 * number2CharBase(1) ==> 一
 * number2CharBase(11) ==> 一十一
 * number2CharBase(101) ==> 一百零一
 * number2CharBase(1000) ==> 一千
 * number2CharBase(1001) ==> 一千零一
 */
function number2CharBase(number) {
  number = number * 1
  // 只处理万以下数字
  if (number > 9999) {
    throw new Error(`数字不能超过9999：${number}`)
  }
  if (number === 0) return ZERO_CHAR
  
  const unit = ['千', '百', '十', '']
  const result = Array.from(String(number).padStart(4, '0'))
    .map((i, index) => {
      const num = i * 1
      return num > 0 ? CHAR[num] + unit[index] : ZERO_CHAR
    })
    .reduce((prev, cur, index, array) => {
      if (cur === ZERO_CHAR) {
        const isAllZeroNext = array.slice(index).every(i => i === ZERO_CHAR)
        // 三种情况
        // 1. 最前面的零不读
        // 2. 最后几个零不读
        // 3. 中间多个零只读一个
        if (
          prev.length
          && !isAllZeroNext
          && prev[prev.length - 1] !== ZERO_CHAR
        ) {
          return prev + cur
        }
        return prev
      }
      return prev + cur
    }, '')

  return result
}

/**
 * 整数转中文
 * @param {number | string} int 
 * @returns 
 * @example
 * int2Char(10001) ==> 一万零一
 * int2Char(209321321) ==> 二亿零九百三十二万一千三百二十一
 */
export function int2Char(int) {
  if (!/^[+-]?\d+$/.test(int)) {
    throw new Error(`非整数：${int}`)
  }
  int = String(int)
  let result = int.startsWith('-') ? '负' : ''
  int.replace(/[+-]/, '')

  let intChar = []
  for (let i = 1; i <= Math.ceil(int.length / 4); i++) {
    const start = int.length - i * 4
    let num = int.substring(start, start + 4)
    const tempchar = number2CharBase(num)
    if (BIG_UNIT[i - 1]) {
      intChar.push(BIG_UNIT[i - 1])
    }

    if (tempchar !== ZERO_CHAR) {
      intChar.push(tempchar)
    }

    if (num.startsWith('0') && intChar.length) {
      intChar.push(ZERO_CHAR)
    }
  }
  result += intChar.reverse().join('')
  return result
}

/**
 * 数字转中文
 * @param {number | string} number 
 * @returns 
 * @example
 * number2Chinese(1.34) ==> 一点三四
 */
export function number2Chinese(number) {
  if (/^[+-]?\d+$/.test(number) && !Number.isSafeInteger(number)) {
    console.warn(`注意：数字${number}超出安全整数范围【${-Number.MAX_SAFE_INTEGER}, ${Number.MAX_SAFE_INTEGER}】，可能会造成精度丢失`)
  }
  const [int, decimal] = String(number).split('.')
  let result = int2Char(int)
  if (decimal) {
    result += `点`
    for (let i = 0; i < decimal.length; i++) {
      result += CHAR[decimal[i]]
    }
  }

  return result
}