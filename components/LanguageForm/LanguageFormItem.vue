<template>
  <div class="item" v-if="item.fields">
    <el-form-item
      :label="schema.id_language.lbl"
      :prop="`${item.id}__id_language`"
      :rules="rules[`${item.id}__id_language`]"
    >
      <Dropdown
        :options="schema.id_language.options"
        :field="{
          ...schema.id_language,
          name: `${item.id}__id_language`,
          disabled,
          type: 'enum',
          placeholder: 'Не выбрано',
          required: true
        }"
        filterable
        :model="item.fields[0].value"
        @set-value="(name, val) => handleChange({ id_language: val })"
        class="language-type"
      />
    </el-form-item>
    <el-form-item
      :label="schema.level.lbl"
      :prop="`${item.id}__level`"
      :rules="rules[`${item.id}__level`]"
    >
      <Dropdown
        :options="schema.level.options"
        filterable
        :field="{
          ...schema.level,
          name: `${item.id}__level`,
          disabled,
          type: 'enum',
          placeholder: 'Не выбрано',
          required: true
        }"
        :model="item.fields[1].value"
        @set-value="(name, val) => handleChange({ level: val })"
        class="language-level"
      />
    </el-form-item>
    <Button
      buttonColor="transparent"
      buttonText=""
      iconName="delete"
      hasLeftIcon
      iconColor="#CDD4DA"
      :disabled="disabled"
      class="delete-button"
      @click.prevent="() => handleChange()"
    />
  </div>
</template>
<script>
import { FormItem } from 'element-ui';
import Dropdown from 'Elements/Select/Dropdown';
import Button from 'Elements/Button/Button';
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
    },
    disabled: Boolean
  },
  data() {
    return {
      rules: {}
    };
  },
  created() {
    if (!this.item.fields) return;

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
    Dropdown,
    Button
  }
};
</script>
<style lang="scss" scoped>
.item {
  width: 100%;
  display: flex;
  align-items: center;

  .language-level,
  .language-type {
    margin-right: 12px;
    width: calc(100% - 12px);
  }

  & ::v-deep label {
    margin: 0;
  }

  & ::v-deep .el-form-item__error {
    display: none;
  }

  .delete-button {
    align-self: flex-start;
    height: 40px;
    position: relative;
    margin-top: 24px !important;
    cursor: pointer;

    &:hover {
      background: none;

      & ::v-deep path {
        fill: $black-50 !important;
      }
    }

    &:disabled {
      background: $black-30;
      color: $black-40;
    }
  }
}
</style>
