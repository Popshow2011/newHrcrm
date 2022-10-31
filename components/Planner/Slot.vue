<template>
  <div
    class="slot"
    :class="[
      { 'slot--selected-left': isSelectedLeft && !isSelectedRight },
      { 'slot--selected-right': isSelectedRight && !isSelectedLeft },
      { 'slot--selected': isSelectedRight && isSelectedLeft }
    ]"
  >
    <div :class="`slot__area ${slotLeftAreaClasses}`"></div>
    <div :class="`slot__area ${slotRightAreaClasses}`"></div>
    <!-- <div class="slot__area">
      <div
        v-if="data.condition == 'disabled'"
        class="slot__area-left slot__area--disabled"
      ></div>
    </div>
    <div
      v-if="data.condition == 'disabled'"
      class="slot__area slot__area--disabled"
    ></div>
    <div
      v-if="data.condition == 'opened'"
      class="slot__area slot__area--opened"
    ></div>
    <div
      v-if="data.condition == 'filled'"
      :class="[
        'slot__area',
        { 'slot__area--filled': data.condition == 'filled' },
        { 'slot__area--filled-left': data.halfHour == 'first' },
        { 'slot__area--filled-right': data.halfHour == 'second' }
      ]"
    ></div>
    <div
      v-if="data.condition == 'selected'"
      :class="[
        'slot__area ',
        { 'slot__area--selected': isSelected },
        { 'slot__area--selected-left': data.halfHour == 'first' },
        { 'slot__area--selected-right': data.halfHour == 'second' }
      ]"
    ></div> -->
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
    isSelectedLeft: {
      type: Boolean,
      default: false
    },
    isSelectedRight: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  computed: {
    slotLeftAreaClasses() {
      let classes = '';
      switch (this.data.condition) {
        case 'disabled': {
          classes += 'slot__area--disabled';
          break;
        }
        case 'filled': {
          this.data.halfHour == '' || this.data.halfHour == 'first'
            ? (classes += 'slot__area--filled')
            : (classes += 'slot__area--opened');
          break;
        }
        case 'opened': {
          classes += 'slot__area--opened';
          break;
        }
      }
      return classes;
    },
    slotRightAreaClasses() {
      let classes = '';
      switch (this.data.condition) {
        case 'disabled': {
          classes += 'slot__area--disabled';
          break;
        }
        case 'filled': {
          this.data.halfHour == '' || this.data.halfHour == 'second'
            ? (classes += 'slot__area--filled')
            : (classes += 'slot__area--opened');
          break;
        }
        case 'opened': {
          classes += 'slot__area--opened';
          break;
        }
      }
      return classes;
    }
  }
};
</script>

<style lang="scss" scoped>
.slot {
  display: flex;
  align-items: center;
  min-width: 60px;
  background-color: $white;
  margin-right: 1px;

  &--selected {
    background: $blue-40 !important;
    // width: 100%;

    &-left {
      background: linear-gradient(to right, $blue-40 50%, transparent 50%);
      // width: 100%;
    }

    &-right {
      background: linear-gradient(to right, transparent 50% 50%, $blue-40 50%);
      // width: 100%;
    }
  }

  &__area {
    width: 50%;

    &__start-select {
      background: linear-gradient(to right, $blue-40, transparent 50%);
    }

    &--disabled {
      height: 41%;
      background: $black-40;
    }

    &--filled {
      height: 41%;
      background: $blue-130;

      &-left {
        background: linear-gradient(to right, $blue-130, transparent 50%);
      }

      &-right {
        background: linear-gradient(to left, $blue-130, transparent 50%);
      }
    }

    &--opened {
      height: 76.5%;
      background: $green-80;
    }
  }

  &:first-of-type {
    border-radius: 8px 0 0 8px;
    padding-left: 8px;
    width: 68px;

    .slot__inner {
      border-radius: 4px 0px 0px 4px;
    }
  }

  &:last-of-type {
    border-radius: 0 8px 8px 0;
    padding-right: 8px;
    width: 68px;

    .slot__inner {
      border-radius: 0px 4px 4px 0px;
    }
  }
}
</style>
