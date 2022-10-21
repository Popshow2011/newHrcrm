import Vue from 'vue';
import Vuex from 'vuex';

import common from './modules/common';
import candidate from './modules/candidate';
import vacancy from './modules/vacancy';
import subpanels from './modules/subpanels';
import selectionPopup from './modules/selectionPopup';
import filters from './modules/filters';
import edit from './modules/edit';
import selectionPanel from './modules/selectionPanel';
import publicator from './modules/publicator';
import respond from './modules/respond';
import mailing from './modules/mailing';
import scenario from './modules/scenario';
import admin from './modules/admin';
import coordination from './modules/coordination';
import application from './modules/application';
import widget from './modules/widget';
import massAction from './modules/massAction';

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    common,
    candidate,
    vacancy,
    subpanels,
    selectionPopup,
    filters,
    edit,
    selectionPanel,
    publicator,
    respond,
    mailing,
    scenario,
    admin,
    coordination,
    application,
    widget,
    massAction
  },
  state: {},
  getters: {},
  mutations: {},
  actions: {}
});
