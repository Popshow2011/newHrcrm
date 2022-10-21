import { getController, postController } from '@/controllers/request';
import { MODULE, ACTION } from '@/utils/constants';

export default {
  namespaced: true,
  state: {
    fields: {},
    messengerKey: 0,
    vacancyData: [],
    vacancyForWindow: null,
    customPopupFields: [],
    selectedStage: null,
    deletedVacancy: null,
    visible: {
      tagForm: false
    },
    importButtonVisible: false,
    updateContactsKey: 0,
    blockedApplyVacancies: false,
    meetings: [],
    selectedMeeting: null,
    questionnaireData: {}
  },
  getters: {
    getSelectedStage: state => state.selectedStage
  },
  mutations: {
    setImportButtonVisible(state, visible) {
      state.importButtonVisible = visible;
    },
    setParam(state, { name, val, param }) {
      if (param) {
        state[name][param] = val;
      } else {
        state[name] = val;
      }
    },
    setSelectedStage(state, stage) {
      state.selectedStage = stage || null;
    },
    setFields(state, data) {
      state.fields = { ...data };
    },
    setFieldParam(state, { variable, param, value }) {
      if (state[variable]) {
        state[variable][param] = value;
      }
    },
    setVisibleElem(state, { elem, visible }) {
      state.visible[elem] = visible;
    },
    updateMessengerKey(state) {
      state.messengerKey = state.messengerKey + 1;
    },
    setVacancyData(state, data = []) {
      state.vacancyData = [...data];
    },
    setVacancyForWindow(state, { data, dialog }) {
      state.vacancyForWindow = { ...data, dialog };
      this.state.common.visible_dialog[dialog] = true;
    },
    setCustomPopupFields(state, data) {
      state.customPopupFields = data;
    },
    setDeletedVacancy(state, data = null) {
      state.deletedVacancy = data;

      if (data) {
        this.state.common.visible_dialog.relation_dialog = true;
      }
    },
    updateContacts(state) {
      state.updateContactsKey++;
    },
    blockApplyVacancies(state, data) {
      state.blockedApplyVacancies = data;
    },
    setSelectedMeeting(state, data = null) {
      state.selectedMeeting = data;
    }
  },
  actions: {
    async loadImportButtonVisible({ commit }) {
      try {
        const resp = await getController({
          params: {
            module: 'HRPAC_CANDIDATES',
            action: 'import_button'
          }
        });
        commit('setImportButtonVisible', resp.data.data);
      } catch (error) {
        console.error(error);
      }
    },

    async loadCustomPopupFields({ commit }, { id_vacancy, id_candidate }) {
      const request = await getController({
        params: {
          module: 'HRPAC_CUSTOM_POPUP',
          action: ACTION.GET_MODULE_FIELDS,
          id_vacancy,
          id_candidate
        }
      });

      const data = await request.data
        .filter(field => {
          switch (field.name) {
            case 'id_candidate':
              return false;
            case 'id_vacancy':
              return false;
            default:
              return true;
          }
        })
        .map(field => {
          if (!field.options) return field;
          else {
            const options = [];

            Object.keys(field.options).forEach((option, id) => {
              options.push({
                key: option,
                value: Object.values(field.options)[id]
              });
            });

            return {
              ...field,
              options
            };
          }
        });

      commit('setCustomPopupFields', data);
    },
    async saveCustomPopupFields({ state }, { id_vacancy, params }) {
      const options = new FormData();

      options.append('module', 'HRPAC_CUSTOM_POPUP');
      options.append('action', 'save');
      options.append('id_vacancy', id_vacancy);
      options.append('id_candidate', state.selectedStage.candidates_id);
      options.append('jsqon_return', 1);

      Object.keys(params).forEach((key, id) => {
        options.append(key, Object.values(params)[id]);
      });

      const request = await postController({ options });

      return await request.data;
    },
    async getFields({ state }, { fields }) {
      // экшн получения нужных полей по кандидатам
      const formData = new FormData();
      formData.append('module', MODULE.CANDIDATES_MODULE);
      formData.append('action', ACTION.GET_MODULE_FIELDS);
      formData.append('id', state.fields.id.value);
      formData.append('to_pdf', true);

      if (fields && Array.isArray(fields)) {
        fields.forEach(name => formData.append('fields[]', name));
      }

      const request = await postController({ options: formData });
      return await request.data;
    },
    async saveCorporateMailForm(ctx, email) {
      let communications = ctx.state.fields.communications.value;

      communications = communications.map(c => {
        return {
          ...c,
          sort: +c.sort + 1
        };
      });

      communications.unshift({
        htmlType: 'email',
        id: Date.now(),
        label: 'Почта',
        sort: '0',
        value: email,
        value_type: 'email'
      });

      const options = new FormData();

      options.append('module', MODULE.CANDIDATES_MODULE);
      options.append('record', ctx.state.fields.id.value);
      options.append('action', 'save');
      options.append('jsqon_return', '1');

      communications.forEach((communication, index) => {
        Object.keys(communication).forEach((c, i) => {
          options.append(
            `communications[${index}][${c}]`,
            Object.values(communication)[i]
          );
        });
      });

      try {
        await postController({
          options,
          params: {
            header: {
              'Content-Type': 'multipart/form-data'
            }
          }
        });
      } catch (e) {
        console.error(e);
      }
    },
    async getMeetings({ state, dispatch }) {
      try {
        const resp = await getController({
          params: {
            module: MODULE.CANDIDATES_MODULE,
            action: ACTION.GET_SUBPANEL_JSON_DATA,
            subpanel: 'hrpac_candidate_hrpac_event_link',
            record: state.fields.id.value,
            to_pdf: 1,
            advanced_filter: 'date_start ASC, date_entered ASC'
          }
        });
        state.meetings = resp.data.List;

        if (resp.data.error) {
          const errorText =
            resp.data.error == 'you do not have rights'
              ? 'Нет прав на просмотр списка ближайших событий'
              : resp.data.error;
          dispatch(
            'common/catchError',
            {
              err: resp.data.error,
              msg: errorText,
              action: 'get events list'
            },
            { root: true }
          );
        }
        return state.meetings;
      } catch (e) {
        console.error(e);
      }
    },
    async removeMeeting({ state, dispatch }, id) {
      const formData = new FormData();
      const params = {
        module: MODULE.HRPAC_EVENT,
        action: 'CancelEvent',
        event_id: id,
        to_pdf: 1
      };

      for (let key in params) {
        formData.set(key, params[key]);
      }

      try {
        const resp = await postController({ options: formData });
        if (resp.data?.data?.result) {
          state.meetings = state.meetings.filter(el => el.id.value !== id);
        } else {
          dispatch(
            'common/catchError',
            {
              err: resp.data.error,
              msg: resp.data.error,
              action: 'delete meeting'
            },
            { root: true }
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
};
