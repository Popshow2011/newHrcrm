<template>
  <div
    class="vacancy-step"
    @click="selectStep"
    :class="{ 'no-focus': disabledStep }"
  >
    <div class="vacancy-step__wrapper">
      <p class="step-name primary">{{ step.name }}</p>
      <div class="step-info">
        <div class="step-info__candidates">
          <Icon
            iconName="User-light"
            :iconColor="!disabledStep ? '#0075DB' : '#99A5B3'"
          />
          <p class="text blue">{{ candidateText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { store } from '@/store';
import Icon from 'Elements/Icon/Icon';
export default {
  components: { Icon },
  props: {
    step: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    candidateText: function () {
      // проверить существующий миксин
      var num = parseInt(this.step.count);
      if (num > 100) num = num % 100;
      if (num <= 20 && num >= 10) return this.step.count + ' кандидатов';
      if (num > 20) num = num % 10;
      return num === 1
        ? this.step.count + ' кандидат'
        : num > 1 && num < 5
        ? this.step.count + ' кандидата'
        : this.step.count + ' кандидатов';
    },
    disabledStep() {
      return !Number(this.step.count) || this.step.visibility == 'disabled';
    }
  },
  methods: {
    selectStep() {
      if (this.disabledStep) return;

      store.commit('vacancy/setParam', {
        name: 'selectedStage',
        val: this.step
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.vacancy-step {
  margin: 4px 8px 8px;
  border: 1px solid $black-30;
  border-radius: 4px;
  background-color: $white;
  padding: 16px;

  &:not(.no-focus) {
    cursor: pointer;

    * {
      cursor: pointer;
    }
  }

  &.no-focus {
    pointer-events: none;
    background-color: $black-10;
    border-color: $black-20;

    .step-name {
      color: $black-60 !important;
    }

    .step-info .text {
      color: $black-80 !important;
    }
  }

  &__wrapper {
    justify-content: space-between;
  }

  &:hover {
    border: 1px solid $blue-100;
  }
}

.step-name {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: $black-200;
  // max-width: 310px;
  line-height: 20px;
}

.step-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  &__candidates {
    display: flex;
    flex-direction: row;
    align-items: center;

    & ::v-deep .text {
      font-size: 14px !important;
      line-height: 20px;
      margin-left: 8px !important;
    }
  }
}

.text {
  align-self: center;
  -ms-grid-row-align: center;
  font-size: 14px;
  margin: 2px 5px 0 5px;
}
</style>
