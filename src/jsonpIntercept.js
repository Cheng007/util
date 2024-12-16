const originalCreateElement = document.createElement;
let tempMap = new Map();

/**
 * 脚本拦截处理
 *
 * @description
 * jsonp 链接示例：
 * https://webapi.amap.com/maps/ipLocation?key=de959984f2a4fea5436892436e7629d1&callback=jsonp_873204_&platform=JS&logversion=2.0&appname=http%3A%2F%2Flocalhost%3A8880%2Foutreach%2Fmap&csid=9F58F553-9BA2-487D-A94B-79ABE095C58B&sdkversion=1.4.27
 * jsonp 回调示例：
 * jsonp_768742_({"status":0,"info":"DEEPAL_11003"})
 *
 * 脚本的链接可以直接通过 src 属性设置，也可以通过调用 setAttribute 来设置，
 * 所以需要拦截或重写这两种方式
 */
function handleScript({ script, callbackKey, onResponse }) {
  let src = '';

  // 脚本的链接可以直接通过 src 设置
  Object.defineProperty(script, 'src', {
    get() {
      return src;
    },
    set(newVal) {
      script.setAttribute('src', newVal);
      src = newVal;
    },
  });

  const originalSetAttribute = script.setAttribute;
  // 脚本的链接也可以通过调用setAttribute来设置
  script.setAttribute = (...args) => {
    const [name, value] = args;
    if (name === 'src') {
      const search = value.split('?')?.[1] ?? '';
      const searchParams = new URLSearchParams(search);
      const originalCallback = searchParams.get(callbackKey);
      // 缓存原始回调
      tempMap.set(originalCallback, window[originalCallback]);

      if (originalCallback) {
        // 重写回调
        window[originalCallback] = (res) => {
          const url = value;
          const data = onResponse?.(res, url) ?? res;
          // 调用原始回调
          tempMap.get(originalCallback)(data);
          tempMap.delete(originalCallback);
        };
      }
    }
    originalSetAttribute.call(script, ...args);
  };
}

/**
 * @callback onResponseParams
 * @param {*} response - 响应数据
 * @param {string} url - 请求链接
 */

/**
 * jsonp 拦截
 *
 * @param {object} config
 * @param {string} [config.callbackKey] - 回调参数名标识，默认为 callback
 * @param {onResponseParams} [config.onResponse] - 响应回调，若对响应数据进行修改，请返回修改后的数据
 */
export function jsonpIntercept(config = {}) {
  const conf = {
    callbackKey: 'callback',
    ...config,
  };

  document.createElement = (tagName) => {
    const element = originalCreateElement.call(document, tagName);

    if (tagName.toLowerCase() === 'script') {
      handleScript({ script: element, callbackKey: conf.callbackKey, onResponse: conf.onResponse });
    }

    return element;
  };
};

/**
 * 移除 jsonp 拦截
 */
export function removeIntercept() {
  document.createElement = originalCreateElement;
  tempMap = null;
}
