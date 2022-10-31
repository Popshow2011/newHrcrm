<template>
  <el-dialog
    ref="dialog"
    width="672px"
    title="Нужно авторизоваться"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    @close="closeDialog"
    class="dialog meta-dialog publicator"
  >
    <div class="dialog__content">
      <div v-if="authField" class="auth-form">
        <p class="auth-form__title">Выберите площадки для авторизации</p>
        <div v-for="item in authElements" :key="item.id">
          <AuthorizeForm
            :field="item"
            :platformName="importData.work_site"
            :options="[]"
            :is-popup="true"
            variant="single"
          />
        </div>
      </div>
    </div>
    <div class="dialog__footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Хорошо"
        @click="resetCallback"
      />
    </div>
  </el-dialog>
</template>

<script>
import { store } from '@/store';
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
import AuthorizeForm from 'Elements/AuthorizeForm/AuthorizeForm';
import authField from './authorise.json';
import { mixin } from '@/utils/mixins';

export default {
  mixins: [mixin],
  props: {
    is_visible: {
      type: Boolean
    },
    needToImport: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      authField
    };
  },
  created() {
    if (!this.authElements.length) {
      store.commit('publicator/setAuthForm', {
        name: Object.values(store.state.publicator.work_site_list)[0]
      });
      store.commit('publicator/setAvailableOptions', {
        name: Object.values(store.state.publicator.work_site_list)[0]
      });
    }
  },
  methods: {
    addAuthItem() {
      store.commit('publicator/setAuthForm', {
        name: Object.values(store.state.publicator.work_site_list)[0]
      });
      store.commit('publicator/setAvailableOptions', {
        name: Object.values(store.state.publicator.work_site_list)[0]
      });
    },
    resetCallback() {
      this.closeDialog();
      if (!this.authElements[0].authData?.work_site) return;
      if (this.needToImport) this.dialog.publicator_import_dialog = true;
    },
    closeDialog() {
      this.$emit('reset-callback');
    }
  },
  computed: {
    importData() {
      return store.state.publicator.importData;
    },
    availableOptions() {
      return store.state.publicator.work_site_list;
    },
    dialog() {
      return store.state.common.visible_dialog;
    },
    authElements: {
      get() {
        return store.state.publicator.authForm.filter(
          item => item.name === this.importData.work_site
        );
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    Button,
    AuthorizeForm
  }
};
</script>
<style lang="scss" scoped>
#front .dialog {
  & ::v-deep .el-dialog {
    width: 540px !important;

    .authorize-form__input_sm {
      width: 160px !important;
    }

    &__header {
      padding: 20px 24px;
    }

    &__body {
      border-top: 1px solid $black-20;
      .auth-form {
        padding: 20px 32px 24px 32px;

        &__title {
          font-weight: normal;
          font-size: 14px;
          line-height: 20px;
          color: $black-100;
          margin-bottom: 12px;
        }
      }
    }
  }
  &__footer {
    padding: 24px !important;
    border: 1px solid #e9edf2;
    border-radius: 0px 0px 6px 6px;
    margin-top: 0 !important;

    .footer {
      justify-content: flex-start !important;
    }
  }
}

.publicator {
  height: 100%;

  & ::v-deep .panel-row > .form-field:not(:only-child) {
    width: calc(50% - 6px);

    &:first-child {
      margin-right: 12px;
    }
  }
}
</style>
