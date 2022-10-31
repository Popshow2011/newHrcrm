<template>
  <el-dialog
    v-loading="formLoading"
    ref="dialog"
    title="Заявка на выход нового сотрудника"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    width="610px"
    @close="$emit('reset-callback', 'form')"
    class="dialog meta-dialog"
  >
    <div class="dialog__content">
      <MetadataForm
        :data="data"
        :defaultParams="defaultParams"
        @savedFormData="onSavedFormData"
        @reset-callback="resetCallback"
        type="employee-exit"
        @setFormLoading="value => (formLoading = value)"
      />
    </div>
  </el-dialog>
</template>

<script>
import { MODULE, ACTION } from '@/utils/constants';
import MetadataForm from './MetadataForm';
import { Dialog } from 'element-ui';

export default {
  props: {
    is_visible: {
      type: Boolean
    },
    data: {
      type: Object
    },
    selectedStage: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      defaultParams: {
        module: MODULE.HRPAC_NEW_EPLOYEE_EXIT,
        action: ACTION.SAVE,
        'fields[candidate_id]': this.data.candidates_id,
        'fields[vacancy_id]': this.data.vacancy_id,
        'prefill[selection_stage_id]': this.selectedStage
          ? this.selectedStage.stage.id
          : '',
        jsqon_return: 1,
        to_pdf: true
      },
      formLoading: true
    };
  },
  methods: {
    onSavedFormData() {
      this.$emit('confirm-stage-select');
      this.$emit('reset-callback');
    },
    resetCallback() {
      this.$emit('reset-callback', 'cancel');
    }
  },
  components: {
    MetadataForm,
    'el-dialog': Dialog
  }
};
</script>
