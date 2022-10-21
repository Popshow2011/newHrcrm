export default {
  namespaced: true,
  state: {
    fields: {}
  },
  mutations: {
    setParam(state, { name, val, param }) {
      if (param) {
        state[name][param] = val;
      } else {
        state[name] = val;
      }
    },
    setFields(state, data) {
      state.fields = { ...data };
    }
  },
  actions: {}
};
