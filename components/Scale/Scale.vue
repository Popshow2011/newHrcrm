<template>
  <div class="scale">
    <div class="scale-row">
      <div
        v-for="i in 10"
        :key="i"
        class="scale-col fw-500"
        :class="{ 'scale-col--checked': i === localModel }"
      >
        <el-radio
          v-model="localModel"
          :label="i"
          @change.native="$emit(emitEvent, name, localModel)"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { Radio } from 'element-ui';
export default {
  props: {
    model: String,
    name: String,
    emitEvent: { type: String, default: 'set-value' }
  },
  data() {
    return { localModel: this.model || '' };
  },
  methods: {
    handleCheckChange() {
      this.checked = !this.checked;
    }
  },
  components: { 'el-radio': Radio }
};
</script>
<style lang="scss" scoped>
.scale {
  background-color: $white;
  border-radius: 4px;
  border: 1px solid $black-20;
  padding: 6px 7px;
  display: flex;
  flex-direction: row;

  &-row {
    border-radius: 4px;
    overflow: hidden;
    height: 32px;
    align-items: center;
    display: flex;
    flex: 1;
  }

  &-col {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    background-color: $black-20;

    &:not(:last-child) {
      margin-right: 4px;
    }

    &--checked {
      background-color: $blue-120;

      & ::v-deep .el-radio__label {
        color: $white !important;
      }
    }
  }

  & ::v-deep .el-radio {
    margin: 0 !important;
    display: flex !important;
    width: 100%;
    justify-content: center;
    align-items: center;
    height: 100%;
    cursor: pointer;
  }

  & ::v-deep .el-radio__input {
    display: none;
  }

  & ::v-deep .el-radio__label {
    font-family: 'Roboto', sans-serif;
    color: $black-190;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    padding: 0 !important;
    pointer-events: none;
  }
}
</style>
