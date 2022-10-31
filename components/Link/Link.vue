<template>
  <a
    v-bind="$attrs"
    :style="{ color }"
    :target="target"
    @mouseenter="changeColorToDarkBlue"
    @mouseleave="changeColorToLightBlue"
    class="hyperlink"
    :class="{ 'is-underline': underline }"
  >
    <Icon
      v-if="hasLeftIcon"
      iconName="Link"
      :iconColor="color"
      class="hyperlink__left-icon"
    />
    <span class="hyperlink__text">
      {{ text }}
      <!-- <el-link
        v-bind="$attrs"
        :style="{ color }"
        type="primary"
        :target="target"
        >{{ text }}</el-link
      > -->
    </span>
    <Icon
      v-if="hasRightIcon"
      iconName="Link"
      :iconColor="color"
      class="hyperlink__right-icon"
    />
  </a>
</template>
<script>
// import { Link } from 'element-ui';
import Icon from 'Elements/Icon/Icon';
export default {
  name: 'Link',
  inheritAttrs: false,
  components: { Icon },
  data() {
    return {
      isOver: true,
      color: '#0075DB'
    };
  },
  props: {
    text: {
      type: String,
      default: 'Новая ссылка'
    },
    hasLeftIcon: {
      type: Boolean,
      default: false
    },
    hasRightIcon: {
      type: Boolean,
      default: false
    },
    target: {
      type: String,
      default: '_self'
    },
    underline: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    changeColorToDarkBlue: function () {
      this.color = '#006BC9';
    },
    changeColorToLightBlue: function () {
      this.color = '#0075DB';
    }
  }
};
</script>
<style lang="scss" scoped>
.hyperlink {
  display: flex;
  align-items: center;
  font-size: 16px;
  line-height: 24px;
  color: $blue-120;

  &:hover {
    color: $blue-130;
  }

  &.is-underline &__text {
    border-bottom: 1px solid;
    margin-bottom: -1px;
  }

  &__text {
    // display: flex;
    // padding-top: 1px;
    position: relative;
    color: inherit;

    &:before {
      content: '';
      height: 1px;
      width: 100%;
      position: absolute;
      display: inline-block;
      bottom: 0;
      background: inherit;
    }
  }
}

// .el-link--primary {
//   border-bottom: 1px solid $blue-120;
//   margin-right: 0;

//   &.is-underline:hover::after {
//     border-bottom: 0 solid $blue-120;
//   }
// }
</style>
