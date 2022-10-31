<template>
  <el-tabs
    v-if="subpanelCol.length"
    v-model="activeSubpanel.id"
    @tab-click="tabClick($event)"
    v-loading="loading"
    class="big"
    :class="subpanelCol.length === 1 ? 'is-only' : ''"
  >
    <el-tab-pane
      v-for="tab in subpanelCol"
      :ref="tab.id"
      :key="`${record}_${tab.id}`"
      :label="tab.name"
      :name="tab.id"
      :lazy="Boolean(tab.lazy)"
    >
      <Button
        buttonColor="darkBlue"
        buttonText="Создать"
        hasLeftIcon
        iconName="Plus-bold"
        @click="openCreateDialog"
        class="create-button"
      />
      <AskAgainTab v-if="tab.id == 'ask_again'" @edit-message="editMessage" />
      <RemindTab v-else-if="tab.id == 'reminder'" @edit-message="editMessage" />
      <FunnelStagesTab v-else-if="tab.id == 'stages'" @edit-color="editColor" />
      <Loader v-if="loading" class="loader" />
      <div
        v-if="emptyTab"
        class="secondary fz-14 align-center"
        :style="emptyStyles"
      >
        список пуст
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { Tabs, TabPane } from 'element-ui';
import { store } from '@/store';
import AskAgainTab from 'Elements/Tab/AskAgainTab';
import RemindTab from 'Elements/Tab/RemindTab';
import FunnelStagesTab from 'Elements/Tab/FunnelStagesTab';
import Button from 'Elements/Button/Button';
import Loader from 'Elements/Loader/Loader';
import 'Elements/Subpanel/subpanel.scss';

export default {
  props: {
    subpanelCol: {
      type: Object,
      default() {
        return {};
      }
    },
    subpanel: String
  },
  data() {
    return {
      loading: false,
      activeSubpanel: this.subpanel
        ? { ...this.subpanelCol.id[this.subpanel] }
        : { ...this.subpanelCol[0] }
    };
  },
  computed: {
    defaultText() {
      return this.subpanelCol.every(el => el.lazy);
    },
    config() {
      return store.state.common.config || {};
    },
    is_visible() {
      return store.state.common.visible_dialog;
    },
    emptyTab() {
      return (
        (this.activeSubpanel.id == 'ask_again' &&
          !store.state.admin.messages.length) ||
        (this.activeSubpanel.id == 'reminder' &&
          !store.state.admin.reminders.length) ||
        (this.activeSubpanel.id == 'stages' && !store.state.admin.stages.length)
      );
    },
    emptyStyles() {
      return this.activeSubpanel.id == 'stages' ? { width: '491px' } : {};
    }
  },
  methods: {
    tabClick(tab) {
      this.activeSubpanel = { ...this.subpanelCol[tab.index], loading: true };
    },
    editMessage(dataset) {
      this.$emit('edit-record', dataset, this.activeSubpanel.id);
      this.is_visible.admin_changes_dialog = true;
    },
    editColor(dataset) {
      this.$emit('edit-record', dataset);
      this.is_visible.admin_stages_dialog = true;
    },
    openCreateDialog() {
      this.activeSubpanel.id == 'stages'
        ? this.editColor({})
        : this.editMessage({});
    }
  },
  components: {
    AskAgainTab,
    RemindTab,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    Button,
    FunnelStagesTab,
    Loader
  }
};
</script>

<style lang="scss" scoped>
.create-button {
  margin: 32px 0;
}

.loader {
  text-align: center;
}
</style>
