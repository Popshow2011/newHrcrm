export default {
  namespaced: true,
  state: {
    actions: null,
    stages: [],
    showSelection: false,
    candidates: [],
    selectedCandidates: [],
    newStageId: '',
    stageName: '',
    loading: false
  },
  mutations: {
    setLoading(state, value) {
      state.loading = value;
    },
    setCandidates(state, candidates) {
      state.candidates = candidates;
    },
    setActions(state, actions) {
      state.actions = actions;
    },
    setStages(state, stages) {
      state.stages = stages;
    },
    setStageName(state, name) {
      state.stageName = name;
    },
    setNewStage(state, newStageId) {
      state.newStageId = newStageId;
    },
    clearSelectedCandidates(state) {
      state.selectedCandidates = [];
    },
    selectCandidate(state, { replace = false, arr }) {
      if (replace) state.selectedCandidates = arr;
      else state.selectedCandidates.push(...arr);
    },
    selectAllCandidates(state) {
      state.selectedCandidates = state.candidates.map(
        candidate => candidate.id
      );
    },
    setSelection(state, value) {
      state.showSelection = value;
    }
  },
  actions: {}
};
