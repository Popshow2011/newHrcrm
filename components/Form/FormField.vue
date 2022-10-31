<template>
  <div
    class="form-field"
    :class="{ 'empty-lbl': field.type !== FIELD.TYPE.GROUP && !field.lbl }"
  >
    <div v-if="field.type === FIELD.TYPE.TXT">
      <span>
        {{ field.value }}
      </span>
    </div>
    <div v-else-if="field.type === FIELD.TYPE.COMMUNICATION && !hidden(field)">
      <contact-form
        :ref="field.name"
        :field="field"
        :model="form[field.name]"
        :options="field.option.value_type_list"
        :disabled-field="disabled(field)"
        class="detached-form"
        @save="$emit('save-form')"
      ></contact-form>
      <Button
        buttonSize="big"
        buttonColor="blue"
        buttonText="Добавить контакт"
        @click="addContact"
      />
    </div>
    <div
      v-else-if="field.type === FIELD.TYPE.DETAIL_EXPERIENCE && !hidden(field)"
    >
      <detail-experience-form
        :ref="field.name"
        :field="field"
        :schema="field.schema"
        :model="form[field.name]"
        :disabled-field="disabled(field)"
        :date-format="datepicker.dateFormat"
        class="detached-form"
        @save="$emit('save-form')"
      ></detail-experience-form>
    </div>
    <div v-else-if="field.type === FIELD.TYPE.EDUCATION && !hidden(field)">
      <Education
        :ref="field.name"
        :field="field"
        :schema="field.schema"
        :model="form[field.name]"
        :disabled-field="disabled(field)"
        class="detached-form"
        @save="$emit('save-form')"
      />
    </div>
    <div v-else-if="field.type === FIELD.TYPE.LANGUAGE && !hidden(field)">
      <Language
        :ref="field.name"
        :field="field"
        :schema="field.schema"
        :model="form[field.name]"
        :disabled-field="disabled(field)"
        class="detached-form"
        @save="$emit('save-form')"
      />
    </div>

    <div v-else-if="field.type === FIELD.TYPE.QUALIFICATION && !hidden(field)">
      <Qualification
        :ref="field.name"
        :field="field"
        :schema="field.schema"
        :model="form[field.name]"
        :disabled-field="disabled(field)"
        class="detached-form"
        @save="$emit('save-form')"
      />
    </div>

    <div
      v-else-if="
        field.type === FIELD.TYPE.MULTIARRAY &&
        field.name == FIELD.ID.LANGUAGE_LEVEL &&
        !hidden(field)
      "
    >
      <LanguageForm
        :ref="field.name"
        :field="field"
        :schema="field.schema"
        :model="form[field.name] || []"
        :disabled-field="disabled(field)"
        :is-popup="true"
        class="detached-form"
        @save="$emit('save-form')"
      />
    </div>
    <Photo
      v-else-if="field.type === FIELD.TYPE.IMAGE && !hidden(field)"
      :disabled="disabled(field)"
      :field="field"
      :model="form[field.name]"
      :file="photo_file"
    ></Photo>

    <el-form-item
      v-else-if="field.type === FIELD.TYPE.GROUP && !hiddenAll(field.fields)"
      label=""
      :class="[
        'sub-fields',
        hasBoolField(field.fields),
        disabledClass(field),
        field.name == 'superjob_salary_group' ? 'salary_group' : ''
      ]"
      label-width="0px"
    >
      <template v-for="it in field.fields">
        <form-row
          v-if="!hidden(it)"
          :key="it.name"
          :field="it"
          :module="module"
          :class="subFieldClass(it)"
          :model="form[it.name]"
          :parentId="form.record"
          :options="options[it.name]"
          :callback="callback"
          :field-size="fieldSize || (isPopup ? 'medium' : 'big')"
          :newLabel="it.lbl"
          :noRequiredStar="noRequiredStar"
          :loading="fieldLoading"
          :blocked="blocked[it.name]"
          :defaultFirstOption="defaultFirstOption"
          @update-documents-list="updateDocumentsList"
          :search-param="field.search_param ? form[field.search_param] : ''"
          @change-option="selectOption"
          @set-value="setValue"
        ></form-row>
      </template>
    </el-form-item>
    <!-- </div> -->
    <div v-else-if="!textType(field.type)">
      <!-- условие с префиксом для отступа чекбокса в вакансии, шаблоне (надо переделать и убрать префикс) -->
      <!-- <span
        v-if="
          field.type === FIELD.TYPE.BOOL &&
          prefixClass == 'vacancy' &&
          field.visual_type !== 'no-label'
        "
        class="el-form-item__label"
      >
        <br />
        <br />
      </span> -->
      <form-row
        :key="field.name"
        :field="field"
        :module="module"
        :width="labelWidth"
        :options="options[field.name]"
        :model="form[field.name]"
        :parentId="form.record"
        :callback="callback"
        :datepicker="datepicker"
        :visible-option-btn="visibleOptionBtn"
        :field-size="fieldSize || (isPopup ? 'medium' : 'big')"
        :loading="fieldLoading"
        :blocked="blocked[field.name]"
        :disabled="disabled"
        :noRequiredStar="noRequiredStar"
        :defaultFirstOption="defaultFirstOption"
        :search-param="field.search_param ? form[field.search_param] : ''"
        @add-new-option="addNewOption"
        @change-option="selectOption"
        @update-documents-list="updateDocumentsList"
        @set-value="setValue"
      ></form-row>
      <div
        class="answer-responds"
        v-if="
          field.name === 'answer_responds' &&
          (!this.inviteAndRefuse.invite || !this.inviteAndRefuse.refuse)
        "
      >
        <span class="answer-responds__label">
          Автоответы не созданы. Для создания автоответа перейдите в профиль.
        </span>
        <Button
          class="answer-responds__button"
          buttonColor="blue"
          buttonText="Перейти в профиль"
          :link="`index.php?module=Users&action=EditView&record=${userId}`"
        />
      </div>
      <div class="answer-responds" v-else-if="field.name === 'mass_vacancy'">
        <span class="answer-responds__label fz-14 secondary">
          Откликнувшиеся кандидаты сразу попадают на этап “Добавлен”
        </span>
      </div>

      <div class="answer-responds" v-else-if="field.name === 'get_responds'">
        <div v-if="+form.get_responds">
          <span class="fz-14 secondary">
            Сбор откликов возможен с даты создания публикации или с будущей
            даты.
          </span>
          <div class="answer-responds__date">
            <DatePicker
              :model="form.get_responds_date"
              :field="{ type: 'date', name: 'get_responds_date' }"
              :datepicker="datepicker"
              size="medium"
              :options="pickerOptions"
              @set-value="
                (name, val) => {
                  handleChangeDate(val);
                }
              "
            />
          </div>
        </div>
      </div>
    </div>
    <el-form-item
      v-else-if="textType(field.type) && !hidden(field)"
      :prop="field.name"
      class="textarea"
      :class="[isEmptyField(field, form[field.name]) ? 'is-empty-field' : '']"
    >
      <span
        v-if="field.visual_type !== 'no-label'"
        class="el-form-item__label"
        :class="{
          'no-required-star':
            field.visual_type == 'no-required-star' || noRequiredStar
        }"
      >
        {{ field.lbl }}
        <p v-if="field.help && field.icon_help" class="help__text">
          ({{ field.help }})
        </p>
        <Icon v-if="field.required" iconName="redStar" />
      </span>
      <Editor
        :name="field.name"
        :value="form[field.name]"
        :placeholder="field.placeholder || ''"
        :disabled="disabled(field)"
        :min-length="field.minlength"
        :max-length="field.maxlength"
        :hover="editorHover"
        @change="changeEditorText($event)"
      />
    </el-form-item>
  </div>
