import * as types from './mutation-types'

export const delUser = ({ commit }) => {
  commit(types.SET_USER, {})
}

export const setConfig = function({ commit }, data) {
  commit(types.SET_CONFIG, data)
}
