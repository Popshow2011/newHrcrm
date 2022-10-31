<template>
  <div class="base">
    <div class="row">
      <div class="item">
        <el-form-item
          :label="schema.organization.lbl"
          :rules="rules[`${item.id}__organization`]"
          :prop="`${item.id}__organization`"
          class="input"
        >
          <Input
            :field="{
              ...schema.organization,
              name: `${item.id}__organization`
            }"
            :model="item.fields[0].value"
            @set-value="
              (name, val) =>
                handleChange({
                  [schema.organization.name]: val
                })
            "
          />
        </el-form-item>
      </div>
      <div class="item">
        <el-form-item
          :prop="`${item.id}__year_of_graduation`"
          :rules="rules[`${item.id}__year_of_graduation`]"
          :label="schema.year_of_graduation.lbl"
          class="date-picker"
        >
          <DatePicker
            :field="{
              ...schema.year_of_graduation,
              name: `${item.id}__year_of_graduation`
            }"
            :model="item.fields[2].value"
            :options="pickerOptions"
            picker-type="year"
            @set-value="
              (name, val) =>
                handleChange({ [schema.year_of_graduation.name]: val })
            "
          />
        </el-form-item>
      </div>
    </div>
    <div class="row">
      <div class="item">
        <el-form-item
          :label="schema.course_name.lbl"
          :rules="rules[`${item.id}__course_name`]"
          :prop="`${item.id}__course_name`"
          class="input"
        >
          <Input
            :field="{ ...schema.course_name, name: `${item.id}__course_name` }"
            :model="item.fields[1].value"
            @set-value="
              (name, val) =>
                handleChange({
                  [schema.course_name.name]: val
                })
            "
          />
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script>
import { FormItem } from 'element-ui';
import Input from 'Elements/Input/Input';
import DatePicker from 'Elements/DatePicker/DatePicker';

export default {
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
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          // disabled year + 10
          var date = new Date();
          date = date.getFullYear() + 10;
          return time.getFullYear() > date;
        }
      },
      rules: {}
    };
  },
  created() {
    this.item.fields.map(item => {
      if (!this.schema[item.name]) return;

      if (this.schema[item.name].required) {
        this.$set(this.rules, `${this.item.id}__${item.name}`, {
          required: true,
          message: 'Необходимо заполнить поле',
          trigger: ['blur', 'focus', 'change']
        });
      }
    });
  },
  methods: {
    handleChange(fields = {}) {
      this.$emit('set-value', this.item, this.index, fields);
    }
  },
  components: {
    'el-form-item': FormItem,
    Input,
    DatePicker
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

    .input {
      width: 524px;
      margin-right: 24px;
      color: $blue-130 !important;
      font-size: 14px;
      line-height: 24px;
    }

    .date-picker {
      width: 155px;
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
