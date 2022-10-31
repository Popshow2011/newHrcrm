<template>
  <div class="base">
    <div class="row">
      <div class="item" v-if="!isAverageEducation">
        <el-form-item
          :prop="`${item.id}__university`"
          :rules="rules[`${item.id}__university`]"
          :label="schema.university.lbl"
          class="input"
        >
          <Input
            :field="{ ...schema.university, name: `${item.id}__university` }"
            :model="item.fields[0].value"
            @set-value="
              (name, val) =>
                handleChange({
                  [schema.university.name]: val
                })
            "
          />
        </el-form-item>
      </div>
      <div class="item">
        <el-form-item
          :label="schema.education_lvl.lbl"
          :rules="rules[`${item.id}__education_lvl`]"
          :prop="`${item.id}__education_lvl`"
          class="select"
        >
          <Dropdown
            :field="{
              ...schema.education_lvl,
              name: `${item.id}__education_lvl`
            }"
            :model="item.fields[3].value"
            filterable
            :options="schema.education_lvl.options"
            @set-value="
              (name, val) => handleChange({ [schema.education_lvl.name]: val })
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
    <div class="row" v-if="!isAverageEducation">
      <div class="item">
        <el-form-item
          :prop="`${item.id}__specialization`"
          :rules="rules[`${item.id}__specialization`]"
          :label="schema.specialization.lbl"
          class="input"
        >
          <Input
            :field="{
              ...schema.specialization,
              name: `${item.id}__specialization`
            }"
            :model="item.fields[1].value"
            @set-value="
              (name, val) =>
                handleChange({
                  [schema.specialization.name]: val
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
import Dropdown from 'Elements/Select/Dropdown';

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
  computed: {
    isAverageEducation() {
      const education = this.item.fields.find(
        ({ name }) => name === 'education_lvl'
      );
      return !education.value || education.value === 'average';
    }
  },
  methods: {
    handleChange(fields = {}) {
      this.$emit('set-value', this.item, this.index, fields);
    }
  },
  components: {
    'el-form-item': FormItem,
    Input,
    DatePicker,
    Dropdown
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

    .select {
      width: 365px;
      margin-right: 8px;
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
