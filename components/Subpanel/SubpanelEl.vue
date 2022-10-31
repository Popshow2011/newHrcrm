<template>
  <el-tabs
    v-if="subpanelCol.length"
    v-model="activeSubpanel[colIndex].id"
    @tab-click="tabClick($event, colIndex)"
    v-loading="activeSubpanel[colIndex].loading"
    :class="subpanelCol.length === 1 ? 'is-only' : ''"
    class="big"
  >
    <el-tab-pane
      v-for="tab in subpanelCol.filter(c =>
        c.id === SUBPANEL.ID.PROJECT ? data.project_id_c.value : c
      )"
      :ref="tab.id"
      :key="`${record}_${tab.id}_${tabKey[tab.id]}`"
      :label="tabName(tab)"
      :name="tab.id"
      :lazy="Boolean(tab.lazy)"
    >
      <span slot="label" v-if="tab.image">
        <Icon :iconName="tab.image" iconColor="#62717E" />
        {{ tabName(tab) }}</span
      >
      <description-tab
        v-if="tab.id === SUBPANEL.ID.DESCRIPTION && loadedTabs[tab.id]"
        :fields="tab.fields_arr"
        :data="data"
        :mod="mod"
      ></description-tab>
      <resume-tab
        v-if="tab.id === SUBPANEL.ID.RESUME && loadedTabs[tab.id]"
        :fields="data"
        @set-loading="setTabLoading($event, colIndex)"
      ></resume-tab>
      <history-tab
        v-if="tab.id === SUBPANEL.ID.AUDIT && loadedTabs[tab.id]"
        :module="module"
        :id="record"
        :tab-id="tab.id"
        @set-loading="setTabLoading($event, colIndex)"
      ></history-tab>
      <assessment-tab
        v-if="tab.id === SUBPANEL.ID.INTERVIEW_REPORT && loadedTabs[tab.id]"
        :module="module"
        :candidate-id="record"
        @set-loading="setTabLoading($event, colIndex)"
      ></assessment-tab>
      <document-tab
        v-if="tab.id === SUBPANEL.ID.DOCUMENTS && loadedTabs[tab.id]"
        :user-id="config.userId"
        :id="record"
        :module="module"
        :table-sql="tab.subpanel"
        @set-loading="setTabLoading($event, colIndex)"
      ></document-tab>
      <application-stages-tab
        v-if="tab.id === SUBPANEL.ID.PLAN && loadedTabs[tab.id]"
        :user-id="config.userId"
        :id="record"
        :module="module"
        @set-loading="setTabLoading($event, colIndex)"
      ></application-stages-tab>
      <communication-tab
        v-if="tab.id === SUBPANEL.ID.COMMUNICATIONS && loadedTabs[tab.id]"
        :tab="tab"
        :id="record"
        :table-sql="tab.subpanel"
        :user-id="config.userId"
        :module="module"
        :name="data.name.value"
        :emails="emails"
        :allowed-scroll="allowedScroll"
        :params="communicationParams"
        @set-loading="setTabLoading($event, colIndex)"
        @set-tab-name="tabName"
      ></communication-tab>
      <comment-tab
        v-if="tab.id === SUBPANEL.ID.COMMENTS && loadedTabs[tab.id]"
        :user-id="config.userId"
        :id="record"
        :module="module"
        :table-sql="tab.subpanel"
        @set-loading="setTabLoading($event, colIndex)"
      ></comment-tab>
      <vacancies-tab
        v-if="
          tab.id === SUBPANEL.ID.SELECTION &&
          loadedTabs[tab.id] &&
          module == MODULE.CANDIDATES_MODULE
        "
        :config="config"
        @set-loading="setTabLoading($event, colIndex)"
      />
      <vacancy-steps
        v-if="
          tab.id === SUBPANEL.ID.SELECTION &&
          loadedTabs[tab.id] &&
          module == MODULE.VACANCY_MODULE
        "
        @set-loading="setTabLoading($event, colIndex)"
      />
      <publicator-tab
        v-if="tab.id === SUBPANEL.ID.PUBLICATOR && loadedTabs[tab.id]"
        :module="module"
        :id="record"
        @set-loading="setTabLoading($event, colIndex)"
      />
    </el-tab-pane>
    <span v-if="defaultText">Данные не загружены</span>
  </el-tabs>
