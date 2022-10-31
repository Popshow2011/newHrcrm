<template>
  <div class="document">
    <div class="document__row">
      <Button
        class="document__row-download"
        hasLeftIcon
        iconName="document"
        buttonText=""
        buttonColor="darkBlue"
        buttonSize="big"
        :link="documentLink"
      />
      <div class="document__row-content">
        <a
          :href="documentLink || 'javascript:void(0)'"
          :class="`content__title fw-500 ${documentLink ? '' : 'no-link'}`"
          >{{ documentName }}</a
        >
        <p class="content__text secondary">{{ detailsText }}</p>
      </div>
    </div>
    <Button
      v-if="allowRemove"
      class="document__row-delete"
      hasLeftIcon
      iconName="delete"
      :iconColor="allowRemove ? '#CDD4DA' : '#282F36'"
      buttonText=""
      buttonColor="transparent"
      @click="allowRemove ? deleteFile() : null"
      :class="{ 'is-visible': visibleDeleteIcon }"
    />
  </div>
</template>
<script>
import Button from 'Elements/Button/Button';
export default {
  components: { Button },
  props: {
    index: Number,
    document: {
      type: Object
    },
    detailsText: String,
    documentLink: String,
    documentName: String,
    allowRemove: {
      type: Boolean,
      default: false
    },
    visibleDeleteIcon: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    deleteFile() {
      this.$emit('delete-file', this.document, this.index);
    }
  }
};
</script>
<style lang="scss" scoped>
.document {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 4px;
  padding: 12px;
  align-items: center;

  &:hover {
    background: $blue-10;
  }

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  &__row {
    display: flex;
    flex-direction: row;

    &-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-left: 8px;
      text-align: left;
    }

    &-download {
      height: 40px;
      width: 40px;
      min-width: 40px;
      border-radius: 50%;

      &::v-deep .button-content {
        margin: 0;
      }

      & ::v-deep svg {
        min-width: 24px;
      }
    }

    &-delete {
      margin: 0;
      display: none;

      &::v-deep .button-content {
        margin: 0;
      }
    }
  }

  & ::v-deep .content {
    &__title {
      margin: 0;
      font-size: 14px;
      color: $black-200;
      line-height: 20px;

      &.no-link:hover {
        cursor: default;
        color: $black-200 !important;
      }
    }

    &__text {
      margin: 0;
      font-size: 14px;
      // color: $black-40;
      line-height: 20px;
      font-weight: normal;
      text-align: left;
    }
  }
}

.document:hover .document__row-delete,
.document .document__row-delete.is-visible {
  display: inline;
}
</style>
