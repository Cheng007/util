/**
 * 获取树中某节点的完整路径
 * @param {string | number} id 节点ID
 * @param {array} tree 树
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 */
function getNodePathFromTree(id, tree = [], idKey = 'id', childrenKey = 'children') {
  const path = []
  const findPath = nodes => {
    for(let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i]
      if (node[idKey] === id) {
        path.push(node)
        return true
      } else {
        const children = node[childrenKey]
        if (children && children.length) {
          path.push(node)
          const hasFind = findPath(children)
          if (!hasFind) {
            path.pop()
          } else {
            return true
          }
        }
      }
    }
  }
  findPath(tree)
  return path
}

/**
 * 获取树中某节点
 * @param {string | number} id 节点ID
 * @param {array} tree 树
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 */
function getNodeFromTree(id, tree = [], idKey = 'id', childrenKey = 'children') {
  return tree.reduce((acc, cur) => {
    return acc
      || (cur[idKey] === id && cur)
      || getNodeFromTree(id, cur[childrenKey], idKey, childrenKey)
  }, null)
}

/**
 * 获取树中所有叶子节点
 * @param {array} tree 树
 * @param {string} childrenKey 子节点字段名
 */
function getLeavesFromTree(tree = [], childrenKey = 'children') {
  return tree.reduce((acc, cur) => {
    return acc.concat(
      cur[childrenKey] && cur[childrenKey].length
        ? getLeavesFromTree(cur[childrenKey], childrenKey)
        : cur
    )
  }, [])
}

/**
 * 树结构转一维数组
 * @param {array} tree 树
 * @param {string} childrenKey 子节点字段名
 */
function treeToFlat(tree = [], childrenKey = 'children') {
  return tree.reduce((acc, cur) => {
    return acc.concat(
      cur,
      cur[childrenKey] ? treeToFlat(cur[childrenKey], childrenKey) : []
    )
  }, [])
}

/**
 * 一维数组转树结构
 * @param {array} flat 一维数组
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 * @param {string} parentKey 父节点字段名
 */
function flatToTree(flat = [], idKey = 'id', childrenKey = 'children', parentKey = 'parentId') {
  let tree = flat.filter(i => !i[parentKey])
  let rest = flat.filter(i => i[parentKey])
  const toTree = (tree = []) => {
    tree.forEach(i => {
      const children = rest.filter(restItem => restItem[parentKey] === i[idKey])
      rest = rest.filter(restItem => restItem[parentKey] !== i[idKey])
      if (children.length) {
        i[childrenKey] = children
        toTree(children)
      }
    })
  }
  toTree(tree)
  return tree
}

export {
  getNodePathFromTree,
  getNodeFromTree,
  getLeavesFromTree,
  treeToFlat,
  flatToTree,
}
