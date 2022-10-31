<template>
  <el-dialog
    :title="dialogParams.title"
    :visible="is_visible"
    :close-on-click-modal="false"
    width="357px"
    @close="cancelCallback"
    class="dialog"
  >
    <div>
      <p class="dialog__text">
        {{ dialogParams.text }}
      </p>
    </div>
    <div slot="footer" v-if="dialogParams.buttons">
      <div class="footer">
        <Button
          v-for="btn in dialogParams.buttons"
          :key="btn.id"
          buttonSize="big"
          :buttonColor="btn.color"
          :buttonText="btn.name"
          @click="callback(btn)"
        />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { store } from '@/store';
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
export default {
  props: {
    is_visible: Boolean
  },
  computed: {
    dialogParams() {
      return store.state.common.visible_dialog.confirm_close_dialog || {};
    }
  },
  methods: {
    callback(btn) {
      this.cancelCallback();

      if (btn.reset) {
        this.$emit('confirm');
        btn.callback();
      }
    },
    cancelCallback() {
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
#front .dialog {
  & ::v-deep .el-dialog__title {
    margin-bottom: 20px;
  }

  &__text {
    margin-top: 0;
  }
}
</style>
