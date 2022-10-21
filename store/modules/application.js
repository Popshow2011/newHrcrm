export default {
  namespaced: true,
  state: {
    fields: {},
    stageList: [],
    popup_type: '', // popup type для application dialog
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
      state.fields = data;
    },
    setPopupType(state, type) {
      state.popup_type = type;
    },
    setStages(state, stages) {
      state.stageList = stages;
    }
  },
  actions: {}
};
