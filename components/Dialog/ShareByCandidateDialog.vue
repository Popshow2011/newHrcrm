<template>
  <el-dialog
    title="Поделиться кандидатом"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    @close="$emit('reset-callback')"
    class="dialog"
  >
    <div>
      <p class="dialog__text">
        Укажите комментарий и поделитесь кандидатом в чате телеграм
      </p>
    </div>
    <div class="middle-area-form">
      <Textarea
        :field="{
          name: 'comment',
          placeholder: 'Введите комментарий'
        }"
        :model="form.comment"
        :hasResizeIcon="false"
        @change="handleChange"
      />
    </div>
    <div slot="footer">
      <div class="footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Oтправить"
          @click="shareByCandidate"
          class="accept-button"
        />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { Dialog } from 'element-ui';
import { mixin, errorMsg } from '@/utils/mixins';
import { getController } from '@/controllers/request.js';
import Textarea from 'Elements/Textarea/Textarea';
import Button from 'Elements/Button/Button';
export default {
  mixins: [mixin, errorMsg],
  props: {
    is_visible: {
      type: Boolean
    },
    data: {
      type: Object,
      default() {
        return {
          id: String,
          module: String
        };
      }
    }
  },
  data() {
    return {
      form: {}
    };
  },
  methods: {
    handleChange(name, val) {
      this.$set(this.form, name, val);
    },
    shareByCandidate() {
      const comment = this.form.comment || '';
      getController({
        url: `index.php?module=${this.data.module}&action=shareCandidateInTelegram&candidate_id=${this.data.id}&comment=${comment}&to_pdf=true`
      })
        .then(resp => {
          if (resp.data.ok && !resp.data.error) {
            this.showNotification({
              offset: 100,
              showClose: true,
              message: 'Данные успешно отправлены',
              type: 'success'
            });
          } else
            throw new Error(
              resp.data ? resp.data.error.error_text : 'Ошибка типа данных, обратитесь в техподдержку.'
            );
        })
        .catch(err => {
          //В рамках задачи HRCRM-2017 выполнено требование удалить слово Error: из текста ошибки именно при шаринге кандидата. (err.toString().split())
          this.catchError(err, err.toString().split(':')[1], 'share by candidate');
        })
        .finally(() => this.$emit('reset-callback'));
    }
  },
  components: {
    'el-dialog': Dialog,
    Textarea,
    Button
  }
};
</script>

<style lang="scss" scoped>
.middle-area-form {
  & ::v-deep .el-textarea {
    // min-height: 142px;
    // height: 142px;
    resize: none !important;

    & ::v-deep .el-textarea__inner {
      border-radius: 4px;
      color: $black-190;
      font-family: 'Roboto', sans-serif;
      min-height: 142px !important;
      height: 142px !important;
      font-weight: normal;
      font-size: 16px;
      line-height: 24px;
      padding: 16px;
      -ms-overflow-style: none;
      resize: none !important;
      list-style: none;
    }

    ::-webkit-resizer {
      display: none;
    }
  }
}
</style>
