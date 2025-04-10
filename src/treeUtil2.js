/**
 * 深度优先搜索以查找树中某个节点的完整路径
 * @param {Object} options - 选项对象
 * @param {string} options.id - 要查找的节点的ID
 * @param {Array} options.tree - 要搜索的树结构
 * @param {string} [options.idKey='id'] - 树中节点ID使用的键
 * @param {string} [options.childrenKey='children'] - 树中子节点数组使用的键
 * @returns {Array} - 节点的路径作为节点数组返回，如果未找到则返回空数组
 * @example
 * const tree = [
 *   { id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
 *   { id: 4 }
 * ];
 * findPathDFS({ id: 3, tree });
 * // 返回
 * [
 *  { id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
 *  { id: 2, children: [{ id: 3 }] },
 *  { id: 3 }
 * ]
 */
export function findPathDFS({id, tree = [], idKey = 'id', childrenKey = 'children'} = {}) {
  const stack = tree.map(i => ({ node: i, path: [i] }))
  while (stack.length > 0) {
    const { node, path } = stack.shift();
    if (node[idKey] === id) {
      return path;
    }
    const children = node[childrenKey] || [];
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      stack.unshift({ node: child, path: [...path, child] });
    }
  }

  return [];
}

/**
 * 深度优先搜索以查找树中的某个节点
 * @param {Object} options - 选项对象
 * @param {string} options.id - 要查找的节点的ID
 * @param {Array} options.tree - 要搜索的树结构
 * @param {string} [options.idKey='id'] - 树中节点ID使用的键
 * @param {string} [options.childrenKey='children'] - 树中子节点数组使用的键
 * @returns {Object|null} - 找到的节点对象，如果未找到则返回null
 * @example
 * const tree = [
 *   { id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
 *   { id: 4 }
 * ];
 * findNode({ id: 3, tree }); // 返回 { id: 3 }
 */
export function findNodeDFS({ id, tree = [], idKey = 'id', childrenKey = 'children' } = {}) {
  const stack = [...tree]
  while (stack.length) {
    const item = stack.shift()
    if (item[idKey] === id) {
      return item
    }
    const children = item[childrenKey] ?? []
    for (let i = children.length - 1; i >= 0; i--) {
      stack.unshift(children[i])
    }
  }
  return null
}
g