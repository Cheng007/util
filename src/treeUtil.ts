interface TreeOptions<T extends object, K extends keyof T, C extends keyof T> {
  id: T[K];
  tree?: T[];
  idKey?: K;
  childrenKey?: C;
}

interface TreeToFlatOptions<T extends object, C extends keyof T> {
  tree: T[];
  childrenKey?: C;
}

interface LeafToParentOptions<T extends object, K extends keyof T, C extends keyof T> {
  tree: T[];
  leafIds: T[K][];
  idKey?: K;
  childrenKey?: C;
}

interface ParentToLeafOptions<T extends object, K extends keyof T, C extends keyof T> {
  tree: T[];
  parentIds: T;
  idKey?: K;
  childrenKey?: C;
  getAllLeaf?: boolean;
}

interface FlatToTreeOptions<T> {
  flat?: T[];
  idKey?: string;
  childrenKey?: string;
  parentKey?: string;
}

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
export function findPathDFS<
  T extends { [key: string]: any },
  K extends keyof T = 'id',
  C extends keyof T = 'children'
>(options: TreeOptions<T, K, C>): T[] {
  const { id, tree = [], idKey = 'id', childrenKey = 'children' } = options
  const stack: { node: T; path: T[] }[] = tree.map(node => ({ node, path: [node] }));

  while (stack.length) {
    const { node, path } = stack.shift()!;
    if (node[idKey] === id) {
      return path;
    }
    const children = (node[childrenKey] as T[] | undefined) || [];
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
export function findNodeDFS<
  T extends { [key: string]: any },
  K extends keyof T = 'id',
  C extends keyof T = 'children'
>(options: TreeOptions<T, K, C>): T | null {
  const { id, tree = [], idKey = 'id', childrenKey = 'children' } = options
  const stack = [...tree]
  while (stack.length) {
    const item = stack.shift()!
    if (item[idKey] === id) {
      return item
    }
    const children = (item[childrenKey] || []) as T[]
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
 * @param {Array} options.leafIds - 选中的叶子节点的 ID 数组。
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
 * const leafIds = [4, 5, 6, 7];
 *
 * // 调用 leafToParent 函数
 * const result = leafToParent({ tree, leafIds });
 *
 * // 输出结果为 [1]，因为所有叶子节点的父节点和祖父节点最终可以被一个根节点 1 替代
 * console.log(result);
 */
export function leafToParent<
  T extends { [key: string]: any },
  K extends keyof T = 'id',
  C extends keyof T = 'children'
>(options: LeafToParentOptions<T, K, C>): T[K][] {
  const { tree, leafIds, idKey = 'id', childrenKey = 'children' } = options;
  const selected = new Set(leafIds);
  // 记录子节点到父节点的映射
  const parentMap = new Map();
  // 记录节点未选中的子节点数
  const childrenCount = new Map();

  // 建立父子关系和初始化计数
  const stack = [...tree];
  while (stack.length) {
    const node = stack.pop()!;
    const children = node[childrenKey]
    
    if (children.length) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
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
      // @ts-ignore
      if (count === 0) queue.push(parent);
    }
  }

  // 处理可以替换的父节点
  while (queue.length) {
    const parent = queue.shift();
    // @ts-ignore
    const parentId = parent[idKey];
    selected.add(parentId);

    // 移除所有子节点
    // @ts-ignore
    for (const child of parent[childrenKey]) {
      selected.delete(child[idKey]);
    }

    // 继续向上传播
    const grandParent = parentMap.get(parentId);
    if (grandParent) {
      const count = childrenCount.get(grandParent[idKey]) - 1;
      childrenCount.set(grandParent[idKey], count);
      // @ts-ignore
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
 * @param {Array} options.parentIds - 选中的父节点的 ID 数组。
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
 * const parentIds = [1];
 * const result = parentToLeaf({ tree, parentIds });
 * console.log(result); // 输出: [4, 5, 6, 7]
 */
export function parentToLeaf<
  T extends { [key: string]: any },
  K extends keyof T = 'id',
  C extends keyof T = 'children'
>(options: ParentToLeafOptions<T, K, C>): T[K][] {
  const { tree, parentIds, idKey = 'id', childrenKey = 'children', getAllLeaf = false } = options
  const leafNodes = [];
  // @ts-ignore
  const parentSet = new Set(parentIds || []);
  const stack = [...(tree || [])];

  while (stack.length) {
    const node = stack.pop()!;
    const isParent = parentSet.has(node[idKey]);

    if (isParent) {
      // 如果是选中的父节点，展开其所有叶子节点
      const subStack = [node];
      while (subStack.length) {
        const currentNode = subStack.pop()!;
        if (currentNode[childrenKey] && currentNode[childrenKey].length > 0) {
          // 有子节点，继续展开
          subStack.push(...currentNode[childrenKey].slice().reverse());
        } else {
          // 叶子节点
          // @ts-ignore
          leafNodes.push(currentNode[idKey]);
        }
      }
    } else if (parentSet.size === 0 && getAllLeaf) {
      // 如果没有指定父节点，收集所有叶子节点
      if (!node[childrenKey] || node[childrenKey].length === 0) {
        // @ts-ignore
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

/**
 * 将树形结构数据转换为扁平数组（使用迭代实现）
 * 
 * @param {Object} params - 配置参数
 * @param {Array} params.tree - 树形结构数据，默认为空数组
 * @param {string} params.childrenKey - 子节点属性名，默认为 'children'
 * @returns {Array} 扁平化后的数组
 * 
 * @example 基本使用示例
 * const treeData = [
 *   {
 *     id: 1,
 *     name: 'Node 1',
 *     children: [
 *       { id: 2, name: 'Node 1.1' },
 *       { id: 3, name: 'Node 1.2' }
 *     ]
 *   },
 *   {
 *     id: 4,
 *     name: 'Node 2'
 *   }
 * ];
 * 
 * const flatData = treeToFlat({ tree: treeData });
 * console.log(flatData);
 * // 输出:
 * // [
 * //   { id: 1, name: 'Node 1', children: [...] },
 * //   { id: 2, name: 'Node 1.1' },
 * //   { id: 3, name: 'Node 1.2' },
 * //   { id: 4, name: 'Node 2' }
 * // ]
 * 
 * @example 自定义子节点属性名
 * const treeData = [
 *   { id: 1, kids: [{ id: 2 }] }
 * ];
 * const flatData = treeToFlat({ tree: treeData, childrenKey: 'kids' });
 */
export function treeToFlat<
  T extends { [key: string]: any },
  C extends keyof T = 'children'
>(options: TreeToFlatOptions<T, C>): T[] {
  const { tree = [], childrenKey = 'children' } = options
  const flatArray: T[] = [];
  const stack = [...tree];

  while (stack.length) {
    const node = stack.shift()!;
    const children = (node[childrenKey] || []) as T[];

    for (let i = children.length - 1; i >= 0; i--) {
      stack.unshift(children[i]);
    }

    flatArray.push(node);
  }

  return flatArray;
}

/**
 * 将扁平数组转换为树形结构
 * @template T 节点数据类型
 * @param {Object} options 配置项
 * @param {T[]} [options.flat=[]] 扁平数组数据
 * @param {string} [options.idKey='id'] 节点唯一标识的属性名
 * @param {string} [options.childrenKey='children'] 子节点集合的属性名
 * @param {string} [options.parentKey='pid'] 父节点标识的属性名
 * @returns {T[]} 树形结构数据
 * 
 * @example 基本使用示例
 * // 输入数据
 * const flatData = [
 *   { id: 1, name: 'Node 1', pid: null },
 *   { id: 2, name: 'Node 2', pid: 1 },
 *   { id: 3, name: 'Node 3', pid: 1 },
 *   { id: 4, name: 'Node 4', pid: 2 },
 *   { id: 5, name: 'Node 5', pid: null },
 *   { id: 6, name: 'Node 6', pid: 5 },
 * ];
 * 
 * // 转换调用
 * const treeData = flatToTree({ flat: flatData });
 * 
 * // 输出结果
 * [
 *   {
 *     id: 1,
 *     name: 'Node 1',
 *     pid: null,
 *     children: [
 *       {
 *         id: 2,
 *         name: 'Node 2',
 *         pid: 1,
 *         children: [
 *           { id: 4, name: 'Node 4', pid: 2, children: [] }
 *         ]
 *       },
 *       { id: 3, name: 'Node 3', pid: 1, children: [] }
 *     ]
 *   },
 *   {
 *     id: 5,
 *     name: 'Node 5',
 *     pid: null,
 *     children: [
 *       { id: 6, name: 'Node 6', pid: 5, children: [] }
 *     ]
 *   }
 * ]
 * 
 * @example 自定义键名示例
 * // 使用不同的键名配置
 * const treeData2 = flatToTree({
 *   flat: [
 *     { uid: 1, text: 'Item 1', parent: null },
 *     { uid: 2, text: 'Item 2', parent: 1 }
 *   ],
 *   idKey: 'uid',
 *   childrenKey: 'items',
 *   parentKey: 'parent'
 * });
 * 
 * // 输出结果
 * [
 *   {
 *     uid: 1,
 *     text: 'Item 1',
 *     parent: null,
 *     items: [
 *       { uid: 2, text: 'Item 2', parent: 1, items: [] }
 *     ]
 *   }
 * ]
 */
export function flatToTree<T extends Record<string, any>>({
  flat = [],
  idKey = 'id',
  childrenKey = 'children',
  parentKey = 'pid'
}: FlatToTreeOptions<T> = {}): T[] {
  // 节点映射表，用于快速查找节点
  // key: 节点ID，value: 节点对象（包含初始化的子节点数组）
  const nodeMap = new Map<any, T>();
  
  // 存储所有根节点
  const roots: T[] = [];
  
  // 第一次遍历：初始化所有节点并存入映射表
  for (const node of flat) {
    nodeMap.set(node[idKey], { 
      ...node, 
      [childrenKey]: [] // 初始化子节点数组
    });
  }
  
  // 第二次遍历：构建树形结构
  for (const node of nodeMap.values()) {
    const parentId = node[parentKey];
    
    if (parentId === undefined || parentId === null) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(parentId);
      parent ? parent[childrenKey].push(node) : roots.push(node);
    }
  }
  
  return roots;
}
