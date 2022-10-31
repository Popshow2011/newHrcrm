<template>
  <!-- <el-tabs
    v-if="subpanelCol.length"
    v-model="activeSubpanel[colIndex].id"
    @tab-click="tabClick($event, colIndex)"
    v-loading="activeSubpanel[colIndex].loading"
    :class="subpanelCol.length === 1 ? 'is-only' : ''"
  > -->
  <el-tabs
    v-if="subpanelCol.length"
    v-model="activeSubpanel.id"
    @tab-click="tabClick($event, colIndex)"
    v-loading="activeSubpanel.loading"
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
      <!-- <el-tab-pane
      v-for="(tab, index) in subpanelCol"
      :ref="tab.id"
      :key="`${record}_${tab.id}_${index}`"
      :label="tabName(tab)"
      :name="tab.id"
      :lazy="Boolean(tab.lazy)"
    > -->
      <candidate-contacts
        class="tab__contacts"
        v-if="tab.id === SUBPANEL.ID.CONTACTS && loadedTabs[tab.id]"
        action="DetailView"
        :communications="{
          ...communications,
          config: contactsStructure
        }"
        @set-loading="setTabLoading($event)"
      />
      <work-experience-tab
        v-if="tab.id === SUBPANEL.ID.JOB_EXPERIENCE && loadedTabs[tab.id]"
        :jobs="jobs"
        @set-loading="setTabLoading($event)"
      ></work-experience-tab>
      <communication-tab
        v-if="tab.id === SUBPANEL.ID.COMMUNICATIONS && loadedTabs[tab.id]"
        :tab="tab"
        :id="record"
        :table-sql="tab.subpanel"
        :user-id="userId"
        :module="module"
        :name="fullName"
        :emails="emails"
        :allowed-scroll="allowedScroll"
        :params="communicationParams"
        @set-loading="setTabLoading($event, colIndex)"
        @set-tab-name="tabName"
      ></communication-tab>
      <comment-tab
        v-if="tab.id === SUBPANEL.ID.COMMENTS && loadedTabs[tab.id]"
        :user-id="userId"
        :id="record"
        :module="module"
        :count-id="countId"
        mode="selection"
        :table-sql="tab.subpanel"
        @set-loading="setTabLoading($event, colIndex)"
      ></comment-tab>
      <messages-tab
        v-if="tab.id === SUBPANEL.ID.MESSAGE && loadedTabs[tab.id]"
        @set-loading="setTabLoading($event, colIndex)"
      ></messages-tab>
    </el-tab-pane>
    <span v-if="defaultText">Данные не загружены</span>
  </el-tabs>
</template>

<script>
import { Tabs, TabPane } from 'element-ui';
import { store } from '@/store';
// import { getController } from '@/controllers/request.js';
import { mixin, metadata } from '@/utils/mixins';
import { SUBPANEL /*MODULE*/ } from '@/utils/constants';
import WorkExperienceTab from 'Elements/Tab/WorkExperienceTab';
import CandidateContacts from 'Parts/Candidate/Details/CandidateContacts';
import './subpanel.scss';
import CommunicationTab from 'Elements/Tab/CommunicationTab';
import CommentTab from 'Elements/Tab/CommentTab';
import MessagesTab from '../Tab/MessagesTab.vue';

