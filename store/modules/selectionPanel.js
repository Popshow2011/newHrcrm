import { getController, postController } from '@/controllers/request';
import { store } from '../index';

export default {
  namespaced: true,
  state: {
    activeCandidate: 0,
    activeResponse: 0,
    activeVacancy: null,
    responseMode: false,
    totalCandidates: 0,
    candidates: [],
    vacancies: [],
    stages: [],
    showResponses: false,
    responses: [],
    responseCount: 0,
    loadingCandidates: true,
    sortingMethod: 'ASC',
    filteredVacancies: null,
    respondsCount: 0
  },
  mutations: {
    initializeVacancies(state, val) {
      state.vacancies = val;
    },
    initializeCandidates(state, val) {
      state.candidates = val;
    },
    initializeStages(state, val) {
      state.stages = val;
    },
    initializeResponses(state, val) {
      state.responses = val;
    },
    setShowResponses(state, val) {
      state.showResponses = val;
    },
    addCandidate(state, { ...params }) {
      const { metadata: metaData = {}, bean = {}, loadedTabs = {} } = params;
      state.candidates = [
        ...state.candidates,
        {
          comments: [],
          metaData,
          loadingStage: false,
          hasNoRights: false,
          commentFormActive: false,
          commentToDelete: null,
          resizeValue: 0,
          loadedTabs,
          tabKey: {},
          activeSubpanel: {},
          subpanels: [],
          fields: { ...bean }
        }
      ];
    },
    addResponse(state, val) {
      state.responses.push(val);
    },
    setResponseMode(state, val) {
      state.responseMode = val;
    },
    setResponseCount(state, val) {
      state.responseCount = val;
    },
    setRespondsCount(state, val) {
      state.respondsCount = val;
    },
    setStage(state, val) {
      state.candidates[state.activeCandidate].fields.stage = val;
    },
    setMetaData(state, val) {
      state.candidates[state.activeCandidate].metaData = val;
    },
    setActiveCard(state, { count = 0, mode = '' }) {
      if (mode == 'candidate') {
        state.activeCandidate = count;
      } else {
        state.activeResponse = count;
      }
    },
    setActiveVacancy(state, val) {
      state.activeVacancy = val;
    },
    setSubpanels(state, val) {
      state.candidates[state.activeCandidate] = val;
    },
    setComments(state, comments) {
      state.candidates[state.activeCandidate].comments = comments;
    },
    setRights(state, val) {
      state.candidates[state.activeCandidate].hasNoRights = val;
    },
    setCommentForm(state, val) {
      state.candidates[state.activeCandidate].commentFormActive = val;
    },
    setCommentToDelete(state, comment) {
      state.candidates[state.activeCandidate].commentToDelete = comment;
    },
    setResizeSidebarValue(state, data) {
      state.resizeValue = data;
    },
    setLoadedTabs(state, { tab, loaded, mode = '' }) {
      const module = mode == 'candidate' ? 'candidates' : 'responses';
      const param = mode == 'candidate' ? 'activeCandidate' : 'activeResponse';
      state[module][state[param]].loadedTabs[tab] = loaded;
    },
    setActiveSubpanel(state, { data = {}, mode = '' }) {
      const module = mode == 'candidate' ? 'candidates' : 'responses';
      const param = mode == 'candidate' ? 'activeCandidate' : 'activeResponse';
      state[module][state[param]].activeSubpanel = data;

      if (!state[module][state[param]].tabKey.hasOwnProperty(data.id)) {
        state[module][state[param]].tabKey[data.id] = 0;
      }
    },
    updateActiveSubpanel(state, { id, mode = '' }) {
      const module = mode == 'candidate' ? 'candidates' : 'responses';
      const param = mode == 'candidate' ? 'activeCandidate' : 'activeResponse';
      if (id) {
        state[module][state[param]].tabKey = {
          ...state[module][state[param]].tabKey,
          [id]: +state[module][state[param]].tabKey[id] + 1
        };
      } else {
        for (let key in state[module][state[param]].tabKey) {
          state[module][state[param]].tabKey = {
            ...state[module][state[param]].tabKey,
            [key]: +state[module][state[param]].tabKey[key] + 1
          };
        }
      }
    },
    setLoadingCandidates(state, val) {
      state.loadingCandidates = val;
    },
    setTotalCandidates(state, val) {
      state.totalCandidates = val;
    },
    setLoadingStage(state, val) {
      state.candidates[state.activeCandidate].loadingStage = val;
    },
    switchSortingMethod(state) {
      state.sortingMethod = state.sortingMethod === 'ASC' ? 'DESC' : 'ASC';
    },
    setFilteredVacancies(state, val) {
      state.filteredVacancies = val;
    },
    sortVacancies(state, fieldVal) {
      const sortTextValsASC = (a, b, field) => {
        if (a[field] && b[field]) {
          if (a[field].toLowerCase() > b[field].toLowerCase()) return 1;
          else if (a[field].toLowerCase() === b[field].toLowerCase()) return 0;
          else return -1;
        } else {
          if (!a[field] && !b[field]) return 0;
          else if (!a[field]) return 1;
          else return -1;
        }
      };

      const sortTextValsDESC = (a, b, field) => {
        if (a[field] && b[field]) {
          if (a[field].toLowerCase() < b[field].toLowerCase()) return 1;
          else if (a[field].toLowerCase() === b[field].toLowerCase()) return 0;
          else return -1;
        } else {
          if (!a[field] && !b[field]) return -1;
          else if (!a[field]) return 1;
          else return 0;
        }
      };

      const sortByTextFields = vacanciesToFilter =>
        vacanciesToFilter.sort((a, b) =>
          sortVals(a, b, fieldVal, state.sortingMethod)
        );

      const sortByUserVacancies = vacanciesToFilter => {
        const userId = store.state.common.config.userId;
        let userOwnVacancies = [];
        let userAdditionalVacancies = [];
        let otherVacancies = [];

        vacanciesToFilter.forEach(vacancy => {
          if (Object.keys(vacancy.assigned_user_id).includes(userId)) {
            userOwnVacancies.push(vacancy);
          } else if (
            Object.keys(vacancy.additional_assigned_ids).includes(userId)
          ) {
            userAdditionalVacancies.push(vacancy);
          } else {
            otherVacancies.push(vacancy);
          }
        });

        return [
          ...userOwnVacancies.sort((a, b) =>
            sortVals(a, b, 'name_id', state.sortingMethod)
          ),
          ...userAdditionalVacancies.sort((a, b) =>
            sortVals(a, b, 'name_id', state.sortingMethod)
          ),
          ...otherVacancies.sort((a, b) =>
            sortVals(a, b, 'name_id', state.sortingMethod)
          )
        ];
      };

      const sortVals = (a, b, field, method) =>
        method === 'ASC'
          ? sortTextValsASC(a, b, field)
          : sortTextValsDESC(a, b, field);

      let vacanciesToFilter =
        !state.filteredVacancies || !state.filteredVacancies.length
          ? state.vacancies
          : state.filteredVacancies;

      state.filteredVacancies =
        fieldVal !== 'my_vacancy'
          ? sortByTextFields(vacanciesToFilter)
          : sortByUserVacancies(vacanciesToFilter);
    }
  },
  actions: {
    async loadComments({ commit }, { params }) {
      try {
        const request = await getController({ params });
        const data = await request.data;

        if (!data.error) {
          const comments = await data.List.map(comment => {
            return {
              id: comment.id.value,
              user_id: comment.created_by.value,
              name: comment.created_by_name.value,
              date_entered: comment.date_entered.value,
              text: comment.text.value,
              to_recruits: comment.to_recruits.value
            };
          });
          commit('setComments', comments);
        } else {
          commit('setRights', true);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async saveComment(ctx, { options }) {
      await postController({ options });
    },
    async confirmDeleteComment(ctx, { options }) {
      await postController({ options });
    }
  }
};
