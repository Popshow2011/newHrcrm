<template>
  <el-form-item
    v-if="field"
    :label="formatHtml(field.question_text) || ''"
    :prop="field.question_id"
    :class="className"
  >
    <Textarea
      v-if="field.answer_type === ANSWER_TYPE.TEXT_ANSWER"
      :field="{ field, name: field.question_id }"
      :hasResizeIcon="true"
      :model="localModel"
      @change="handleChangeValue"
    />
    <DatePicker
      v-else-if="field.answer_type === ANSWER_TYPE.DATETIME_ANSWER"
      :model="localModel"
      :field="{ field, type: 'datetime', name: field.question_id }"
      @set-value="handleChangeValue"
    />
    <DatePicker
      v-else-if="field.answer_type === ANSWER_TYPE.DATE_ANSWER"
      :model="localModel"
      :field="{ field, type: 'date', name: field.question_id }"
      @set-value="handleChangeValue"
    />
    <Rating
      v-else-if="field.answer_type === ANSWER_TYPE.RATING_ANSWER"
      :name="field.question_id"
      :model="localModel"
      @set-value="handleChangeValue"
    />
    <Scale
      v-else-if="field.answer_type === ANSWER_TYPE.SCALE_ANSWER"
      :model="localModel"
      :name="field.question_id"
      @set-value="handleChangeValue"
    />
    <Radio
      v-else-if="field.answer_type === ANSWER_TYPE.OPTION_ANSWER"
      v-for="(val, key) in field.answer_options"
      :key="key"
      :label="key"
      :model="localModel"
      :text="val"
      @set-value="handleChangeValue"
    />
    <Dropdown
      v-else-if="selectType"
      :field="{
        ...field,
        name: field.question_id
      }"
      :model="localModel"
      filterable
      :multiple="true"
      :multiple-limit="!multipleSelect ? 1 : 0"
      :options="options[field.question_id] || []"
      @set-value="handleChangeValue"
    />
    <Checkbox
      v-else-if="field.answer_type === ANSWER_TYPE.BOOL_ANSWER"
      :value="localModel"
      :required="field.required"
      :disabled="field.disabled"
      @change="val => handleChangeValue(field.question_id, val)"
    />
    <Input
      v-else-if="field.answer_type === ANSWER_TYPE.LINE_ANSWER"
      :field="{ field, name: field.question_id }"
      :model="localModel"
      @set-value="handleChangeValue"
    />
  </el-form-item>
</template>
<script>
import { FormItem } from 'element-ui';
import DatePicker from 'Elements/DatePicker/DatePicker';
import Textarea from 'Elements/Textarea/Textarea';
import Input from 'Elements/Input/Input';
import Dropdown from 'Elements/Select/Dropdown';
import Checkbox from 'Elements/Checkbox/CustomCheckbox';
import Radio from 'Elements/Radio/Radio';
import Rating from 'Elements/Rating/Rating';
import Scale from 'Elements/Scale/Scale';
import { ANSWER_TYPE } from '@/utils/constants';
import { mixin } from '@/utils/mixins';

export default {
  mixins: [mixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    vacancy_id: String,
    item: {
      type: Object,
      default: () => ({})
    },
    model: {
      type: [String, Array, Object, Boolean, Number]
    },
    options: {
      type: Array,
      default: () => []
    },
    datepicker: {
      type: Object,
      default: () => ({})
    },
    selectType: Boolean,
    className: {
      type: [String, Array],
      default: ''
    }
  },
  data() {
    return {
      ANSWER_TYPE,
      localModel: this.model || '',
      pickerOptions: {
        firstDayOfWeek: 1
      }
    };
  },
  computed: {
    multipleSelect() {
      return this.field.answer_type == ANSWER_TYPE.MULTIENUM_ANSWER;
    }
  },
  methods: {
    handleChangeValue(name, val) {
      if (name) {
        this.localModel = val;
      }

      const jobId = this.item.job ? this.item.job.id : null;
      this.$emit(
        'set-value',
        this.localModel,
        this.vacancy_id,
        this.field,
        jobId
      );
    }
  },
  components: {
    Rating,
    Radio,
    Checkbox,
    'el-form-item': FormItem,
    DatePicker,
    Input,
    Textarea,
    Dropdown,
    Scale
  }
};
</script>
<style lang="scss">
.el-textarea {
  & > &__inner {
    &:hover {
      background-color: $white !important;

      &:after {
        background-color: $white !important;
      }
    }
  }

  &--resize-icon.is-disabled {
    background-color: $black-10 !important;
    &:after {
      background-color: $black-10 !important;
    }
  }
}
</style>