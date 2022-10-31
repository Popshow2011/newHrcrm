<template>
  <el-dialog
    title="Обновление публикации"
    width="440px"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    @close="closeDialog"
    class="dialog"
  >
    <div class="dialog-body">
      Публикация будет обновлена на работном сайте. Средства на вашем счете
      могут быть потрачены.
    </div>
    <div class="dialog-footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Обновить"
        @click="refreshVacancy"
      />
      <Button
        buttonSize="big"
        buttonColor="blue"
        buttonText="Отмена"
        @click="$emit('reset-callback')"
      />
    </div>
  </el-dialog>
</template>
<script>
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
import { store } from '@/store';

export default {
  props: {
    is_visible: {
      type: Boolean
    },
    work_site: {
      type: String,
      required: true
    },
    external_id: {
      type: Number,
      required: true
    }
  },
  methods: {
    resetCallback() {
      this.closeDialog();

      if (!this.authorized) return;
      store.dispatch('publicator/confirmAuth');
    },
    closeDialog() {
      this.$emit('reset-callback');
    },
    refreshVacancy() {
      store.dispatch('publicator/prolongateVacancy', {
        external_id: this.external_id,
        work_site: this.work_site
      });
      this.$emit('reset-callback');
    }
  },
  components: {
    'el-dialog': Dialog,
    Button
  }
};
</script>
<style lang="scss" scoped>
.el-dialog {
  position: relative;
}

.dialog-footer {
  display: flex;
  padding-top: 24px;

  &:before {
    content: '';
    position: absolute;
    bottom: 88px;
    left: 0;
    right: 0;
    border-top: 1px solid $black-20;
  }
}

.dialog-body {
  padding: 43px 0 40px 0;
  font-family: Roboto, sans-serif;
  font-size: 15px;
  color: $black-200;
  word-break: keep-all;

  &:before {
    content: '';
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    border-top: 1px solid $black-20;
  }
}
</style>
