<template>
  <div>
    <Select
      v-bind="$attrs"
      :model="localModel"
      :field="{
        ...$attrs,
        name,
        placeholder,
        filterable,
        multiple: true,
        type: 'relate'
      }"
      :size="$attrs.size"
      :options="newOptions"
      :arrow-multiselect-focus="true"
      class="multiselect"
      @set-value="onChange"
      @filter-option="filterOption"
      :popper-class="$attrs['popper-class']"
    />
    <div class="tag-frame">
      <Tag
        v-for="tag in value"
        :key="`${tag}-tag`"
        :id="tag"
        @close="removeValue"
        size="middle"
        closable="true"
        :name="formatHtml(options[tag])"
        class="tag-frame__item"
      />
    </div>
  </div>
</template>

<script>
import Select from './Dropdown';
import Tag from 'Elements/Tag/Tag';
import { mixin } from '@/utils/mixins';
export default {
  inheritAttrs: false,
  mixins: [mixin],
  props: {
    name: String,
    value: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
    },
    filterable: Boolean
  },
  data() {
    return {
      localModel: this.value || [],
      newOptions: this.options
    };
  },
  methods: {
    onChange(name, value) {
      this.localModel = value;
      this.$emit('input', value);
    },
    removeValue(event, id) {
      const newValue = this.value.filter(value => value !== id);
      this.$emit('input', newValue);
    },
    filterOption(searchString) {
      if (searchString) {
        this.newOptions = {};
        for (let i in this.options) {
          if (
            this.options[i].toLowerCase().includes(searchString.toLowerCase())
          ) {
            this.newOptions[i] = this.options[i];
          }
        }
      } else {
        this.newOptions = this.options;
      }
    }
  },
  watch: {
    value: function () {
      this.localModel = this.value || [];
    }
  },
  components: { Select, Tag }
};
</script>

<style lang="scss" scoped>
.tag-frame {
  margin-top: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &__item {
    margin-top: 8px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.multiselect {
  width: 100%;

  & ::v-deep .el-select__caret.is-reverse {
    transform: rotateZ(180deg);
  }

  & ::v-deep .el-select__caret {
    transform: rotateZ(0deg);
  }

  & ::v-deep .el-icon-arrow-up::before {
    content: url('../../../assets/img/arrow-down.svg');
  }

  & ::v-deep .el-input__icon {
    line-height: 20px;
    padding-bottom: 2px;
  }

  & ::v-deep .el-select__tags {
    display: none;
  }

  & ::v-deep .el-select__tags > input {
    border: none;
    background-color: transparent;
  }
}
</style>
