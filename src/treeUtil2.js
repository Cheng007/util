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
 * findNodeDFS({ id: 3, tree }); // 返回 { id: 3 }
 */
export function findNodeDFS({ id, tree = [], idKey = 'id', childrenKey = 'children' } = {}) {
  const stack = [...tree]
  while (stack.length) {
    const item = stack.shift()
    if (item[idKey] === id) {
      return item
    }
    const children = item[childrenKey] || []
    for (let i = children.length - 1; i >= 0; i--) {
      stack.unshift(children[i])
    }
  }
  return null
}

/**
 * 叶子节点父级聚合
 *
 * @description
 * 该函数用于处理树形结构数据，将选中的叶子节点向上传播，找到能够替换这些叶子节点的父节点。
 * 若某个节点的所有子节点都被选中，则将该节点加入选中集合，并移除其所有子节点。
 * 最终返回一个包含所有选中节点 ID 的数组。
 *
 * @param {Object} [options] - 包含树形结构和相关配置的对象。
 * @param {Array} options.tree - 树形结构数据，每个节点是一个对象。
 * @param {Array} options.leaf - 选中的叶子节点的 ID 数组。
 * @param {string} [options.idKey='id'] - 节点 ID 的键名，默认为 'id'。
 * @param {string} [options.childrenKey='children'] - 子节点数组的键名，默认为 'children'。
 * @returns {Array} - 包含所有选中节点 ID 的数组。
 *
 * @example
 * const tree = [
 *   {
 *     id: 1,
 *     children: [
 *       {
 *         id: 2,
 *         children: [
 *           { id: 4 },
 *           { id: 5 }
 *         ]
 *       },
 *       {
 *         id: 3,
 *         children: [
 *           { id: 6 },
 *           { id: 7 }
 *         ]
 *       }
 *     ]
 *   }
 * ];
 *
 * // 选中叶子节点 4、5、6、7
 * const leaf = [4, 5, 6, 7];
 *
 * // 调用 leafToParent 函数
 * const result = leafToParent({ tree, leaf });
 *
 * // 输出结果为 [1]，因为所有叶子节点的父节点和祖父节点最终可以被一个根节点 1 替代
 * console.log(result);
 */
export function leafToParent({ tree, leaf, idKey = 'id', childrenKey = 'children' } = {}) {
  const selected = new Set(leaf);
  // 记录子节点到父节点的映射
  const parentMap = new Map();
  // 记录节点未选中的子节点数
  const childrenCount = new Map();

  // 建立父子关系和初始化计数
  const stack = [...tree];
  while (stack.length) {
    const node = stack.pop();
    if (node[childrenKey]) {
      for (const child of node[childrenKey]) {
        parentMap.set(child[idKey], node);
        stack.push(child);
      }
      childrenCount.set(node[idKey], node[childrenKey].length);
    }
  }

  // 处理叶子节点向上传播
  const queue = [];
  for (const id of selected) {
    const parent = parentMap.get(id);
    if (parent) {
      const count = childrenCount.get(parent[idKey]) - 1;
      childrenCount.set(parent[idKey], count);
      if (count === 0) queue.push(parent);
    }
  }

  // 处理可以替换的父节点
  while (queue.length) {
    const parent = queue.shift();
    const parentId = parent[idKey];
    selected.add(parentId);

    // 移除所有子节点
    for (const child of parent[childrenKey]) {
      selected.delete(child[idKey]);
    }

    // 继续向上传播
    const grandParent = parentMap.get(parentId);
    if (grandParent) {
      const count = childrenCount.get(grandParent[idKey]) - 1;
      childrenCount.set(grandParent[idKey], count);
      if (count === 0) queue.push(grandParent);
    }
  }

  return Array.from(selected);
}

/**
 *
 * 父节点转叶子节点
 *
 * @description
 * 此函数是 leafToParent 函数的逆向操作，用于将选中的父节点向下展开为其所有的叶子节点。
 *
 * @param {Object} [options] - 包含树形结构和相关配置的对象。
 * @param {Array} options.tree - 树形结构数据，每个节点是一个对象。
 * @param {Array} options.parent - 选中的父节点的 ID 数组。
 * @param {string} [options.idKey='id'] - 节点 ID 的键名，默认为 'id'。
 * @param {string} [options.childrenKey='children'] - 子节点数组的键名，默认为 'children'。
 * @param {Boolean} [options.getAllLeaf=false] - 在没有父节点时，是否返回所有叶子节点，默认为 false。
 * @returns {Array} - 包含所有展开后的叶子节点 ID 的数组。
 *
 * @example
 * const tree = [
 *   {
 *     id: 1,
 *     children: [
 *       {
 *         id: 2,
 *         children: [
 *           { id: 4 },
 *           { id: 5 }
 *         ]
 *       },
 *       {
 *         id: 3,
 *         children: [
 *           { id: 6 },
 *           { id: 7 }
 *         ]
 *       }
 *     ]
 *   }
 * ];
 * const parent = [1];
 * const result = parentToLeaf({ tree, parent });
 * console.log(result); // 输出: [4, 5, 6, 7]
 */
export function parentToLeaf({ tree, parent, idKey = 'id', childrenKey = 'children', getAllLeaf = false } = {}) {
  const leafNodes = [];
  const parentSet = new Set(parent || []);
  const stack = [...(tree || [])];

  while (stack.length) {
    const node = stack.pop();
    const isParent = parentSet.has(node[idKey]);

    if (isParent) {
      // 如果是选中的父节点，展开其所有叶子节点
      const subStack = [node];
      while (subStack.length) {
        const currentNode = subStack.pop();
        if (currentNode[childrenKey] && currentNode[childrenKey].length > 0) {
          // 有子节点，继续展开
          subStack.push(...currentNode[childrenKey].slice().reverse());
        } else {
          // 叶子节点
          leafNodes.push(currentNode[idKey]);
        }
      }
    } else if (parentSet.size === 0 && getAllLeaf) {
      // 如果没有指定父节点，收集所有叶子节点
      if (!node[childrenKey] || node[childrenKey].length === 0) {
        leafNodes.push(node[idKey]);
      } else {
        stack.push(...node[childrenKey].slice().reverse());
      }
    } else {
      // 如果不是选中的父节点，继续检查其子节点
      if (node[childrenKey] && node[childrenKey].length > 0) {
        stack.push(...node[childrenKey].slice().reverse());
      }
    }
  }

  return leafNodes;
}

interface TreeNode {
  [key: string]: any;
  children?: TreeNode[];
}

interface TreeToFlatOptions {
  tree?: TreeNode[];
  idKey?: string;
  childrenKey?: string;
}

function treeToFlat(options: TreeToFlatOptions = {}): TreeNode[] {
  const {
    tree = [],
    idKey = 'id',
    childrenKey = 'children'
  } = options;
  
  const flat: TreeNode[] = [];
  const stack: { node: TreeNode; parentId: string }[] = [];
  
  // 初始节点入栈
  tree.forEach(node => {
    stack.push({ node, parentId: '' });
  });
  
  while (stack.length > 0) {
    const { node, parentId } = stack.pop()!;
    
    // 添加父节点ID并推入结果数组
    const newNode = { ...node, parentId };
    flat.push(newNode);
    
    // 如果有子节点，将子节点入栈处理
    const children = node[childrenKey];
    if (children && children.length) {
      // 反向入栈以保证处理顺序与原始顺序一致
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push({ node: children[i], parentId: node[idKey] });
      }
    }
  }
  
  return flat;
}
