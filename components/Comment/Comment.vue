<template>
  <div class="comment" v-if="comment">
    <div class="comment__header">
      <div class="comment__header-info">
        <Avatar class="info__avatar" :url="userAvatarLink" :size="40" />
        <div class="info__data">
          <a :href="userLink" class="info__data-author fw-500 primary">
            {{ comment.name }}
          </a>
          <p class="info__data-date">
            {{ comment.date_entered }}
          </p>
        </div>
      </div>
      <ActionsMenu
        v-if="userId == comment.user_id && !Number(comment.system_comment)"
        :actions="[
          { id: 'edit', name: 'Править' },
          { id: 'delete', name: 'Удалить' }
        ]"
        :handle-command="handleCommand"
      />
    </div>
    <div v-if="+comment.to_recruits" class="info__recruit">
      <Icon iconName="eye" iconColor="#c0c8d0" />
      <p class="info__recruit-text">Видят только рекрутеры</p>
    </div>
    <div class="info__text">
      <EditorDataParser :data="comment.text || ''" />
    </div>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixins';
import Avatar from 'Elements/Avatar/Avatar';
import ActionsMenu from 'Elements/Menu/ActionsMenu';
import Icon from 'Elements/Icon/Icon';
import EditorDataParser from 'Elements/Editor/EditorDataParser';

export default {
  mixins: [mixin],
  name: 'comment',
  props: {
    comment: {
      type: Object,
      default: () => ({})
    },
    userId: String
  },
  computed: {
    userAvatarLink() {
      return `/index.php?entryPoint=download&id=${this.comment.user_id}_photo&type=Users`;
    },
    userLink() {
      return `/index.php?module=Users&action=DetailView&record=${this.comment.user_id}`;
    }
  },
  methods: {
    handleCommand(command) {
      this.$emit(
        command === 'edit' ? 'editComment' : 'deleteComment',
        this.comment
      );
    }
  },
  components: {
    Avatar,
    ActionsMenu,
    Icon,
    EditorDataParser
  }
};
</script>
<style lang="scss" scoped>
.comment {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &-info {
      display: flex;
    }
  }
}

.info {
  &__avatar {
    margin-right: 8px;
  }

  &__button {
    padding: 0;

    &::v-deep .button-content {
      margin: 0;
    }
  }

  &__data {
    display: flex;
    flex-direction: column;

    &-author {
      margin: 0;
      color: $black-190;
      font-size: 14px;
      line-height: 20px;
      text-align: left;
    }

    &-date {
      margin: 0;
      color: $black-40;
      font-size: 14px;
      line-height: 20px;
    }
  }

  &__recruit {
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;

    &-text {
      font-size: 15px;
      color: $black-50;
      margin: 0 0 0 4px;
      line-height: 24px;
    }
  }

  &__text {
    padding: 8px;
    border-radius: 4px;
    background: $black-10;
    max-width: 336px;
    font-size: 15px;
    line-height: 24px;
    color: $black-190;
    text-align: left;

    & ::v-deep p {
      margin: 0;
    }

    & ::v-deep a {
      margin: 0;
      display: flex;
      flex: none;
      word-break: break-all;
    }

    & ::v-deep b {
      margin: 0;
    }

    & ::v-deep pre {
      margin: 0;
      font-family: 'Roboto', sans-serif;
    }

    & ::v-deep .info__tag {
      color: $black-200;
      font-size: 14px;
      padding: 0px 8px;
      margin: 0px 0px 8px 0px;
      width: fit-content;
      border-radius: 4px;
      background: #fff3c2;
      border: 1px solid $orange;
    }
  }
}
</style>
