<template>
  <div class="root">
    <div class="wrapper">
      <el-avatar icon="el-icon-user-solid">{{ title }}</el-avatar>
      <el-button>{{ title }}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    }
  }
};
</script>
<style lang="scss" scoped>
.root {
  display: flex;

  .wrapper {
    display: flex;
    flex-direction: column;
    * {
      margin-bottom: 10px;
    }
  }
}
</style>
