import { MODULE, ACTION } from '@/utils/constants';
import { getController, postController } from '@/controllers/request';
export default {
  namespaced: true,
  state: {
    fields: {},
    form: {},
    bot_mailings_id: '',
    bot_script_id: '',
    stages: [],
    stageCandidates: [],
    activeCandidate: null,
    loadingMessages: false,
    activeCandidateMessages: [],
    loadIteration: 0,
    sortMethod: 'ASC',
    selectedStage: null,
    updateAuditoryKey: 0,
    conflictCandidates: [],
    auditory: [],
    auditoryLoaded: false,
    auditoryLoadingIteration: 0
  },
  getters: {
    hasRequiredFields: state => {
      const requiredFormData = state.form && !state.form.name;
      const activeRequiredFormData =
        state.form &&
        (!state.form.bot_auditory_id || !state.form.bot_script_id);

      return state.form.status == 'active'
        ? requiredFormData || activeRequiredFormData
        : requiredFormData;
    }
  },
  mutations: {
    setParam(state, { name, val, param }) {
      if (param) {
        state[name][param] = val;
      } else {
        state[name] = val;
      }
    },
    setSortMethod(state) {
      state.sortMethod == 'ASC'
        ? (state.sortMethod = 'DESC')
        : (state.sortMethod = 'ASC');
    },
    setFields(state, data) {
      state.fields = { ...data };
    },
    updateFields(state, data) {
      state.fields = { ...state.fields, ...data };
    },
    updateForm(state, data = {}) {
      state.form = { ...state.form, ...data };

      for (let key in data) {
        state.fields[key].value = data[key];
      }
    },
    updateAuditory(state) {
      state.updateAuditoryKey += 1;
    },
    setConflictCandidates(state, payload) {
      const arr = [];

      Object.keys(payload).forEach((id, index) => {
        arr.push({
          name: Object.values(payload)[index],
          id
        });
      });

      state.conflictCandidates = arr;
    },
    setAuditory(state, { entries, replace = false }) {
      if (replace) {
        state.auditory = entries;
      } else {
        state.auditory.push(...entries);
      }
    },
    setAuditoryLoading(state, value) {
      state.auditoryLoaded = value;
    },
    setAuditoryIteration(state, { value, replace = false }) {
      if (replace) {
        state.auditoryLoadingIteration = value;
      } else {
        state.auditoryLoadingIteration = state.auditoryLoadingIteration + value;
      }
    }
  },
  actions: {
    async getFields({ state }, { fields = [] }) {
      const formData = new FormData();

      formData.append('module', MODULE.BOT_MAILINGS);
      formData.append('action', ACTION.GET_MODULE_FIELDS);
      formData.append('id', state.fields.id.value);
      formData.append('to_pdf', true);

      if (fields && Array.isArray(fields)) {
        fields.forEach(name => formData.append('fields[]', name));
      }

      const request = await postController({ options: formData });
      return await request.data;
    },
    async removeCandidate({ state, commit, dispatch }, id) {
      try {
        await getController({
          params: {
            module: MODULE.BOT_AUDITORY,
            action: 'DeleteRelationship',
            record: state.fields.bot_auditory_id.value,
            linked_field: 'candidates',
            linked_id: id,
            refresh_page: 0,
            return_url: location.href,
            to_pdf: true
          }
        });

        commit('updateAuditory');
      } catch (error) {
        dispatch(
          'common/catchError',
          {
            error,
            msg: 'Возникла ошибка при удалении кандидата из аудитории',
            action: MODULE.BOT_AUDITORY
          },
          { root: true }
        );
      }
    },
    async updateReceiversCount({ commit, state }, auditoryId) {
      if (auditoryId && state.form.bot_auditory_id !== auditoryId) {
        commit('updateForm', { bot_auditory_id: auditoryId });
      }

      try {
        const response = await getController({
          params: {
            module: MODULE.BOT_AUDITORY,
            action: 'getAuditoryCandidatesCount',
            bot_auditory_id: auditoryId || state.form.bot_auditory_id,
            to_pdf: true
          }
        });

        if (response.data && !response.data.errors) {
          commit('updateFields', {
            receivers_count: {
              ...state.fields.receivers_count,
              value: response.data.count
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async deleteMailings(ctx, id) {
      try {
        await getController({
          params: {
            module: MODULE.BOT_MAILINGS,
            action: ACTION.DELETE,
            record: id,
            jsqon_return: 1,
            to_pdf: true
          }
        });

        location.reload();
      } catch (error) {
        console.error(error);
      }
    },
    async deleteAuditory({ state }) {
      try {
        await getController({
          params: {
            module: MODULE.BOT_MAILINGS,
            action: 'candidatesFromAuditoryDelete',
            bot_auditory_id: state.form.bot_auditory_id,
            to_pdf: true
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
    async loadAuditoryEntries({ commit, state, dispatch }) {
      try {
        const response = await getController({
          params: {
            module: MODULE.BOT_AUDITORY,
            action: ACTION.GET_AUDITORY_LIST,
            bot_auditory_id: state.form.bot_auditory_id,
            bot_mailings_id: state.fields.id.value,
            start_position: 0,
            to_pdf: true
          }
        });

        if (!response.data.error) {
          const entries = response.data.data;

          commit('setAuditoryIteration', { value: response.data.iteration });
          commit('setAuditory', { entries, replace: true });
        }
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при загрузке аудитории',
            action: ACTION.GET_AUDITORY_LIST
          },
          { root: true }
        );
      }
    },
    async loadMoreAuditoryEntries({ commit, state, dispatch }) {
      try {
        const response = await getController({
          params: {
            module: MODULE.BOT_AUDITORY,
            action: ACTION.GET_AUDITORY_LIST,
            bot_auditory_id: state.form.bot_auditory_id,
            bot_mailings_id: state.fields.id.value,
            start_position: state.auditoryLoadingIteration,
            to_pdf: true
          }
        });

        if (!response.data.error) {
          if (response.data.data.length === 0) {
            commit('setAuditoryLoading', true);
          }
          const entries = response.data.data;

          commit('setAuditoryIteration', { value: response.data.iteration });
          commit('setAuditory', { entries, replace: false });
        }
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при загрузке аудитории',
            action: ACTION.GET_AUDITORY_LIST
          },
          { root: true }
        );
      }
    },
    async saveMailing(
      { state, commit, dispatch },
      { status = null, redirectToScenario = false }
    ) {
      try {
        const status_mailing = status ? status : state.form.status;
        const formData = new FormData();

        const params = {
          module: MODULE.BOT_MAILINGS,
          action: 'MailingsSave',
          auditory: state.form.bot_auditory_id,
          script: state.form.bot_script_id,
          record: state.fields.id.value,
          vacancy: state.form.hrpac_vacancy_id_c,
          name_mailing: state.form.name,
          status_mailing,
          communication_channel_mailing: state.form.communication_channel,
          waiting_time_mailing: state.form.waiting_time,
          to_pdf: true
        };

        for (let key in params) {
          formData.set(key, params[key]);
        }

        const response = await postController({ options: formData });

        if (
          response.data.error &&
          response.data.candidates &&
          status_mailing === 'active'
        ) {
          commit(
            'common/setVisibleDialog',
            { name: 'mailings_conflict_dialog', val: true },
            { root: true }
          );

          commit('setConflictCandidates', response.data.candidates);
        }

        if (response.data.success) {
          dispatch(
            'common/successMessage',
            {
              msg: response.data.success
            },
            { root: true }
          );

          if (redirectToScenario) {
            location.href = `index.php?module=BOT_SCRIPT&action=EditView&return_module=${response.data.mailings}`;
          } else {
            location.href = `index.php?module=BOT_MAILINGS&action=index`;
          }
        }
      } catch (err) {
        dispatch(
          'common/catchError',
          {
            err,
            msg: 'Возникла ошибка при сохранении рассылки',
            action: 'mailing save'
          },
          { root: true }
        );
      }
    },
    async getActiveCandidateMessages({ state }) {
      state.activeCandidateMessages = [];
      state.loadingMessages = true;
      try {
        const params = {
          module: MODULE.BOT_COMMUNICATION,
          action: 'getCandidateCommunication',
          bot_mailings_id: state.bot_mailings_id,
          bot_script_id: state.bot_script_id,
          hrpac_candidates_id: state.activeCandidate.id,
          to_pdf: true
        };
        const resp = await getController({ params });
        state.activeCandidateMessages =
          resp.data && resp.data['data'] ? resp.data['data'] : [];
      } catch (error) {
        console.error(error);
      } finally {
        state.loadingMessages = false;
      }
    }
  }
};
