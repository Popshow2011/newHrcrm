<template>
  <div>
    <el-switch
      v-model="value"
      @change="$emit('switchMessenger', value)"
    ></el-switch>
  </div>
</template>
<script>
import { Switch } from 'element-ui';
export default {
  data() {
    return {
      value: true
    };
  },
  // watch: {
  //   value: {
  //     handler: function(newVal, oldVal) {
  //       console.log(newVal, oldVal);
  //     },
  //     deep: true
  //   }
  // },
  components: {
    'el-switch': Switch
  }
};
</script>

<style lang="scss" scoped>
.el-switch {
  height: 40px;

  &__core {
    background: $black-10;
    border-radius: 4px;
    width: 96px !important;
    height: 40px;
    border: none;

    &::before {
      margin: 8px 0 8px 58px;
      position: absolute;
      content: url('../../../assets/img/grayTelegram.svg');
      box-sizing: content-box;
    }

    &::after {
      width: 24px;
      height: 24px;
      background: $white;
      box-shadow: 0px 1px 4px rgba(33, 39, 44, 0.09);
      border-radius: 4px;
      // margin: 4px;
      left: 4px;
      top: 4px;
      position: absolute;
      justify-content: center;
      padding: 4px 10px;
      content: url('../../../assets/img/whatsapp.svg');
      box-sizing: content-box;
    }
  }

  &.is-checked {
    .el-switch__core {
      background: $black-10;

      &::before {
        margin: 8px 0 8px 14px;
        position: absolute;
        content: url('../../../assets/img/grayWhatsapp.svg');
      }

      &::after {
        margin-left: -48px;
        content: url('../../../assets/img/blueTelegram.svg');
      }
    }
  }
}
</style>
