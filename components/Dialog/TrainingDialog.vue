<template>
  <el-dialog
    :visible.sync="is_visible"
    ref="dialog"
    width="500px"
    title="Отправить ссылку на обучение"
    :close-on-click-modal="false"
    @close="$emit('close-popup')"
    class="dialog training-dialog"
  >
    <div class="dialog__content">
      <form ref="form" @submit.prevent="send" class="training-form brs-4">
        <div class="training-form__description">
          <p>Приглашение будет отправлено на почту:</p>
          <a :href="`mailto:${emails[0].value}`">
            <span class="blue">{{ emails[0].value }}</span>
          </a>
        </div>
        <div class="training-form__data">
          <label for="email" class="training-form__label">
            Ссылка для отправки
          </label>
          <Input
            ref="email"
            :field="field"
            :model="email"
            id="email"
            @set-value="handleChange"
            class="content-item"
          />
          <span v-if="field.error" class="red content-error">
            Введен некорректный URL адрес
          </span>
        </div>
      </form>
    </div>
    <div slot="footer" class="buttons-panel">
      <div class="buttons-row">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Отправить"
          class="footer__button-ok"
          @click.prevent="send"
        />
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отмена"
          @click="$emit('close-popup')"
          class="footer__button-cancel"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import Input from 'Elements/Input/Input';
import Button from 'Elements/Button/Button';
import { postController, getController } from '@/controllers/request.js';
import { errorMsg } from '@/utils/mixins';
// import { store } from '@/store';

export default {
  mixins: [errorMsg],
  props: {
    is_visible: Boolean,
    data: Object,
    emails: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      field: {
        htmlType: 'url',
        required: true,
        error: false
      },
      email: this.data?.vacancy_data?.school_course_url
    };
  },
  async created() {
    const resp = await getController({
      url: `index.php?module=HRPAC_STUDY&action=get_editView&to_pdf=1&fields[hrpac_candidate_id]=${this.data?.candidates_id}&fields[hrpac_vacancy_id]=${this.data?.vacancy_id}`
    });

    if (resp.data && !resp.data.errors) {
      this.email = resp.data.bean.study_course_link.value;
    }
  },
  methods: {
    handleChange(name, val) {
      this.$set(this.field, 'error', false);
      this.email = val;
    },
    async send() {
      const invalid = !this.$refs.email.$el.children[0].validity.valid;
      this.$set(this.field, 'error', invalid);

      if (!this.field.error) {
        const options = new FormData();

        options.append('module', 'HRPAC_STUDY');
        options.append('record', '');
        options.append('action', 'Save');
        options.append('hrpac_candidate_id', this.data?.candidates_id || '');
        options.append('hrpac_vacancy_id', this.data?.vacancy_id || '');
        options.append('study_course_link', this.email);
        options.append('jsqon_return', '1');

        try {
          const resp = await postController({
            options,
            params: {
              header: {
                'Content-Type': 'multipart/form-data'
              }
            }
          });
          // https://newemployee.talentforce.ru/course/1356/about

          if (resp.data?.errors?.length) {
            resp.data.errors.forEach(err => this.showErrorMessage(err));
          }

          if (resp.data.id) {
            this.$emit('confirm-stage-select');
          }
        } catch (e) {
          console.error(e);
          this.showErrorMessage('Ошибка отправки ссылки на обучение');
        }
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    Input,
    Button
  }
};
</script>

<style lang="scss" scoped>
.training-dialog {
  & ::v-deep .el-dialog {
    padding-top: 0 !important;

    &__title {
      font-size: 18px !important;
      line-height: 28px !important;
    }

    &__header {
      padding: 14px 0 !important;
    }

    &__body {
      margin: 12px 0;
    }
  }
}

.training-form {
  background-color: $black-10;
  padding: 16px;

  &__label {
    font-size: 14px;
    line-height: 24px;
    font-weight: normal;
    margin-bottom: 0;
    color: $primary-text;
  }

  &__data {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  &__description {
    margin-bottom: 24px;
  }

  &__error {
    color: $red-600;
    margin-top: 6px;
    font-size: 14px;
  }

  p,
  span {
    font-size: 15px;
    line-height: 24px;
  }
}

.content-error {
  font-size: 12px;
  margin-top: 4px;
}
</style>
