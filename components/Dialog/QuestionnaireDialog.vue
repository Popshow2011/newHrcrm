<template>
  <el-dialog
    :title="title"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    @close="$emit('cancel-callback')"
    class="dialog"
  >
    <div>
      <p class="dialog__text" v-html="description"></p>
    </div>
    <div slot="footer">
      <div class="footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Хорошо"
          @click="$emit('cancel-callback')"
          class="footer__button-ok"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
export default {
  props: {
    is_visible: {
      type: Boolean
    },
    title: {
      type: String
    },
    description: String
  },
  components: { 'el-dialog': Dialog, Button }
};
</script>
<style lang="scss" scoped>
.dialog {
  & ::v-deep .el-dialog__header {
    margin-bottom: 18px;
  }

  & ::v-deep .el-dialog__title {
    font-size: 18px !important;
    line-height: 24px !important;
  }

  &__text {
    margin-top: 0 !important;

    & ::v-deep p:not(:last-child) {
      margin-bottom: 16px;
    }

    & ::v-deep p {
      font-size: 15px;
    }

    & ::v-deep a {
      font-weight: 500;
      font-family: 'Roboto Medium';
      color: $blue-120;
    }
  }
}

.footer button {
  flex: unset !important;
}
</style>
