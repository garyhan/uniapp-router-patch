// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var stringifyPrimitive = function (v) {
    switch (typeof v) {
        case 'string':
            return v;

        case 'boolean':
            return v ? 'true' : 'false';

        case 'number':
            return isFinite(v) ? v : '';

        default:
            return '';
    }
};

function stringify(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
        obj = undefined;
    }

    if (typeof obj === 'object') {
        return Object.keys(obj).map(function (k) {
            var ks = stringifyPrimitive(k) + eq;
            if (Array.isArray(obj[k])) {
                return obj[k].map(function (v) {
                    return ks + stringifyPrimitive(v);
                }).join(sep);
            } else {
                return ks + stringifyPrimitive(obj[k]);
            }
        }).filter(Boolean).join(sep);
    }

    if (!name) return '';
    return stringifyPrimitive(name) + eq + stringifyPrimitive(obj);
}

/**
 * Created by gary on 2019-06-12.
 */

function parseUrl(location) {
    if (typeof location === 'string') return location;
    const {
        path,
        query
    } = location;

    const queryStr = stringify(query);

    if (!queryStr) return path;

    return `${path}?${queryStr}`;
}

function push(location, complete, fail, success) {
    const url = parseUrl(location);

    const params = {
        url,
        complete,
        fail,
        success
    };

    if (location.isTab) {
        uni.switchTab(params);
    }

    if (location.reLaunch) {
        uni.reLaunch(params);
    }

    uni.navigateTo(params);
}

function replace(location, complete, fail, success) {
    const url = parseUrl(location);
    const params = {
        url,
        complete,
        fail,
        success
    };
    uni.redirectTo(params);
}

function go(delta) {
    uni.navigateBack(delta);
}

function back() {
    uni.navigateBack();
}

function parseRoute($mp) {
    const _$mp = $mp || {};
    const path = _$mp.page && _$mp.page.route;
    return {
        page: `/${path}`,
        params: {},
        query: _$mp.query,
        hash: '',
        fullPath: parseUrl({
            path: `/${path}`,
            query: _$mp.query
        }),
        name: path && path.replace(/\/(\w)/g, ($0, $1) => $1.toUpperCase())
    };
}

let _Vue;
var index = {
    install(Vue) {
        if (this.installed && _Vue === Vue) {
            return;
        }

        // 判断是否已经有$router安装了
        if (Vue.prototype.hasOwnProperty('$router')) {
            return;
        }
        this.installed = true;
        _Vue = Vue;
        const _router = {
            mode: 'history',
            push,
            replace,
            go,
            back
        };

        Vue.mixin({
            onLoad() {
                const {
                    $mp
                } = this.$root;
                this._route = parseRoute($mp);
            },
            onShow() {
                _router.app = this;
                _router.currentRoute = this._route;
            }
        });

        Object.defineProperty(Vue.prototype, '$router', {
            get() {
                return _router;
            }
        });

        Object.defineProperty(Vue.prototype, '$route', {
            get() {
                return this._route;
            }
        });
    }

};

export default index;
export { _Vue };
