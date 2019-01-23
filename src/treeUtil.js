/**
 * 获取树中某节点的完整路径
 * @param {string | number} id 节点ID
 * @param {array} tree 树
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 */
function getNodePathFromTree(id, tree = [], idKey = 'id', childrenKey = 'children') {
  const path = []
  const findNodes = nodes => {
    for(let i = 0, len = nodes.length; i < len; i++) {
      const item = nodes[i]
      if (item[idKey] === id) {
        path.push(item)
        return true
      } else {
        const children = item[childrenKey]
        if (children && children.length) {
          path.push(item)
          const hasFind = findNodes(children)
          if (!hasFind) {
            path.pop()
          } else {
            return true
          }
        }
      }
    }
  }
  findNodes(tree)
  return path
}