</template>

<script>
import { store } from '@/store';
import { mixin, form } from '@/utils/mixins';
import { FIELD, BUTTON } from '@/utils/constants';
import { FormItem } from 'element-ui';
import { dateToMs } from '@/utils/helpers';
import FormRow from './FormRow';
import Editor from 'Elements/Editor/Editor';
import Photo from 'Elements/Upload/Photo.vue';
import Icon from 'Elements/Icon/Icon';
import Button from 'Elements/Button/Button';
import ContactForm from 'Elements/ContactForm/ContactForm';
import DetailExperienceForm from 'Elements/DetailExperienceForm/DetailExperienceForm';
import Education from 'Elements/Education/Education';
import Language from 'Elements/LanguageForm/Language';
import Qualification from 'Elements/Qualification/Qualification';
import DatePicker from 'Elements/DatePicker/DatePicker';
import LanguageForm from 'Elements/LanguageForm/LanguageForm';

// import ExperienceJob from 'Elements/ExperienceJob/ExperienceJob';

export default {
  mixins: [mixin, form],
  props: {
    item: Object,
    form: Object,
    module: String,
    prefixClass: String,
    formSize: { type: String, default: 'mini' },
    fieldSize: { type: String, default: '' },
    isPopup: Boolean,
    labelWidth: String,
    datepicker: Object,
    contactOpts: Object,
    visibleOptionBtn: {
      type: Boolean,
      default: false
    },
    photo_file: Array,
    fieldLoading: Boolean,
    options: Object,
    blocked: Object,
    callback: Object,
    noRequiredStar: Boolean,
    defaultFirstOption: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      field: this.item,
      FIELD,
      BTN: BUTTON,
      userId: store.state.common.config.userId,
      defaultDate: null,
      pickerOptions: {
        disabledDate: this.rangeRespondsDate
      }
    };
  },
  created() {
    if (this.field.name === 'get_responds') {
      this.setDateRespond();
    }
  },
  computed: {
    inviteAndRefuse() {
      return store.state.vacancy.inviteAndRefuseText;
    }
  },
  methods: {
    handleChangeDate(val) {
      this.$set(this.form, 'get_responds_date', val);

      if (dateToMs(this.defaultDate.toLocaleDateString()) < dateToMs(val)) {
        this.$set(this.form, 'nextDate', true);
      }
    },
    updateDocumentsList() {
      this.$emit('update-documents-list');
    },
    setDateRespond() {
      if (this.form.published_at) {
        const date =
          this.form?.get_responds == 1
            ? this.form?.get_responds_date
            : this.form?.published_at;

        this.defaultDate = this.getNewDate(date);
      } else {
        this.defaultDate = new Date();
      }
    },
    rangeRespondsDate(time) {
      let date = this.form?.published_at
        ? this.getNewDate(this.form.published_at)
        : new Date();
      date = new Date(date.setDate(date.getDate() - 1));
      return time.getTime() <= date;
    },
    disabledClass(field) {
      return this.disabled(field) ? 'sub-fields--disabled' : '';
    },
    subFieldClass(field) {
      const selectType = this.selectType(field.type);
      const className = selectType
        ? `el-select el-select--${this.formSize}`
        : `el-input el-input--${this.formSize}`;

      return [className /*this.disabled(field) ? 'is-disabled' : ''*/];
    },
    hasBoolField(fields) {
      return fields &&
        Array.isArray(fields) &&
        fields.find(item => item.type === FIELD.TYPE.BOOL)
        ? 'sub-fields--max'
        : '';
    },
    hiddenAll(fields) {
      return fields.every(field => this.hidden(field));
    },
    selectOption(...params) {
      this.$emit('change-option', ...params);
    },
    setValue(name, val, blocked) {
      this.$emit('set-value', name, val, blocked);

      if (name === 'get_responds' && val === '1') {
        this.$set(
          this.form,
          'get_responds_date',
          (this.form?.published_at
            ? this.form?.published_at.split(' ')[0]
            : '') ||
            this.formatDate(this.defaultDate, this.datepicker.dateFormat)
        );
      }
    },
    addNewOption(name) {
      this.$emit('add-new-option', name);
    },
    addContact() {
      store.commit('common/addContact', {
        opts: this.field.option.value_type_list
      });
    },
    changeEditorText(data) {
      this.setValue(this.field.name, data);
    }
  },
  components: {
    'el-form-item': FormItem,
    FormRow,
    Editor,
    Photo,
    Icon,
    Button,
    ContactForm,
    DetailExperienceForm,
    Education,
    Language,
    Qualification,
    DatePicker,
    LanguageForm

    // ExperienceJob
  }
};
</script>

