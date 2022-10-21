import { postController } from '@/controllers/request';
import { getTableData } from '@/utils/helpers';

export default {
  namespaced: true,
  state: {
    attachingCandidates: false,
    popupList: [],
    popupPageConfig: {},
    metadataFields: [],
    baseParams: {}
  },
  mutations: {
    popupPageConfig(state, config) {
      state.popupPageConfig = config;
    },
    setBaseParams(state, params = {}) {
      state.baseParams = params;
    },
    setAttachingCandidates(state, value) {
      state.attachingCandidates = value;
    },
    setPopupData(state, { data, sugarconfig, mod, replace }) {
      if (replace) state.popupList = getTableData(data, sugarconfig, mod);
      else state.popupList.push(...getTableData(data, sugarconfig, mod));
    },
    setMetadataFields(state, sugarconfig = {}) {
      state.metadataFields = Object.values(sugarconfig)
        .filter(
          param =>
            param.hasOwnProperty('metadata_sort') &&
            !param.hasOwnProperty('visibility') &&
            param.visibility !== 'hidden'
        )
        .sort((a, b) => a.metadata_sort - b.metadata_sort)
        .map(({ name }) => name.toLowerCase());
    }
  },
  actions: {
    async loadPopupData(
      { commit, rootState },
      { params, /*updateFilterParams = true,*/ replace = true }
    ) {
      const formData = new FormData();
      params = { ...params, ...rootState.filters.filters };
      for (let key in params) {
        if (Array.isArray(params[key])) {
          params[key].forEach(val => formData.append(key + '[]', val));
        } else {
          formData.set(key, params[key]);
        }
      }
      try {
        const request = await postController({
          options: formData,
          params: {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data'
            },
            params: {
              module: params.search_module || params.module,
              action: params.action
            }
          }
        });

        if (!request.data || typeof request.data == 'string') {
          window.location.reload();
          return;
        }

        commit('setPopupData', {
          data: Object.values(request.data.data.data),
          sugarconfig: request.data.sugarconfig,
          mod: request.data.mod_strings,
          // module: request.data.data.pageData.queries.baseURL.module,
          replace
        });
        commit('setMetadataFields', request.data.sugarconfig);
        commit('popupPageConfig', request.data.data.pageData);
        commit('filters/setFiltersConfig', request.data.custom_search, {
          root: true
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
