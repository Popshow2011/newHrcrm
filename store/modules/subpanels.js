import { getController, postController } from '@/controllers/request';

export default {
  namespaced: true,
  state: {
    comments: [],
    hasNoRights: false,
    commentFormActive: false,
    commentToDelete: null,
    resizeValue: 0,
    loadedTabs: {},
    tabKey: {},
    activeSubpanel: {},
    subpanels: [],
    selectedMessage: null,
    emailPanelData: {},
    emailParams: {}
  },
  mutations: {
    setSubpanels(state, subpanels) {
      state.subpanels = subpanels;
    },
    setComents(state, comments) {
      state.comments = comments;
    },
    setRights(state, val) {
      state.hasNoRights = val;
    },
    setCommentForm(state, val) {
      state.commentFormActive = val;
    },
    setCommentToDelete(state, value) {
      state.commentToDelete = value;
    },
    setResizeSidebarValue(state, data) {
      state.resizeValue = data;
    },
    setLoadedTabs(state, { tab, loaded }) {
      state.loadedTabs[tab] = loaded;
    },
    setActiveSubpanel(state, { i, data = {} }) {
      state.activeSubpanel = { ...state.activeSubpanel, [i]: data };

      if (!state.tabKey.hasOwnProperty(data.id)) {
        state.tabKey[data.id] = 0;
      }
    },
    updateActiveSubpanel(state, id) {
      if (id) {
        state.tabKey = { ...state.tabKey, [id]: +(state.tabKey[id] || 0) + 1 };
      } else {
        for (let key in state.tabKey) {
          state.tabKey = {
            ...state.tabKey,
            [key]: +(state.tabKey[key] || 0) + 1
          };
        }
      }
    },
    setSelectedMessage(state, messageData = null) {
      state.selectedMessage = messageData;
    },
    setEmailData(state, val) {
      state.emailPanelData = val;
    },
    setEmailParams(state, val) {
      state.emailParams = val;
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
              to_recruits: comment.to_recruits.value,
              system_comment: comment.system_comment.value
            };
          });

          commit('setComents', comments);
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
