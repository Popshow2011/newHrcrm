<template>
  <div class="search">
    <div class="search__wrapper">
      <search-icon class="search__icon" />
      <Input
        size="medium"
        :field="{ name: 'search', placeholder: 'ФИО' }"
        @set-value="search"
        :model="query"
        class="search__input"
      />
      <div class="search__results shadow-lvl-2">
        <slot name="results" />
      </div>
    </div>
    <Button
      buttonSize="medium"
      buttonColor="blue"
      :key="updateKey"
      buttonText="Добавить"
      :disabled="disabledBtn"
      class="search__button"
      @click="$emit('add-member')"
    />
  </div>
</template>

<script>
import Button from 'Elements/Button/Button';
import SearchIcon from 'Elements/SVG/Search';
import Input from 'Elements/Input/Input';

export default {
  components: { Button, SearchIcon, Input },
  props: {
    query: {
      type: String,
      default: ''
    },
    disabledBtn: Boolean,
    updateKey: Number
  },

  methods: {
    search(name, value) {
      this.$emit('search', value);
    }
  }
};
</script>

<style lang="scss" scoped>
.search {
  display: flex;

  &__input {
    width: 320px;

    & ::v-deep .el-input__inner {
      padding-left: 40px !important;
    }
  }

  &__icon {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 12px;
    z-index: 1;
    margin: auto;
  }

  &__button {
    margin-left: 12px;
  }

  &__results {
    position: absolute;
    background: $white;
    border-radius: 4px;
    width: 100%;
    max-height: 250px;
    // max-height: 170px;
    overflow: auto;
    // visibility: hidden;
    // opacity: 0;
    transition: all 300ms;
    z-index: 2001;

    // &.visible
  }

  &__wrapper {
    position: relative;

    // &:hover {
    //   .search__results {
    //     visibility: visible;
    //     opacity: 1;
    //   }
    // }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
  opacity: 0;
}
</style>
