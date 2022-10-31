<template>
  <el-progress
    :percentage="percentage"
    :stroke-width="12"
    :show-text="false"
    :color="colors"
    :class="type || ''"
  ></el-progress>
</template>

<script>
import { Progress } from 'element-ui';
export default {
  props: {
    percentage: {
      type: Number,
      default: 0
    },
    type: {
      // отказ
      type: [String, Boolean],
      default: false
    },
    color: {
      type: String
    },
    cancelled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    progresbarColors() {
      return [
        { color: '#e9edf2', percentage: 0 },
        { color: '#FBA628', percentage: 33 },
        { color: '#FFD338', percentage: 66 },
        { color: '#3DB449', percentage: 100 }
      ];
    },
    colors() {
      return this.cancelled
        ? '#EE1C1C'
        : this.color
        ? this.color
        : this.progresbarColors;
    }
  },
  components: { 'el-progress': Progress }
};
</script>

<style lang="scss">
.el-progress-bar {
  background-color: $black-20;
  border-radius: 4px;
  max-width: 336px;
  height: 12px;
  position: static;
}

.el-progress-bar__inner {
  border-radius: 4px;
  height: 12px;
  position: relative;
}

.el-progress-bar__outer {
  border-radius: 4px;
  height: 12px;
  position: static;
}

// .el-progress-line {
//   background-color: $black-20;
//   border-radius: 4px;
//   height: 12px;
// }

.el-progress.warning .el-progress-bar__inner {
  background-color: $red !important;
}

// .el-progress.orange .el-progress-bar__inner {
//   // background-color: unset;
//   border-radius: 4px;
//   // background: linear-gradient(90deg, #ffc266 0%, #d77a24 129.17%);
// }

// .el-progress.yellow .el-progress-bar__inner {
//   // background-color: unset;
//   border-radius: 4px;
//   // background: linear-gradient(90deg, #edff5c 0%, #d5c004 129.17%);
// }

// .el-progress.green .el-progress-bar__inner {
//   // background-color: unset;
//   border-radius: 4px;
//   // background: linear-gradient(90deg, #67e453 0%, #1f8235 129.17%);
// }

// .el-progress.red .el-progress-bar__inner {
//   // background-color: unset;
//   border-radius: 4px;
//   // background: linear-gradient(90deg, #ff8686 0%, #ec2222 129.17%);
// }
</style>
