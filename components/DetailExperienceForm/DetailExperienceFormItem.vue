<template>
  <div class="base">
    <div class="row">
      <div class="item">
        <el-form-item
          :prop="`${item.id}__company_name`"
          :rules="rules[`${item.id}__company_name`]"
          :label="schema.company_name.lbl"
          class="input"
        >
          <Input
            :field="{
              ...schema.company_name,
              name: `${item.id}__company_name`
            }"
            :model="item.fields[0].value"
            @set-value="
              (name, val) =>
                handleChange({
                  [schema.company_name.name]: val
                })
            "
          />
        </el-form-item>
      </div>
      <div class="item">
        <el-form-item
          :prop="`${item.id}__period_begin`"
          :rules="rules[`${item.id}__period_begin`]"
          :label="schema.period_begin.lbl"
          class="date-picker"
        >
          <DatePicker
            :field="{
              ...schema.period_begin,
              name: `${item.id}__period_begin`
            }"
            :model="item.fields[1].value"
            @set-value="
              (name, value) => {
                handleChange({ [schema.period_begin.name]: value });
                $emit('validate');
              }
            "
          />
        </el-form-item>
      </div>
      <div class="item">
        <el-form-item
          :prop="`${item.id}__period_end`"
          :rules="!+item.fields[3].value ? rules[`${item.id}__period_end`] : {}"
          :label="schema.period_end.lbl"
          class="date-picker"
        >
          <DatePicker
            :field="{
              ...schema.period_end,
              name: `${item.id}__period_end`,
              disabled: !!+item.fields[3].value
            }"
            :model="item.fields[2].value"
            @set-value="
              (name, value) => {
                handleChange({ [schema.period_end.name]: value });
                $emit('validate');
              }
            "
          />
        </el-form-item>
      </div>
      <div class="item">
        <el-form-item
          :prop="`${item.id}__checkbox_job_now`"
          class="item-checkbox"
        >
          <Checkbox
            :value="+item.fields[3].value"
            :text="schema.checkbox_job_now.lbl"
            @change="switchPeriodCheckbox"
          />
        </el-form-item>
      </div>
    </div>
    <div class="row">
      <div class="item">
        <el-form-item
          :prop="`${item.id}__post`"
          :rules="rules[`${item.id}__post`]"
          :label="schema.post.lbl"
          class="input"
        >
          <Input
            v-if="schema"
            :model="item.fields[4].value"
            :field="{ ...schema.post, name: `${item.id}__post` }"
            @set-value="
              (name, val) => handleChange({ [schema.post.name]: val })
            "
          />
        </el-form-item>
      </div>
      <div class="item">
        <el-form-item
          :prop="`${item.id}__period_length`"
          :rules="rules[`${item.id}__period_length`]"
          :label="schema.period_length.lbl"
          class="input"
        >
          <Input
            v-if="schema"
            :model="item.fields[6].value"
            :field="{
              ...schema.period_length,
              name: `${item.id}__period_length`
            }"
            @set-value="
              (name, val) =>
                handleChange({
                  [schema.period_length.name]: val
                })
            "
          />
        </el-form-item>
      </div>
    </div>
    <div class="row">
      <div class="item">
        <el-form-item
          :prop="`${item.id}__post_desc`"
          :rules="rules[`${item.id}__post_desc`]"
          :label="schema.post_desc.lbl"
          class="input"
        >
          <Editor
            class="el-textarea__inner"
            @change="value => handleChange({ [schema.post_desc.name]: value })"
            :name="`${item.id}__post_desc`"
            :value="item.fields[5].value"
          />
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script>
import { FormItem } from 'element-ui';
import { mixin } from '@/utils/mixins';
import Input from 'Elements/Input/Input';
import DatePicker from 'Elements/DatePicker/DatePicker';
import Checkbox from 'Elements/Checkbox/CustomCheckbox';
import Editor from 'Elements/Editor/Editor';

export default {
  mixins: [mixin],
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    schema: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number
    },
    dateFormat: String
  },
  data() {
    return {
      rules: {}
    };
  },
  created() {
    this.item.fields.map(item => {
      if (!this.schema[item.name]) return;

      this.$set(this.rules, `${this.item.id}__${item.name}`, [
        this.schema[item.name].required
          ? {
              required: true,
              message: 'Необходимо заполнить поле',
              trigger: ['blur', 'focus', 'change']
            }
          : {},
        item.name == 'period_begin' || item.name == 'period_end'
          ? {
              validator: (rule, value, callback) => {
                this.validateDateRange(
                  false,
                  value,
                  callback,
                  [this.item.fields[1].value, this.item.fields[2].value],
                  this.dateFormat
                );
              },
              trigger: 'change'
            }
          : {}
      ]);
    });
  },
  methods: {
    handleChange(fields = {}) {
      this.$emit('set-value', this.item, this.index, fields);
    },
    switchPeriodCheckbox(value) {
      const fields = { [this.schema.checkbox_job_now.name]: String(value) };

      if (+value) {
        fields[this.schema.period_end.name] = '';
      }
      this.handleChange(fields);
      this.$emit('validate');
    }
  },
  components: {
    'el-form-item': FormItem,
    Input,
    DatePicker,
    Checkbox,
    Editor
  }
};
</script>
<style lang="scss" scoped>
.base {
  .row {
    display: flex;
    margin-bottom: 11px;

    .item {
      display: flex;
      align-items: flex-start;
    }

    .item-checkbox {
      height: 64px;
      display: flex;
      align-items: center;
      width: 190px;
      padding-top: 24px;
    }

    .input {
      width: 524px;
      margin-right: 24px;
      color: $blue-130 !important;
      font-size: 14px;
      line-height: 24px;
    }

    .date-picker {
      width: 155px;
      margin-right: 12px;
    }

    & ::v-deep label {
      display: inline-block;
      white-space: nowrap;
      margin: 0;
    }
  }

  .row:last-child {
    margin-bottom: 0;
  }
}
</style>
