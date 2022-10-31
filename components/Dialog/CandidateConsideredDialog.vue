<template>
  <el-dialog
    v-bind="$attrs"
    :append-to-body="true"
    title="Прикрепить кандидата?"
    :close-on-click-modal="false"
    width="400px"
    class="dialog"
    @close="$emit('close')"
  >
    <div v-html="dialog.subtitle"></div>
    <div slot="footer" class="dialog__footer">
      <Button
        v-if="status !== 'completed'"
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Прикрепить"
        @click="$emit('confirm')"
      />
      <Button
        v-if="status === 'completed'"
        buttonSize="big"
        buttonColor="blue"
        buttonText="ОК"
        @click="$emit('close')"
      />
      <Button
        v-if="status !== 'completed'"
        buttonSize="big"
        buttonColor="blue"
        buttonText="Отмена"
        @click="$emit('close')"
      />
    </div>
  </el-dialog>
</template>
<script>
import Button from 'Elements/Button/Button';
import { Dialog } from 'element-ui';
export default {
  inheritAttrs: false,
  components: { Button, 'el-dialog': Dialog },
  props: {
    dialog: {
      type: Object
    },
    status: {
      type: String
    }
  }
};
</script>
<style lang="scss" scoped>
.el-dialog__wrapper {
  & ::v-deep .el-dialog__header {
    font-family: Roboto, sans-serif;
    font-weight: bold;
    font-size: 24px;
    line-height: 32px;
    color: $black-200;
    padding: 24px 24px 0 24px;
  }

  & ::v-deep .el-dialog__title {
    font-family: Roboto, sans-serif;
    font-weight: bold;
    font-size: 24px;
    line-height: 32px;
    color: $black-200;
  }

  & ::v-deep .el-dialog__headerbtn {
    & .el-icon-close::before {
      content: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10.5857 12.0001L5.29285 6.70718L6.70706 5.29297L12 10.5859L17.2928 5.29297L18.7071 6.70718L13.4142 12.0001L18.7071 17.293L17.2928 18.7072L12 13.4143L6.70706 18.7072L5.29285 17.293L10.5857 12.0001Z' fill='%23282F36'/%3E%3C/svg%3E%0A");
    }
  }

  & ::v-deep .el-dialog__body {
    padding: 0 8px 0 24px;
    max-width: 352px;
    max-height: 300px;
    margin: 0 0 24px 0;
    overflow-y: auto;

    & div {
      & a {
        color: $blue-120;
        word-break: keep-all;
      }

      & p {
        font-family: Roboto, sans-serif;
        font-size: 15px;
        color: $black-200;
        margin-top: 20px;
        word-break: keep-all;
        margin-right: 8px;
      }
    }
  }
}

.dialog {
  &__footer {
    display: flex;
  }

  &__title {
    font-family: Roboto, sans-serif;
    font-weight: bold;
    font-size: 24px;
    line-height: 32px;
    color: $black-190;
  }
}
</style>
