<template>
  <div class="item">
    <div class="item-header">
      <div class="item-header__title">
        <h4>Аудитория</h4>
        <div>
          <Avatar />
          <p>{{ lectureCount }}</p>
        </div>
      </div>
      <div>
        <p class="item-header__create">Добавить</p>
      </div>
    </div>
    <div v-if="lectureCount" class="item-body">
      asd
    </div>
    <div v-else class="item-clear">
      <p>Для выбора кандидатов нажмите кнопку “добавить”</p>
    </div>
  </div>
</template>
<script>
import Avatar from 'Elements/SVG/Avatar';
export default {
  data() {
    return {
      lectureCount: 0
    };
  },
  components: { Avatar }
};
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  flex-direction: column;
  width: 384px;
  height: 100%;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 7px 9px rgba(0, 0, 0, 0.04);
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 16px;
    border-bottom: 1px solid $black-20;
    h4 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      line-height: 28px;
      color: $black-200;
    }

    &__title {
      display: flex;

      div {
        display: flex;
        align-items: center;
      }

      svg {
        min-width: 18px;
        width: 18px;
        height: 20px;
        margin: 0 11px;
      }

      p {
        font-weight: normal;
        font-size: 16px;
        line-height: 24px;
        color: $black-60;
      }
    }
    &__create {
      font-weight: normal;
      font-size: 16px;
      line-height: 24px;
      color: $blue-120;
    }
  }
  &-body {
    display: flex;
    flex-direction: column;
  }
  &-clear {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0 74px;
    p {
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      color: $black-100;
      text-align: center;
    }
  }
}
</style>
