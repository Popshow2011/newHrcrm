<template>
  <div class="base">
    <div class="row">
      <div class="item">
        <el-form-item
          :label="schema.language_proficiency.lbl"
          :rules="rules[`${item.id}__language_proficiency`]"
          :prop="`${item.id}__language_proficiency`"
          class="select"
        >
          <Dropdown
            :field="{
              ...schema.language_proficiency,
              name: `${item.id}__language_proficiency`
            }"
            :model="item.fields[0].value"
            filterable
            :options="schema.language_proficiency.options"
            @set-value="
              (name, val) =>
                handleChange({ [schema.language_proficiency.name]: val })
            "
          />
        </el-form-item>
      </div>
      <div class="item">
        <el-form-item
          :label="schema.language_proficiency_lvl.lbl"
          :rules="rules[`${item.id}__language_proficiency_lvl`]"
          :prop="`${item.id}__language_proficiency_lvl`"
          class="select"
        >
          <Dropdown
            :field="{
              ...schema.language_proficiency_lvl,
              name: `${item.id}__language_proficiency_lvl`
            }"
            :model="item.fields[1].value"
            filterable
            :options="schema.language_proficiency_lvl.options"
            @set-value="
              (name, val) =>
                handleChange({ [schema.language_proficiency_lvl.name]: val })
            "
          />
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script>
import { FormItem } from 'element-ui';
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
      rules: {}
    };
  },
  created() {
    this.item.fields.forEach(item => {
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
