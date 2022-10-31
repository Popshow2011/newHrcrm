<template>
  <el-dialog
    :title="title"
    :visible="is_visible"
    :close-on-click-modal="false"
    close-on-press-escape
    width="437px"
    @close="$emit('cancel-callback')"
    class="dialog"
  >
    <div class="dialog__middle">
      <h4 class="dialog__middle-title">Покажи свое сообщение провайдеру</h4>
      <p class="dialog__middle-text">
        Чтобы сценарий работал, нужно согласовать текст первого сообщения с
        провайдером.
        <br />
        <br />
        Если ваш провайдер MFM -
        <a :href="mod.MFM_FST_MESSAGE_LINK" target="_blank" class="link">
          {{ mod.MFM_FST_MESSAGE_LINK }}</a
        >
        <br />
        Если ваш провайдер Twilio -
        <a :href="mod.TWILIO_FST_MESSAGE_LINK" target="_blank" class="link">{{
          mod.TWILIO_FST_MESSAGE_LINK
        }}</a>
      </p>
    </div>
    <div slot="footer">
      <div class="footer footer--no-float">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Понятно"
          @click="$emit('cancel-callback')"
          class="footer__button-cancel"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import { store } from '@/store';
import Button from 'Elements/Button/Button';
export default {
  props: {
    is_visible: {
      type: Boolean
    },
    title: {
      type: String
    }
  },
  computed: {
    mod() {
      return store.state.common.mod;
    }
  },
  components: { 'el-dialog': Dialog, Button }
};
</script>

<style lang="scss">
#front .el-dialog__wrapper {
  .el-dialog__headerbtn {
    position: absolute;
    top: 24px;
    right: 24px;
  }

  .el-dialog__title {
    font-family: 'Roboto Medium';
    font-weight: bold;
  }

  .footer:not(.footer--multiple-buttons) .el-button {
    flex: none;
  }
}
</style>

<style lang="scss" scoped>
.dialog {
  &__middle {
    background: $black-10;
    border-radius: 4px;
    color: $black-200;
    padding: 12px;
    margin-top: 24px;

    &-title {
      font-size: 18px;
      line-height: 28px;
      margin: 0 0 12px 0;
      padding: 0;
      font-family: 'Roboto Medium';
      font-weight: bold;
    }

    &-text {
      font-size: 15px;
      line-height: 24px;
    }
  }
}
</style>
