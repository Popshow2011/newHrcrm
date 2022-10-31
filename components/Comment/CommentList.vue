<template>
  <div
    :class="[
      'comments__list',
      commentList.length === 0 ? 'comments__list_empty' : '',
      commentList.length === 0 && mode == 'selection' ? 'selection' : ''
    ]"
  >
    <Comment
      class="list__comment"
      v-for="(item, index) in commentList"
      :key="index"
      :comment="item"
      @editComment="editComment"
      @deleteComment="deleteComment"
      :userId="userId"
    />
    <div
      v-if="commentList.length === 0"
      :class="[mode == 'selection' ? 'empty empty-selection' : 'empty']"
    >
      <span v-if="hasNoRights">Нет прав на просмотр комментариев</span>
      <span v-else>Нет комментариев</span>
    </div>
  </div>
</template>
<script>
import Comment from './Comment.vue';
import { store } from '@/store';

export default {
  components: { Comment },
  name: 'comment-list',
  props: {
    commentList: Array,
    userId: String,
    mode: {
      type: String,
      default: 'default'
    }
  },
  computed: {
    hasNoRights() {
      return store.state.subpanels.hasNoRights;
    }
  },
  methods: {
    editComment(comment) {
      this.$emit('editComment', comment);
    },
    deleteComment(comment) {
      this.$emit('deleteComment', comment);
    }
  }
};
</script>
<style lang="scss" scoped>
.empty {
  height: 100%;

  &-selection {
    min-height: 254px !important;
  }
}

.selection {
  max-height: 254px;
}

.comments__list {
  display: flex;
  flex-direction: column-reverse;
  padding: 24px 24px 0 24px;

  &_empty {
    padding: 0;
    height: 100%;
  }
}

.list__comment {
  margin-bottom: 24px;
}
</style>
