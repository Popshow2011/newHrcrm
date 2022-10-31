<template>
  <el-dialog
    v-bind="$attrs"
    :title="title"
    :width="$attrs.width"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    @close="
      () => {
        if (cancelCallbackOnClose) $emit('cancel-callback');
      }
    "
    class="dialog"
  >
    <div>
      <p class="dialog__text">
        {{ text }}
      </p>
    </div>
    <div slot="footer">
      <div class="footer footer--auto-width">
        <Button
          buttonSize="big"
          :buttonColor="buttonOkColor"
          :buttonText="buttonOkText"
          @click="$emit('ok-callback')"
          class="footer__button-ok"
        />
        <Button
          buttonSize="big"
          :buttonColor="buttonCancelColor"
          :buttonText="buttonCancelText"
          @click="$emit('cancel-callback')"
          class="footer__button-cancel"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
export default {
  inheritAttrs: false,
  props: {
    cancelCallbackOnClose: {
      type: Boolean,
      default: true
    },
    is_visible: {
      type: Boolean
    },
    title: {
      type: String
    },
    text: String,
    buttonOkColor: {
      type: String,
      default: 'darkBlue'
    },
    buttonOkText: {
      type: String,
      default: 'Ok'
    },
    buttonCancelColor: {
      type: String,
      default: 'blue'
    },
    buttonCancelText: {
      type: String,
      default: 'Отмена'
    }
  },
  components: { 'el-dialog': Dialog, Button }
};
</script>
<style lang="scss" scoped>
.dialog {
  & ::v-deep .el-dialog {
    padding-top: 12px !important;

    &__title {
      margin-bottom: 24px;
    }
  }

  &__text {
    font-size: 16px !important;
    margin-bottom: 36px !important;
  }
}
</style>
