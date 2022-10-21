import { getController, postController } from '@/controllers/request';
import { MODULE, ACTION } from '@/utils/constants';

export default {
  namespaced: true,
  state: {
    fields: {},
    respondData: [],
    responds_stage_condidates_count: null,
    respond_subpanel_display: null,
    allResponds: [],
    loading: false,
    lastResponsePage: false
  },
  mutations: {
    setFields(state, data) {
      state.fields = { ...data };
    },
    setRespondSubpanelDisplay(state, data) {
      state.respond_subpanel_display = data;
    },
    setRespondData(state, data = []) {
      state.respondData = [...data];
    },
    setRespondsCount(state, count) {
      state.responds_stage_condidates_count = count;
    },
    setAllResponds(state, data) {
      state.allResponds.push(...data);
    },
    setLoading(state, loading) {
      state.loading = loading;
    }
  },
  actions: {
    showAuthForm({ rootState }) {
      rootState.publicator.importData = { work_site: 'hh' };
      rootState.common.visible_dialog.publicator_auth_dialog = true;
    },
    async getRespondsPage({ state, commit, rootState }, { id, page }) {
      if (state.lastResponsePage) return;
      try {
        commit('setLoading', true);
        const data = await getController({
          params: {
            module: MODULE.CANDIDATE_RESPONDS,
            action: 'getRespondsListByVacancy',
            to_pdf: true,
            vacancy_id: id,
            count: rootState.common.config.maxEntriesLimit,
            iteration: page
          }
        });
        const { respond_subpanel_display, responds } = data.data;
        state.lastResponsePage =
          responds.length < rootState.common.config.maxEntriesLimit;
        if (responds) commit('setAllResponds', responds);
        commit('setRespondSubpanelDisplay', respond_subpanel_display);
        commit('setLoading', false);
      } catch (err) {
        console.log(err);
      }
    },
    async getFields({ state }, { fields }) {
      // экшн получения нужных полей по кандидатам
      try {
        const formData = new FormData();
        formData.append('module', MODULE.CANDIDATE_RESPONDS);
        formData.append('action', ACTION.GET_MODULE_FIELDS);
        formData.append('id', state.fields.id.value);
        formData.append('to_pdf', true);

        if (fields && Array.isArray(fields)) {
          fields.forEach(name => formData.append('fields[]', name));
        }

        const request = await postController({ options: formData });
        return await request.data;
      } catch (error) {
        console.error(error);
      }
    },
    async acceptRespond({ dispatch }, id) {
      try {
        const options = new FormData();

        options.append('module', MODULE.CANDIDATE_RESPONDS);
        options.append('action', 'convertResponseIntoCandidate');
        options.append('response_id', id);
        options.append('to_pdf', true);

        const response = await postController({ options });

        if (response.data.error && response.data.code == 403) {
          dispatch('showAuthForm');
        } else location.reload();
      } catch (err) {
        console.error(err);
        dispatch('showAuthForm');
      }
    },
    async rejectRespond({ dispatch }, id) {
      try {
        const options = new FormData();

        options.append('module', MODULE.CANDIDATE_RESPONDS);
        options.append('action', 'rejectResponse');
        options.append('response_id', id);
        options.append('to_pdf', true);

        const response = await postController({ options });

        if (response.data.error && response.data.code == 403) {
          dispatch('showAuthForm');
        } else location.reload();
      } catch (err) {
        console.error(err);
        dispatch('showAuthForm');
      }
    }
  }
};
