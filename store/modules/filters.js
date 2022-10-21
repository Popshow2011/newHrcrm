export default {
  namespaced: true,
  state: {
    filterConfig: {},
    customFilters: {}
  },
  mutations: {
    setFiltersConfig(state, config) {
      state.filterConfig = config;
    },
    setCustomFilter(state, { filter, val }) {
      state.customFilters[filter] = val;
    },
    resetCustomFilters(state) {
      for (let key in state.customFilters) {
        state.customFilters[key] = '0';
      }
    }
  }
};
