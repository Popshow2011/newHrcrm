<template>
  <el-tooltip
    :placement="placement"
    :disabled="disabled"
    :effect="effect"
    :popper-class="popperClass"
    :content="content"
  >
    <div v-if="htmlContent" slot="content" v-html="htmlContent"></div>
    <slot></slot>
  </el-tooltip>
</template>

<script>
import { Tooltip } from 'element-ui';
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      default: 'top'
    },
    effect: {
      type: String,
      default: 'light'
    },
    popperClass: {
      type: [String, Array],
      default: 'dark'
    },
    content: String,
    htmlContent: String
  },
  components: { 'el-tooltip': Tooltip }
};
</script>
<style lang="scss">
.el-tooltip__popper {
  max-width: 280px; // 80%

  &.is-default {
    font-family: Roboto, sans-serif;
    font-size: 15px;
    line-height: 24px;
    color: $black-130;
    background-color: $white;
    border: 1px solid $grey8;
    padding: 2px 4px;
    filter: drop-shadow(0px 0px 55px rgba(33, 39, 44, 0.1));

    &[x-placement^='top'] .popper__arrow {
      border-top-color: $grey8;
    }

    &[x-placement^='bottom'] .popper__arrow {
      border-bottom-color: $grey8;
    }

    &[x-placement^='left'] .popper__arrow {
      border-left-color: $grey8;
    }

    &[x-placement^='right'] .popper__arrow {
      border-right-color: $grey8;
    }

    .popper__arrow {
      bottom: -6.5px;
    }
  }

  &.dark {
    background: $grey80;
    border: 1px solid $grey80;
    color: $white;
    font-weight: 500;
    line-height: 20px;
    padding: 4px 8px;
    font-size: 14px;

    &[x-placement^='top'] .popper__arrow:after {
      border-top-color: $grey80;
    }

    &[x-placement^='bottom'] .popper__arrow:after {
      border-bottom-color: $grey80;
    }

    &[x-placement^='left'] .popper__arrow:after {
      border-left-color: $grey80;
    }

    &[x-placement^='right'] .popper__arrow:after {
      border-right-color: $grey80;
    }

    .popper__arrow {
      bottom: -6.5px;
    }
  }
}
</style>
