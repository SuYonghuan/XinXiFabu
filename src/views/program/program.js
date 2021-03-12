import { cPost } from '../../http/http'
import store from '../../store'

const base = store.state.config.url
export class MaterialApi {
    static async get() {
        return cPost(`${base}`)
    }
    static async post() {
        return cPost(`${base}`)
    }
    static async put() {
        return cPost(`${base}`)
    }
    static async delete() {
        return cPost(`${base}`)
    }
}