</template>

<script>
import { Tabs, TabPane } from 'element-ui';
import { store } from '@/store';
import { getController } from '@/controllers/request.js';
import { mixin, metadata } from '@/utils/mixins';
import { SUBPANEL, MODULE } from '@/utils/constants';
import DescriptionTab from 'Elements/Tab/DescriptionTab';
import DocumentTab from 'Elements/Tab/DocumentTab';
import HistoryTab from 'Elements/Tab/HistoryTab';
import AssessmentTab from 'Elements/Tab/AssessmentTab';
import CommunicationTab from 'Elements/Tab/CommunicationTab';
import CommentTab from 'Elements/Tab/CommentTab';
import ResumeTab from 'Elements/Tab/ResumeTab';
import VacanciesTab from 'Elements/Tab/VacanciesTab';
import VacancySteps from 'Elements/Tab/VacancySteps';
import PublicatorTab from 'Elements/Tab/PublicatorTab';
import ApplicationStagesTab from 'Elements/Tab/ApplicationStagesTab';
import './subpanel.scss';

export default {
  mixins: [mixin, metadata],
  props: {
    subpanelCol: {
      type: Object,
      default() {
        return {};
      }
    },
    colIndex: Number,
    module: String,
    record: String,
    data: {
      type: Object,
      default() {
        return {};
      }
    },
    mod: Object,
    emails: Array,
    allowedScroll: Boolean
  },
  data() {
    return {
      MODULE,
      SUBPANEL,
      communicationParams: {}
    };
  },
  created() {
    // this.setSubpanelData(this.subpanels);
    if (
      this.module !== MODULE.VACANCY_MODULE &&
      this.subpanelCol.some(({ id }) => id == SUBPANEL.ID.COMMUNICATIONS)
    ) {
      // наличие сообщений в Коммуникациях
      getController({
        params: {
          module: 'Communications',
          action: 'count_messages',
          candidate_id: this.record
        }
      })
        .then(resp => {
          if (resp.data && resp.data.result) {
            this.communicationParams = {
              messagesCount: Number(resp.data.count) || 0,
              hasTelegram: !!resp.data.telegram, // проверка аккаунта телеги
              lastEmailId: resp.data.last_email_id, // последний id емейл-сообщ-я
              telegram: resp.data.user_telegram
            };
          }
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка в экшне count_messages',
            'communications counter'
          )
        );
    }
  },
  computed: {
    activeSubpanel() {
      return store.state.subpanels.activeSubpanel;
    },
    tabKey() {
      return store.state.subpanels.tabKey;
    },
    loadedTabs() {
      return store.state.subpanels.loadedTabs;
    },
    defaultText() {
      return (
        this.subpanelCol.every(el => el.lazy) &&
        !this.subpanelCol.some(el => this.loadedTabs[el.id])
      );
    },
    config() {
      return store.state.common.config || {};
    }
  },
  methods: {
    setTabLoading(bool, i) {
      store.commit('subpanels/setActiveSubpanel', {
        i,
        data: { ...this.activeSubpanel[this.colIndex], loading: bool }
      });
    },
    tabName(tab, data = {}) {
      if (tab.id === SUBPANEL.ID.COMMUNICATIONS) {
        if (data.count) {
          this.$set(
            this.communicationParams,
            'messagesCount',
            Number(data.count)
          );
        }
        const count = this.communicationParams.messagesCount; //без записи в переменную проблемы с тиком
        this.$nextTick(() =>
          $(`[data-id="${this.record}"] #tab-${tab.id}`).addClass(
            count ? 'has-msg' : 'no-msg'
          )
        );
      }

      return tab.name;
    },
    tabClick(tab, i) {
      if (tab.lazy && !this.loadedTabs[tab.paneName]) {
        this.setTabLoading(true, i);
        store.commit('subpanels/setLoadedTabs', {
          tab: tab.paneName,
          loaded: true
        });
      }
    }
  },
  components: {
    PublicatorTab,
    DescriptionTab,
    DocumentTab,
    HistoryTab,
    AssessmentTab,
    CommunicationTab,
    CommentTab,
    ResumeTab,
    VacanciesTab,
    VacancySteps,
    ApplicationStagesTab,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane
  }
};
</script>
