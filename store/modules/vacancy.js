import { getController, postController } from '@/controllers/request';
import { MODULE, ACTION } from '@/utils/constants';

export default {
  namespaced: true,
  state: {
    fields: {},
    roleStatus: {},
    stages: [],
    selectedStage: null,
    activityDate: '',
    inviteAndRefuseText: {}
  },
  mutations: {
    setRoleStatus(state, status) {
      state.roleStatus = status;
    },
    setParam(state, { name, val, param }) {
      if (param) {
        state[name][param] = val;
      } else {
        state[name] = val;
      }
    },
    setProgressbar(state, val) {
      state['fields']['progresbar']['value'] = val;
    },
    setFields(state, data) {
      state.fields = { ...data };
    },
    setFieldParam(state, { variable, param, value }) {
      if (state[variable]) {
        state[variable][param] = value;
      }
    },
    setInviteRefuseText(state, data) {
      state.inviteAndRefuseText = data;
    }
  },
  actions: {
    async getACLStatus({ commit }, { id }) {
      try {
        const { data } = await getController({
          params: {
            module: 'HRPAC_VACANCY',
            action: ACTION.GET_FIELDS_MODULE_CHECK_ACL,
            id: id,
            fields: ['status_id'],
            jsqon_return: 1,
            to_pdf: true
          }
        });
        commit('setRoleStatus', data[0]);
      } catch (error) {
        console.error(error);
      }
    },
    async getFields({ state }, { fields }) {
      // экшн получения нужных полей по кандидатам
      const formData = new FormData();
      formData.append('module', MODULE.VACANCY_MODULE);
      formData.append('action', ACTION.GET_MODULE_FIELDS);
      formData.append('id', state.fields.id.value);
      formData.append('to_pdf', true);

      if (fields && Array.isArray(fields)) {
        fields.forEach(name => formData.append('fields[]', name));
      }

      const request = await postController({ options: formData });
      return await request.data;
    },
    async getUserInviteAndRefuseText({ commit }, userId) {
      try {
        const data = await getController({
          params: {
            module: 'Users',
            action: ACTION.GET_MODULE_FIELDS,
            id: userId,
            fields: ['response_invite_text', 'response_refuse_text'],
            jsqon_return: 1,
            to_pdf: true
          }
        });
        commit('setInviteRefuseText', {
          invite: data.data[0].value,
          refuse: data.data[1].value
        });
      } catch (err) {
        console.error(err);
      }
    }
  }
};
