<template>
  <el-dialog
    ref="dialog"
    :title="title"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    class="dialog"
    width="395px"
    @close="$emit('reset-callback')"
  >
    <div>
      <p v-if="!!candidates" class="dialog__info-text">
        Для {{ candidates }} чел. будет изменен этап подбора
      </p>
      <Divider v-else dividerSize="8" />
      <p class="dialog__text">{{ text }}</p>
    </div>

    <form novalidate ref="rejection-form">
      <div v-if="type == 'rejection'" class="middle-area-form">
        <Dropdown
          :field="{
            ...fields.rejection_categories,
            disabled: !options.rejection_categories
          }"
          :model="form.rejection_categories"
          :options="options.rejection_categories"
          filterable
          @set-value="handleChange"
          @set-hidden="setHidden"
        />
        <div class="indent"></div>
        <Dropdown
          :field="{
            ...fields.rejection_reasons,
            disabled: !form.rejection_categories
          }"
          :model="form.rejection_reasons"
          :options="filteredReasons"
          filterable
          @set-value="handleChange"
          @set-hidden="setHidden"
        />
      </div>
      <div v-else-if="type == 'return'" class="middle-area-form">
        <Textarea
          :field="fields.reason_for_return"
          :hasResizeIcon="false"
          :model="form.reason_for_return"
          show-word-limit
          maxlength="500"
          @change="handleChange"
          @set-hidden="setHidden"
        />
      </div>
    </form>
    <div slot="footer">
      <div class="footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          :buttonText="
            type == 'rejection'
              ? 'Отказать'
              : type == 'return'
              ? 'Подтвердить'
              : 'Сохранить'
          "
          @click.prevent="confirmRejection"
          class="accept-button"
        />
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отменить"
          @click="$emit('reset-callback')"
          class="button-cancel"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui';
import { getController } from '@/controllers/request.js';
import { ACTION, FIELD } from '@/utils/constants';
import { scrollToErrorField } from '@/utils/helpers';
import { mixin, rules } from '@/utils/mixins';
import Textarea from 'Elements/Textarea/Textarea';
import Divider from 'Elements/Divider/Divider';
import Button from 'Elements/Button/Button';
import Dropdown from 'Elements/Select/Dropdown';
export default {
  mixins: [mixin, rules],
  props: {
    type: String,
    is_visible: {
      type: Boolean
    },
    modules: {
      type: Array,
      default() {
        return [];
      }
    },
    candidates: {
      type: Number
    }
  },
  data() {
    return {
      options: {},
      form: {},

      fields: {
        [FIELD.ID.REJECTION_CATEGORIES]: {
          name: FIELD.ID.REJECTION_CATEGORIES,
          required: true,
          placeholder: 'Категория отказа',
          type: 'enum'
        },
        [FIELD.ID.REJECTION_REASONS]: {
          name: FIELD.ID.REJECTION_REASONS,
          required: true,
          placeholder: 'Причина отказа',
          type: 'enum'
        },
        [FIELD.ID.REASON_FOR_RETURN]: {
          name: FIELD.ID.REASON_FOR_RETURN,
          placeholder: 'Введите комментарий',
          required: true
        }
      },
      rules: {}
    };
  },
  created() {
    this.formFields.forEach(field =>
      this.fields[field].required ? this.setRequiredFields(true, field) : null
    );
    // в запросах на получение списка категорий и причин отказа проверяем наличие прав на смену на Отказ
    this.modules.forEach(module => {
      getController({
        params: {
          module,
          action: ACTION.JSON_LIST,
          hide_clear_button: true,
          mode: 'MultiSelect',
          create: true,
          jsqon_return: 1,
          to_pdf: true
        }
      })
        .then(resp => {
          if (resp.data && typeof resp.data !== 'string') {
            const optModule = module
              .split('_')
              .slice(1)
              .join('_')
              .toLowerCase();
            this.$set(this.options, optModule, resp.data || []);
          }

          if (
            typeof resp.data == 'string' &&
            resp.data.indexOf('У Вас нет доступа к данной странице') > -1
          ) {
            this.$emit('add-config', { hasNoReasonRights: true });
          }
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка при загрузке опций причин/категорий отказа',
            'rejection reason loading'
          )
        );
    });
  },
  computed: {
    title: function () {
      return this.type == 'rejection' && !!this.candidates
        ? 'Отказать кандидатам?'
        : this.type == 'rejection'
        ? 'Отказать кандидату?'
        : this.type == 'return' && !!this.candidates
        ? 'Возврат кандидатов'
        : this.type == 'return'
        ? 'Возврат кандидата'
        : '';
    },
    text: function () {
      return this.type == 'rejection'
        ? 'Укажите причину отказа'
        : this.type == 'return'
        ? 'Укажите причину возврата к рассмотрению'
        : '';
    },
    formFields() {
      return this.type == 'rejection'
        ? [FIELD.ID.REJECTION_CATEGORIES, FIELD.ID.REJECTION_REASONS]
        : this.type == 'return'
        ? [FIELD.ID.REASON_FOR_RETURN]
        : [];
    },
    filteredReasons() {
      if (this.form.rejection_categories) {
        const category = this.options.rejection_categories.find(
          item => item.id === this.form.rejection_categories
        );

        return this.options.rejection_reasons.filter(
          item => item.hrpac_rejection_categories_id_c === category.id
        );
      }
      return this.options.rejection_reasons;
    }
  },
  methods: {
    handleChange(name, val) {
      this.$set(this.form, name, val);
      this.validateForm(this.form, name);

      if (name == FIELD.ID.REJECTION_CATEGORIES) {
        this.$set(this.form, FIELD.ID.REJECTION_REASONS, '');
      }
    },
    confirmRejection() {
      const valid = this.validateForm(this.form);
      scrollToErrorField(this.fields, this.$refs.dialog.$el);

      if (valid) {
        this.$emit('confirm', this.form);
      } else {
        console.log('Заполните обязательные поля!');
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    Textarea,
    Button,
    Dropdown,
    Divider
  }
};
</script>
<style lang="scss" scoped>
#front .dialog {
  & ::v-deep .el-dialog {
    padding: 12px 24px 24px;

    & > .el-dialog__header {
      & > .el-dialog__title {
        font-family: 'Roboto Medium';
        font-size: 18px !important;
        line-height: 28px !important;
      }

      button {
        height: 24px;
      }
    }

    .dialog__text {
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .dialog__info-text {
      font-weight: 400;
      font-size: 15px;
      line-height: 24px;
      color: black;
      margin-top: 24px;
    }

    .el-dialog__footer {
      margin: 36px 0 0 0;

      .footer {
        justify-content: unset;
        display: block;

        .button-cancel {
          margin-left: 8px;
        }
      }
    }
  }
}

.middle-area-form {
  .indent {
    height: 8px;
  }

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
