/**
 * 深度优先获取树中某节点的完整路径
 * @returns 
 */
function findPath({id, tree = [], idKey = 'id', childrenKey = 'children'} = {}) {
  const stack = tree.map(i => ({ node: i, path: [i] }))
  while (stack.length > 0) {
    const { node, path } = stack.shift();
    if (node[idKey] === id) {
      return path;
    }
    const children = node[childrenKey];
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      stack.unshift({ node: child, path: [...path, child] });
    }
  }

  return [];
}

// 深度优先查找某节点
// TODO:测试
function findNode({ id, tree = [], idKey = 'id', childrenKey = 'children'} = {}) {
  const stack = tree
  while (stack.length) {
    const item = stack.shift()
    const children = item[childrenKey]
    if (children[idKey] === id) {
      return children
    }
    for (let i = children.length - 1; i >= 0; i--) {
      stack.unshift(children[i])
    }
  }
  return null
}
