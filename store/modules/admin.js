import { getController } from '@/controllers/request';
import { formatHtml } from '@/utils/helpers';
export default {
  namespaced: true,
  state: {
    fields: {},
    messages: [],
    stages: [],
    reminders: [],
    offsets: {}
  },

  mutations: {
    filterStages(state, arr) {
      state.stages = [...state.stages, ...arr]
        .sort((a, b) => a.SORT - b.SORT)
        .map((item, INDEX) => ({ ...item, INDEX }));
    },
    setOffset(state, offset) {
      state.offsets = offset;
    },
    clearData(state, par) {
      if (par == 'messages') {
        state.messages = [];
      } else if (par == 'reminders') {
        state.reminders = [];
      } else if (par == 'stages') {
        state.stages = [];
      }
    },
    setMessages(state, { data, type }) {
      const param = type == 'reanswer_message' ? 'messages' : 'reminders';
      state[param] = [...state[param], ...data].map((item, INDEX) => ({
        ...item,
        INDEX
      }));
    }
  },
  actions: {
    getMessageData({ commit }, { params, type }) {
      getController({
        url: `index.php?module=BOT_MESSAGES&action=get_listView&to_pdf=1&filters[type_message]=${type}`,
        params
      })
        .then(resp => {
          const messages = resp.data.data.map(item => ({
            ...item,
            NAME: formatHtml(item.NAME),
            DESCRIPTION: formatHtml(item.DESCRIPTION)
          }));

          commit('setMessages', {
            data: messages,
            type
          });
          commit('setOffset', resp.data.pageData.offsets);
        })
        .catch(err => this.catchError(err, 'Возникла ошибка получения данных'));
    },
    getStagesData({ commit }, params = {}) {
      getController({
        url: 'index.php?module=BOT_STAGES_OF_SCRIPT&action=get_listView&to_pdf=1',
        params
      })
        .then(resp => {
          commit(
            'filterStages',
            resp.data.data.map(item => ({
              ...item,
              NAME: formatHtml(item.NAME)
            }))
          );
          commit('setOffset', resp.data.pageData.offsets);
        })
        .catch(err => this.catchError(err, 'Возникла ошибка получения данных'));
    },
    confirmDelete({ commit }, options = 'stages') {
      commit('clearData', options);
    }
  }
};
