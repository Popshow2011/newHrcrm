<template>
  <el-popover
    :placement="placement"
    width="auto"
    trigger="hover"
    :offset="4"
    class="form-help"
    :popper-class="popperClass"
  >
    <span v-html="formatHtml(text)"></span>
    <i slot="reference" :class="iconClass"></i>
  </el-popover>
</template>
<script>
import { Popover } from 'element-ui';
import { mixin } from '@/utils/mixins';

export default {
  mixins: [mixin],
  components: {
    'el-popover': Popover
  },
  props: {
    text: String,
    iconClass: {
      type: String,
      default: 'el-icon-info'
    },
    popperClass: String,
    placement: {
      type: String,
      default: 'top-start'
    }
  }
};
</script>
