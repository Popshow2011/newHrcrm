<template>
  <div class="search-column">
    <div class="search-column__column">
      <Icon iconName="draggable" class="icon-handle" />
      <p class="search-column__text">{{ column.label }}</p>
    </div>
    <Checkbox
      class="search-column__checkbox"
      :value="Number(selected)"
      @change="handleSelect"
      :disabled="column.readonly"
    />
  </div>
</template>

<script>
import Icon from 'Elements/Icon/Icon';
import Checkbox from 'Elements/Checkbox/CustomCheckbox';
export default {
  props: {
    column: Object
  },
  created() {
    this.selected = this.column.selected;
  },
  data() {
    return {
      selected: false
    };
  },
  methods: {
    handleSelect(val) {
      this.selected = Boolean(val);
      this.$emit('set-selected', {
        order: this.column.order,
        value: Boolean(val)
      });
    }
  },
  components: { Icon, Checkbox }
};
</script>

<style lang="scss" scoped>
.search-column {
  display: flex;
  padding: 12px 0 16px 0;
  justify-content: space-between;

  &__column {
    display: flex;
    gap: 12px;
  }

  &__text {
    font-size: 16px;
    color: $black-200;
    word-break: break-word;
  }

  &__checkbox {
    margin: 0;
  }

  &:not(:last-of-type) {
    border-bottom: 1px solid $black-20;
  }
}
</style>