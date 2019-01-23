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
 * @param {*} tree 树
 * @param {*} idKey id字段名
 * @param {*} childrenKey 子节点字段名
 */
function getNodeFromTree(id, tree, idKey = 'id', childrenKey = 'children') {
  const find = nodes => {
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i]
      if (node[idKey] === id) {
        return node
      } else {
        const children = node[childrenKey]
        if (children && children.length) {
          let temp = find(children)
          if (temp) return temp
        }
      }
    }
  }
  return find(tree)
}

export {
  getNodePathFromTree,
  getNodeFromTree
}
