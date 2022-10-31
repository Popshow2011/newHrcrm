<template>
  <div class="empty-list">
    <h3 class="disabled-reg">{{ mainText }}</h3>
    <span class="primary">{{ subText }}</span>
  </div>
</template>
<script>
export default {
  props: {
    mainText: {
      type: String,
      default: 'Ничего не найдено'
    },
    subText: {
      type: String,
      default: 'Попробуйте уточнить параметры фильтрации'
    }
  }
};
</script>
<style lang="scss" scoped>
.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f6f8f9;
  box-shadow: 0px 1px 4px rgba(33, 39, 44, 0.09);
  border-radius: 6px;
  width: 100%;
  height: 100%;

  h3 {
    font-size: 24px;
    line-height: 32px;
    font-weight: bold;
    margin: 0;
  }

  span {
    font-size: 15px;
    line-height: 24px;
  }
}
</style>
