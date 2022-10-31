<template>
  <div v-show="!hidden" class="scroll shadow-lvl-3">
    <a href="#" class="scroll__link">
      <Icon iconName="scrollTop" iconColor="#282F36" class="scroll__arrow" />
    </a>
  </div>
</template>

<script>
import Icon from 'Elements/Icon/Icon';

export default {
  name: 'ScrollTop',
  components: {
    Icon
  },
  data() {
    return {
      hidden: true
    };
  },
  methods: {
    handleScroll() {
      window.pageYOffset > 120 ? (this.hidden = false) : (this.hidden = true);
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style lang="scss" scoped>
.scroll {
  background-color: $blue-10;
  border-radius: 4px;

  &__link {
    display: block;
    padding: 8px 16px;
    text-decoration: none;
    color: $black-200;
  }
}
</style>

<style>
html {
  scroll-behavior: smooth;
}
</style>
