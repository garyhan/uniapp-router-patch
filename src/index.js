/**
 * Created by gary on 2019-06-12.
 */
import {
    stringify
} from './queryString'


function parseUrl(location) {
    if (typeof location === 'string') return location
    const {
        path,
        query
    } = location

    const queryStr = stringify(query)

    if (queryStr) return path

    return `${path}?${queryStr}`
}

function push(location, complete, fail, success) {
    const url = parseUrl(location)

    const params = {
        url,
        complete,
        fail,
        success
    }

    if (location.isTab) {
        uni.switchTab(params)
    }

    if (location.reLaunch) {
        uni.reLaunch(params)
    }

    uni.navigateTo(params)
}

function replace(location, complete, fail, success) {
    const url = parseUrl(location)
    uni.redirectTo(url)
}

function go(delta) {
    uni.navigateBack(delta)
}

function back() {
    uni.navigateBack()
}

function parseRoute($mp) {
    const _$mp = $mp || {}
    const path = _$mp.page && _$mp.page.route
    return {
        page: `/${path}`,
        params: {},
        query: _$mp.query,
        hash: '',
        fullPath: parseUrl({
            path: `/${path}`,
            query: _$mp.query,
        }),
        name: path && path.replace(/\/(\w)/g, ($0, $1) => $1.toUpperCase())
    }
}

export let _Vue
export default {
    install(Vue) {
        if (this.installed && _Vue === Vue) {
            return
        }

        // 判断是否已经有$router安装了
        if (Vue.prototype.hasOwnProperty('$router')) {
            return
        }
        this.installed = true
        _Vue = Vue
        const _router = {
            mode: 'history',
            push,
            replace,
            go,
            back
        }

        Vue.mixin({
            onLoad() {
                const {
                    $mp
                } = this.$root
                this._route = parseRoute($mp)
            },
            onShow() {
                _router.app = this
                _router.currentRoute = this._route
            }
        })

        Object.defineProperty(Vue.prototype, '$router', {
            get() {
                return _router
            }
        })

        Object.defineProperty(Vue.prototype, '$route', {
            get() {
                return this._route
            }
        })
    }

}