export default {
  mixins: [mixin, metadata],
  props: {
    subpanelCol: {
      type: Object,
      default() {
        return {};
      }
    },
    colIndex: {
      type: Number,
      default() {
        return 0;
      }
    },
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
    jobs: Array,
    communications: Object,
    allowedScroll: Boolean,
    userId: Number,
    countId: Number,
    mode: {
      type: String,
      default: ''
    },
    messagesText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      subpanelsState: [],
      //activeSubpanel: this.subpanelCol[this.colIndex].id,
      contactsStructure: {
        priority: ['phone', 'email', 'telegram'],
        excluded: ['freelance', 'livejournal', 'icq'],
        value_type_list: {
          phone: 'Телефон',
          email: 'E-mail',
          telegram: 'Telegram',
          skype: 'Skype',
          facebook: 'Facebook',
          linkedin: 'LinkedIn',
          habr: 'Хабр.Карьера',
          site: 'Сайт'
        }
      },
      SUBPANEL,
      communicationParams: {}
    };
  },
  created() {
    store.commit('selectionPanel/setActiveCard', {
      count: this.countId,
      mode: this.mode
    });
    store.commit('selectionPanel/setActiveSubpanel', {
      mode: this.mode,
      data: { id: this.subpanelCol[this.colIndex].id, loading: false }
    });

    // if (this.module !== MODULE.VACANCY_MODULE) {
    //   // наличие сообщений в Коммуникациях
    //   getController({
    //     params: {
    //       module: 'Communications',
    //       action: 'count_messages',
    //       candidate_id: this.record
    //     }
    //   })
    //     .then(resp => {
    //       if (resp.data && resp.data.result) {
    //         this.communicationParams = {
    //           messagesCount: Number(resp.data.count) || 0,
    //           hasTelegram: !!resp.data.telegram, // проверка аккаунта телеги
    //           lastEmailId: resp.data.last_email_id, // последний id емейл-сообщ-я
    //           telegram: resp.data.user_telegram
    //         };
    //       }
    //     })
    //     .catch(err =>
    //       this.catchError(
    //         err,
    //         'Возникла ошибка в экшне count_messages',
    //         'communications counter'
    //       )
    //     );
    // }
  },
  computed: {
    activeSubpanel() {
      return this.mode != 'response'
        ? store.state.selectionPanel.candidates[this.countId].activeSubpanel
        : store.state.selectionPanel.responses[this.countId].activeSubpanel;
    },
    activePanelIndex() {
      return this.subpanelCol.indexOf(
        this.subpanelCol.find(panel => panel.id == this.activeSubpanel)
      );
    },
    tabKey() {
      return this.mode != 'response'
        ? store.state.selectionPanel.candidates[this.countId].tabKey
        : store.state.selectionPanel.responses[this.countId].tabKey;
    },
    loadedTabs() {
      return this.mode != 'response'
        ? store.state.selectionPanel.candidates[this.countId].loadedTabs
        : store.state.selectionPanel.responses[this.countId].loadedTabs;
    },
    defaultText() {
      return (
        this.subpanelCol.every(el => el.lazy) &&
        !this.subpanelCol.some(el => this.loadedTabs[el.id])
      );
    },
    config() {
      return store.state.common.config || {};
    },
    fullName() {
      return `${this.data.last_name.value} ${this.data.first_name.value} ${this.data.middle_name.value}`;
    }
  },
  methods: {
    setTabLoading(bool) {
      store.commit('selectionPanel/setActiveCard', {
        count: this.countId,
        mode: this.mode
      });
      store.commit('selectionPanel/setActiveSubpanel', {
        mode: this.mode,
        data: { id: this.activeSubpanel.id, loading: bool }
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
    tabClick(tab) {
      if (tab.lazy && !this.loadedTabs[tab.name]) {
        // store.commit('selectionPanel/setActiveCard', {
        //   count: this.countId,
        //   mode: this.mode
        // });
        this.setTabLoading(true);
        store.commit('selectionPanel/setLoadedTabs', {
          tab: tab.name,
          loaded: true,
          mode: this.mode
        });
      }
    }
    // tabClick(tab, tabName) {
    //   // this.activeSubpanel = tabName;
    //   // if (this.subpanelsState[this.activePanelIndex].loading)
    //   //   this.setTabLoading(true, tabName);
    //   if (tab.lazy && !this.loadedTabs[tab.paneName]) {
    //     this.setTabLoading(true, i);

    //     store.commit('selectionPanel/setLoadedTabs', {
    //       tab: tab.paneName,
    //       loaded: true
    //     });
    //   }
    // }
  },
  components: {
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    WorkExperienceTab,
    'candidate-contacts': CandidateContacts,
    CommunicationTab,
    CommentTab,
    MessagesTab
  }
};
</script>
<style lang="scss" scoped>
.tab__contacts {
  margin-top: 24px;
}
</style>