<style lang="scss">
.el-textarea__inner {
  &:hover {
    background-color: $black-10 !important;

    &:after {
      background-color: $black-10 !important;
    }
  }
}

.answer-responds {
  display: flex;
  flex-direction: column;

  &__date {
    width: 150px;
    margin-top: 2px;
  }

  &__label {
    font-size: 16px;
    line-height: 24px;
    color: $black-100;
    margin-bottom: 8px;
    word-break: break-word;
  }

  &__button {
    width: 171px;
  }
}

.sub-fields {
  &--max {
    .el-form-item:first-child {
      margin-right: 32px;
    }
  }

  & > .el-form-item__content {
    display: flex;

    & > .el-form-item {
      margin-bottom: 0;
    }

    & > .el-form-item:not(:first-child) {
      margin-left: 8px !important;
    }
  }
}

.salary_group {
  & > .el-form-item__content {
    & > .el-form-item:not(:first-child) {
      margin-left: 12px !important;
    }

    .row:first-child {
      width: 214px !important;
      margin-right: 12px;
    }

    .row:nth-child(2) {
      width: 214px !important;
      margin-right: 12px;
    }

    .row:last-child {
      width: 140px !important;
    }
  }
}

.el-form-item__label {
  color: $black-200;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 24px;
  display: flex;
  align-items: center;

  .help__text {
    display: inline;
    color: $black-80;
    margin-left: 4px;
  }
}
</style>

<style lang="scss" scoped>
.textarea {
  & ::v-deep .el-form-item__label {
    color: $black-200;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 24px;
    display: flex;

    .help__text {
      display: inline;
      color: $black-80;
      margin-left: 4px;
    }
  }
}
</style>
