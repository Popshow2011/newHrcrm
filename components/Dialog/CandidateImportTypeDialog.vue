<template>
  <el-dialog
    :title="title"
    :visible="is_visible"
    :close-on-click-modal="false"
    class="dialog-import"
  >
    <div class="body">
      <div class="core">
        <p class="core__label">Групповой импорт резюме</p>
        <p class="core__text core__text--info">
          Если необходимо загрузить много отдельных файлов с резюме по вашей
          форме
        </p>
        <Button
          class="button-import"
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Импортировать"
          @click="openImportDialogMulti"
        />
      </div>
      <div class="core">
        <p class="core__label">Импорт через шаблон</p>
        <p class="core__text core__text--info">
          Если кандидаты записаны в один файл, в табличной форме, по нашему
          шаблону
        </p>

        <Button
          class="button-import"
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Импортировать"
          @click="openImportDialogSingle"
        />
      </div>
    </div>
    <div class="footer">
      <div class="buttons">
        <Button
          footer
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отмена"
          @click="$emit('cancel-callback')"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import { mixin } from '@/utils/mixins';
import { store } from '@/store';
import Button from 'Elements/Button/Button';

export default {
  components: {
    'el-dialog': Dialog,
    Button
  },
  mixins: [mixin],
  props: {
    title: String,
    is_visible: Boolean
  },
  methods: {
    openImportDialogSingle() {
      this.$emit('cancel-callback');
      store.commit('common/setVisibleDialog', {
        name: 'candidate_import_dialog_single',
        val: true
      });
    },
    openImportDialogMulti() {
      this.$emit('cancel-callback');
      store.commit('common/setVisibleDialog', {
        name: 'candidate_import_dialog_multi',
        val: true
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.el-dialog__wrapper.dialog-import {
  & ::v-deep .el-dialog {
    width: 556px !important;
    background: $white !important;
    margin-top: 15vh !important;
    padding: 0 !important;

    &__header {
      padding: 14px 24px !important;

      .el-dialog__title {
        font-size: 18px !important;
        line-height: 28px !important;
        color: $black-200;
        font-family: 'Roboto Medium';
        font-weight: 500;
      }
    }

    .el-dialog__headerbtn {
      display: none;
    }

    .body {
      padding: 12px 24px !important;
      display: flex;

      .core {
        background: $black-10;
        padding: 20px 16px;
        text-align: center;

        &:first-child {
          margin-right: 12px;
        }

        &__label {
          font-size: 15px;
          line-height: 24px;
          color: $black-200;
          font-weight: 400;
          margin-bottom: 8px;
        }

        &__text {
          font-size: 14px;
          line-height: 24px;
          color: $black-100;
          white-space: normal;
          margin-bottom: 26px;
          word-break: normal;
        }
      }
    }
  }
}

.footer {
  display: flex;
  padding: 24px;
  margin-top: 0;
}
</style>
