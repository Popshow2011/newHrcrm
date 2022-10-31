<template>
  <el-dialog
    v-loading="formLoading"
    width="440px"
    :title="title"
    :visible="is_visible"
    :close-on-click-modal="false"
    @close="closeDialog"
    class="dialog"
  >
    <div class="dialog__content">
      <MetadataForm
        :defaultParams="defaultParams"
        @savedFormData="onSavedFormData"
        @reset-callback="closeDialog"
        @setFormLoading="value => (formLoading = value)"
        loadedAction="get_popup_view"
      />
    </div>
  </el-dialog>
</template>

<script>
import { store } from '@/store';
import { Dialog } from 'element-ui';
import MetadataForm from './MetadataForm.vue';
import { MODULE } from '@/utils/constants';

export default {
  props: {
    data: Object
  },
  data() {
    return {
      formLoading: true,
      defaultParams: {
        module: MODULE.HRPAC_COORDINATION_REQUESTS,
        action: 'save_popup',
        popup_type: store.state.application.popup_type,
        jsqon_return: 1,
        to_pdf: true,

        record: store.state.application.fields.id.value,
        comment: '',
        redirect_to: store.state.application.popup_type == 'redirect' ? store.state.common.config.userId : ''
      }
    }
  },
  methods: {
    onSavedFormData() {
      store.commit('application/setPopupType', '');
    },
    closeDialog() {
      store.commit('application/setPopupType', '');
      store.commit('common/setVisibleDialog', {
        name: 'application_dialog',
        val: false
      });
    }
  },
  computed: {
    is_visible() {
      return store.state.common.visible_dialog.application_dialog;
    },
    title() {
      switch (this.defaultParams.popup_type) {
        case 'approve':
          return 'Согласовать заявку?';
        case 'cancel':
          return 'Отменить заявку?';
        case 'redirect':
          return 'Перенаправить заявку?';
        case 'reject':
          return 'Отклонить заявку?';
        case 'revision':
          return 'Отправить заявку на доработку?';

        default:
          return '';
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    MetadataForm
  }
}
</script>

<style lang="scss" scoped>
.dialog__content {
  & ::v-deep .panel-row:first-child {
    margin-top: 24px;
  }

  & ::v-deep .el-form-item__label svg {
    display: none !important;
  }

  & ::v-deep .el-input.el-input--medium.el-input--suffix {
    height: 40px !important;
  }

  & ::v-deep input.el-input__inner {
    height: 40px !important;
  }
}
</style>
