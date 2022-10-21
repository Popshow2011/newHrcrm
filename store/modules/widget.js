export default {
  namespaced: true,
  state: {
    LastActions: {},
    SavedFilters: {},
    WebPage: {},
    QuickActions: {},
    widget: {}
  },

  mutations: {
    setOpenWidget(state, { widgetName, val }) {
      state.widget[widgetName] = val;
    },
    setOpenBlock(state, payload) {
      state.vacancyItem = payload;
    }
  }
};
