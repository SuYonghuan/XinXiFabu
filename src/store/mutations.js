import * as types from './mutation-types'

const mutations = {
  [types.SET_USER](state, user) {
    state.user = user
  },
  [types.SET_CONFIG](state, config) {
    state.config = config
  },
  [types.SET_MENUS](state, menus) {
    state.menus = menus
  },
  [types.SET_PRESENT_MENUS](state, presentMenu) {
    state.presentMenu = presentMenu
  },
  [types.SET_WEBSITE](state, website) {
    state.website = website
  }
}

export default mutations
