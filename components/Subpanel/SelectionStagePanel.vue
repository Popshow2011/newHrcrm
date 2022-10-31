<template>
  <div
    class="right-panel-card"
    :class="{ disabled, selected }"
    @click="selectStage"
  >
    <div class="card-items">
      <p class="items-title">{{ stage.name }}</p>
      <div class="card-bottom">
        <div class="bottom-text">
          <Icon iconName="User-bold" :iconColor="iconColor" />
          <p class="text" :class="{ blue: !disabled }">{{ candidateText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Icon from 'Elements/Icon/Icon';
import { store } from '@/store';
export default {
  components: { Icon },
  props: {
    mode: {
      type: String,
      default: ''
    },
    stage: Object
  },
  computed: {
    responseMode() {
      return store.state.selectionPanel.responseMode;
    },
    selected() {
      if (this.mode != 'response') {
        return this.disabled ? false : this.stage.selected;
      } else return this.responseMode;
    },
    candidateText() {
      var num = parseInt(this.stage.count);
      if (num > 100) num = num % 100;
      if (num <= 20 && num >= 10) return this.stage.count + ' кандидатов';
      if (num > 20) num = num % 10;
      return num === 1
        ? this.stage.count + ' кандидат'
        : num > 1 && num < 5
        ? this.stage.count + ' кандидата'
        : this.stage.count + ' кандидатов';
    },
    disabled() {
      return this.stage.count == 0 || this.stage.visibility == 'disabled'
        ? true
        : false;
    },
    iconColor() {
      return !this.disabled ? '#2d81ce' : '#99a5b3';
    }
    // stage_id() {
    //   return `${this.stage.vacancy_id}_${this.stage.id}`;
    // }
  },
  methods: {
    selectStage() {
      if (!this.disabled) {
        if (this.mode != 'response') {
          this.selected
            ? this.$emit(
                'deselectStage',
                `${this.stage.vacancy_id}_${this.stage.id}`
              )
            : this.$emit(
                'selectStage',
                `${this.stage.vacancy_id}_${this.stage.id}`
              );
          this.selected = !this.selected;
        } else {
          store.commit('selectionPanel/setResponseMode', !this.responseMode);
          this.$set(this.stage, 'selected', !this.responseMode);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.right-panel-card {
  margin: 5px;
  border: 1px solid $black-20;
  border-radius: 4px;
  background: $white;
  padding: 16px;

  &.disabled {
    background: $black-10;

    p {
      color: $black-60;
    }

    &:hover {
      border-color: $black-20;
    }
  }

  &.selected {
    border-color: $blue-130;
  }

  &:not(.disabled) {
    cursor: pointer;

    * {
      cursor: pointer;
    }
  }
}

.items-title {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  max-width: 310px;
  line-height: 20px;
  text-align: left;
}

.card {
  &-items {
    justify-content: space-between;
  }

  &-bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    &-button {
      margin-left: -4px;
      margin-bottom: -5px;
    }
  }
}

.bottom {
  &-text {
    display: flex;
    flex-direction: row;
  }
}

.blue {
  color: $blue-120;
}

.right-panel-card:hover {
  border: 1px solid $blue-130;
}

.right-panel-card:disabled {
  background: #faf9f9;
  border: 1px solid #e2e2e2;

  .items-title {
    color: $black-10;
  }

  &::v-deep svg {
    path {
      fill: $black-10 !important;
    }
  }

  .blue {
    color: $black-10;
  }
}

.button-content-text {
  margin: 0;
}

.el-card-body {
  padding: 10px;
}

.text {
  align-self: center;
  font-size: 14px !important;
  margin: 0 8px !important;
}
</style>
