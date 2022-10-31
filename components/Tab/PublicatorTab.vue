<template>
  <div
    class="publicator-tab"
    v-loading="loader.visible || loader.accept_scroll"
  >
    <div class="button-group">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Опубликовать"
        class="accept-button"
        @click="(is_visible.publicator_dialog = true), (status = 'new')"
      />
      <Button
        buttonSize="big"
        buttonColor="blue"
        buttonText="Связать с публикацией"
        @click="handleCommand('import')"
        class="accept-button"
      />
    </div>
    <PublicatorList
      v-if="getPublishedVacancy.length"
      :publicVacancy="getPublishedVacancy"
    />
    <div class="empty" v-if="!getPublishedVacancy.length">
      Эта вакансия еще не публиковалась на работных сайтах
    </div>
    <PublicatorImportDialog
      v-if="is_visible.publicator_import_dialog"
      :is_visible="is_visible.publicator_import_dialog"
      @save-callback="searchVacancy"
      @reset-callback="closeDialog('publicator_import_dialog', null)"
    />
    <PublicatorDialog
      v-if="is_visible.publicator_dialog"
      :is_visible="is_visible.publicator_dialog"
      :data="fields"
      @save-callback="savePublicatorForm"
      @reset-callback="closeDialog('publicator_dialog', null)"
    />
    <PublicatorAuthDialog
      v-if="is_visible.publicator_auth_dialog"
      :is_visible="is_visible.publicator_auth_dialog"
      @reset-callback="closeDialog('publicator_auth_dialog', null)"
    />
  </div>
</template>
<script>
import Button from 'Elements/Button/Button';
import { store } from '@/store';
import { SUBPANEL } from '@/utils/constants';
import { mixin, errorMsg, update } from '@/utils/mixins';
import PublicatorList from 'Elements/Publicator/PublicatorList';
import PublicatorDialog from 'Elements/Dialog/PublicatorDialog';
import PublicatorImportDialog from 'Elements/Dialog/PublicatorImportDialog';
import PublicatorAuthDialog from 'Elements/Dialog/PublicatorAuthDialog';

export default {
  mixins: [mixin, errorMsg, update],
  components: {
    PublicatorImportDialog,
    PublicatorList,
    PublicatorDialog,
    PublicatorAuthDialog,
    Button
  },
  props: {
    module: String,
    id: String
  },
  data() {
    return {
      audit_iteration: 0,
      loader: {
        visible: true,
        accept_scroll: true
      },
      userId: store.state.common.config.userId,
      status: ''
    };
  },
  methods: {
    searchVacancy(link) {
      store.dispatch('publicator/checkLink', link);
    },
    savePublicatorForm() {
      this.updateSubpanels(SUBPANEL.ID.PUBLICATOR);
    },
    handleCommand(command) {
      switch (command) {
        case 'import':
          this.is_visible.publicator_import_dialog = true;
          break;
      }
    }
  },
  computed: {
    getPublishedVacancy() {
      return store.state.publicator.publishedVacancy;
    },
    isEmployer() {
      return store.state.publicator.hhData.is_employer;
    },
    authorized() {
      return !!store.state.publicator.hhData;
    },
    fields() {
      return store.state.vacancy.fields;
    },
    is_visible() {
      return store.state.common.visible_dialog;
    }
  },
  updated() {
    if (!this.getLoadingStatus) {
      this.$emit('set-loading', false);
    }
  },
  async created() {
    store.dispatch('publicator/checkAuth');
    store.dispatch('vacancy/getUserInviteAndRefuseText', this.userId);
    await store.dispatch('publicator/searchAllPublishVacancy', this.id);

    this.$set(this.loader, 'visible', false);
    this.$set(this.loader, 'accept_scroll', false);
  }
};
</script>

<style scoped lang="scss">
.history-tab {
  & ::v-deep .el-loading-mask {
    top: 99%;
  }
}

.publicator-tab .empty {
  margin-top: 24px !important;
}

.header-messages-tag {
  margin-top: 32px;
  margin-bottom: 4px;
}

.button-group {
  padding: 24px 0 0 0;
}
</style>
