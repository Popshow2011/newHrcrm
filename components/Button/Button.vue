<template>
  <el-button
    v-loading="loading"
    v-bind="$attrs"
    :class="{
      blueButton: buttonColor === 'blue',
      darkBlueButton: buttonColor === 'darkBlue',
      transparentButton: buttonColor === 'transparent',
      whiteButton: buttonColor == 'white',
      'shadow-lvl-1': buttonColor == 'white',
      big: buttonSize === 'big',
      medium: buttonSize === 'medium',
      small: buttonSize === 'small',
      noPointer,
      fullWidth
    }"
    :disabled="disabled || loading"
    @click="click"
  >
    <div
      class="button-content"
      :class="[!buttonText ? 'button-content--empty' : '']"
    >
      <Icon
        v-if="hasLeftIcon"
        :icon-name="iconName"
        style="margin-right: 4px"
        :icon-color="contentColor"
      />
      <a
        v-if="link && buttonText"
        :href="link"
        :style="{ color: contentColor }"
        class="content-text"
      >
        {{ buttonText }}
      </a>
      <p
        v-if="buttonText && !link"
        class="content-text"
        :style="{ color: contentColor }"
      >
        {{ buttonText }}
      </p>
      <Icon
        v-if="hasRightIcon"
        :icon-name="iconName"
        :icon-color="contentColor"
        style="margin-left: 4px"
      />
    </div>
  </el-button>
</template>
<script>
import { Button } from 'element-ui';
import Icon from 'Elements/Icon/Icon';
export default {
  name: 'Button',
  inheritAttrs: false,
  props: {
    buttonSize: {
      type: String,
      default: 'medium'
    },
    buttonColor: {
      type: String,
      default: 'blue'
    },
    buttonText: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    iconColor: {
      type: String,
      default: ''
    },
    hasLeftIcon: {
      type: Boolean,
      default: false
    },
    hasRightIcon: {
      type: Boolean,
      default: false
    },
    iconName: {
      type: String,
      default: ''
    },
    loading: Boolean,
    link: String,
    target: {
      type: String,
      default: '_self'
    },
    noPointer: {
      type: Boolean,
      default: false
    },
    fullWidth: Boolean
  },
  components: {
    'el-button': Button,
    Icon
  },
  computed: {
    contentColor: function () {
      if (this.iconColor) return this.iconColor;

      if (this.buttonColor === 'darkBlue') {
        return this.disabled ? '#788694' : '#FFFFFF';
      } else if (this.buttonColor === 'blue') {
        return this.disabled ? '#788694' : '#0075DB';
      } else if (this.buttonColor === 'transparent') {
        return this.disabled ? '#62717E' : '#0075DB';
      } else if (this.buttonColor === 'white') {
        return this.disabled ? '#788694' : '#62717E';
      } else return '#FFFFFF';
    }
  },
  methods: {
    click(e) {
      if (this.disabled) {
        return;
      }

      if (this.link && this.target == '_self') {
        location.replace(this.link);
        return;
      }

      if (this.link && this.target == '_blank') {
        window.open(this.link);
        return;
      }

      this.$emit('click', e);
    }
  }
};
</script>
<style lang="scss" scoped>
.el-button {
  display: inline-block;
  font-family: 'Roboto Medium';
  vertical-align: middle;
  border-radius: 4px;
  border: none;
  position: relative;
  padding: 0;
  margin: 0;

  &:not(:last-of-type) {
    margin-right: 12px;
  }

  & + .el-button {
    margin-left: 0;
  }

  &.big {
    padding: 8px 0;

    & ::v-deep .button-content {
      margin: 0 16px;
    }
  }

  &.medium {
    padding: 4px 0;

    & ::v-deep .button-content {
      margin: 0 12px;
    }
  }

  &.small {
    padding: 0;

    & ::v-deep .button-content {
      margin: 0 8px;
    }
  }

  &.is-round {
    padding: 0 !important;
  }

  & > span {
    display: inline-block;
  }

  &.noPointer * {
    pointer-events: none;
  }

  &.fullWidth {
    width: 100%;
  }

  &.is-disabled {
    opacity: 1;

    * {
      cursor: not-allowed;
    }
  }

  & ::v-deep svg {
    margin: 0 !important;
  }
}

.blueButton {
  background-color: $blue8;

  & ::v-deep .content-text {
    color: $blue64;
  }

  &:hover {
    background-color: $blue12;
  }

  &:active {
    background-color: $blue24;
  }

  &:focus {
    background-color: $blue8;
    border: 2px solid $blue80;
  }

  &:disabled {
    background-color: $grey12;

    & ::v-deep .content-text {
      color: $grey40 !important;
    }
  }
}

.darkBlueButton {
  background-color: $blue40;
  color: $white;

  & ::v-deep .content-text {
    color: $white;
  }

  &:hover {
    background-color: $blue64;
  }

  &:active {
    background-color: $blue72;
  }

  &:focus {
    background-color: $blue40;
    border: 2px solid $blue80;
  }

  &:disabled {
    background-color: $grey12;
    color: $grey40;

    & ::v-deep .content-text {
      color: $grey40 !important;
    }
  }
}

.transparentButton {
  background-color: transparent;

  & ::v-deep .content-text {
    color: $blue64;
  }

  &:active {
    color: $blue80;
  }

  &:focus {
    color: $blue64;
    border: 2px solid $blue80;
  }

  &:disabled {
    background-color: transparent !important;

    & ::v-deep .content-text {
      color: $grey64 !important;
    }
  }
}

.whiteButton {
  background-color: $white;

  & ::v-deep .content-text {
    color: $grey64;
  }

  &:hover {
    border: 1px solid $blue40;
  }

  &:active {
    border: 1px solid $blue64;
  }

  &:focus {
    border: 2px solid $blue80;
  }

  &:disabled {
    background-color: $grey12 !important;
    border: none;

    & ::v-deep .content-text {
      color: $grey40;
    }
  }
}

.button-content {
  display: flex;
  gap: 4px;
  flex-direction: row;
  justify-content: center;
  height: 24px;

  &-icon {
    padding-bottom: 2px;
  }
}

.content-text {
  align-self: center;
  -ms-grid-row-align: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
}
</style>
<style>
.noPointer span {
  pointer-events: none;
  display: inline-block;
}
</style>
