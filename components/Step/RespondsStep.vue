<template>
  <div
    class="vacancy-step"
    @click="selectStep"
    :class="{ 'no-focus': !Number(count) }"
  >
    <div class="vacancy-step__wrapper">
      <p class="step-name primary">Отклики</p>
      <div class="step-info">
        <div class="step-info__candidates">
          <Icon
            iconName="User-light"
            :iconColor="Number(count) ? '#0075DB' : '#99A5B3'"
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
    count: {
      type: Number
    }
  },
  computed: {
    candidateText() {
      // проверить существующий миксин
      var num = parseInt(this.count);
      if (num > 100) num = num % 100;
      if (num <= 20 && num >= 10) return this.count + ' кандидатов';
      if (num > 20) num = num % 10;
      return num === 1
        ? this.count + ' кандидат'
        : num > 1 && num < 5
        ? this.count + ' кандидата'
        : this.count + ' кандидатов';
    },
    fields() {
      return store.state.vacancy.fields;
    }
  },
  methods: {
    selectStep() {
      this.$emit('select-responds', true);
    }
  },
  destroy() {
    this.$emit('select-responds', false);
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
