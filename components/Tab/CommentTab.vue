<template>
  <div :class="`comment-tab comment-tab--${mode}`">
    <div v-if="mode == 'default'" class="content-top" ref="messageArea">
      <VacancyMessageArea
        v-if="commentForm"
        @editComment="editComment"
        @leaveComment="addComment"
        :editMode="editMode"
        :commentToEdit="commentToEdit"
        :error="editorError"
      />
    </div>
    <div :class="['content-center', commentForm ? 'content-collapsed' : '']">
      <CommentList
        :commentList="comments"
        @editComment="prepareComment"
        @deleteComment="deleteComment"
        :userId="userId"
        :mode="mode"
      />
    </div>
    <div v-if="mode == 'selection'" class="content-bottom" ref="messageArea">
      <VacancyMessageArea
        @editComment="editComment"
        @leaveComment="addComment"
        :editMode="editMode"
        :commentToEdit="commentToEdit"
        :error="editorError"
        mode="selection"
      />
    </div>
    <div v-if="mode !== 'selection'" class="footer-bar">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Добавить комментарий"
        :full-width="true"
        @click="showCommentForm({ flag: true })"
        :disabled="commentForm"
      />
    </div>
  </div>
</template>
<script>
import { store } from '@/store';
import { mixin } from '@/utils/mixins';
import { MODULE, FIELD, ACTION } from '@/utils/constants';
import Button from 'Elements/Button/Button';
import VacancyMessageArea from 'Elements/Sidebar/VacancyMessageArea';
import CommentList from 'Elements/Comment/CommentList';

export default {
  mixins: [mixin],
  components: {
    Button,
    VacancyMessageArea,
    CommentList
  },
  props: {
    module: String,
    id: String,
    userId: String,
    tableSql: String,
    mode: {
      type: String,
      default: 'default'
    },
    countId: String
  },
  data() {
    return {
      commentToEdit: {},
      editorError: false,
      storeModule: this.mode == 'selection' ? 'selectionPanel' : 'subpanels'
    };
  },
  created() {
    this.updateCommentsList();
  },
  computed: {
    comments() {
      return this.mode == 'selection'
        ? store.state.selectionPanel.candidates[this.countId].comments
        : store.state.subpanels.comments;
    },
    commentForm() {
      return this.mode == 'selection'
        ? store.state.selectionPanel.candidates[this.countId].commentFormActive
        : store.state.subpanels.commentFormActive;
    }
  },
  methods: {
    addComment(comment) {
      if (!comment.text) {
        this.editorError = true;

        return;
      }

      this.editorError = false;

      this.saveComment(comment, false);
    },
    closeCommentDialog() {
      store.commit('common/setVisibleDialog', {
        name: 'comment_dialog',
        val: false
      });
    },
    prepareComment(comment) {
      this.commentToEdit = comment;
      this.showCommentForm({ flag: true });
    },
    editComment(comment) {
      if (!comment.text) {
        this.editorError = true;
        return;
      }

      this.editorError = false;

      this.commentToEdit = {};

      this.saveComment(comment, true);
    },
    async updateCommentsList() {
      try {
        await store.dispatch(`${this.storeModule}/loadComments`, {
          params: {
            module: this.module,
            action: ACTION.GET_SUBPANEL_JSON_DATA,
            subpanel: this.tableSql,
            record: this.id,
            to_pdf: true,
            sort_by: FIELD.ID.DATE_MODIFIED,
            type_sort: 'ASC'
          }
        });
      } catch (err) {
        this.catchError(
          err,
          'Возникла ошибка загрузки списка комментариев',
          'comments loading'
        );
      } finally {
        this.$emit('set-loading', false);
      }
    },
    showCommentForm({ flag, comment = null }) {
      this.editedComment = comment;
      store.commit(`${this.storeModule}/setCommentForm`, flag);
      this.$refs.messageArea.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      });
    },
    async saveComment(comment, edit) {
      store.commit(`${this.storeModule}/setCommentForm`, false);
      this.$emit('set-loading', true);

      const formData = new FormData();

      formData.set('module', MODULE.HRPAC_COMMENTS);
      formData.set('record', edit ? comment.id : '');
      formData.set('action', ACTION.SAVE);
      formData.set('relate_to', this.tableSql);
      formData.set('relate_id', this.id);
      formData.set('parent_type', this.module);
      formData.set('parent_id', this.id);
      formData.set('assigned_user_id', this.userId);
      formData.set('to_recruits', comment.to_recruits);
      formData.set('text', comment.text);

      try {
        await store.dispatch(`${this.storeModule}/saveComment`, {
          options: formData
        });

        try {
          this.updateCommentsList();
        } catch (e) {
          console.error(e);
        }
      } catch (err) {
        this.catchError(
          err,
          'Возникла ошибка при сохранении комментария',
          'save comment'
        );
      }
    },
    deleteComment(comment) {
      store.commit(`${this.storeModule}/setCommentToDelete`, comment);
      store.commit('common/setVisibleDialog', {
        name: 'comment_dialog',
        val: true
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.content {
  &-center {
    overflow-y: auto;
    height: 100%;
    -ms-overflow-style: none;

    &.content-collapsed {
      max-height: calc(100% - 200px);
    }
  }

  &-bottom {
    & ::v-deep .message__area {
      border-bottom: none;
      padding: 8px 0 0 0;

      &-checkbox {
        margin: 8px 0 0 0;
      }
    }
  }
}

.comment-tab {
  position: relative;
  height: 100%;
  overflow: hidden;

  &--default {
    padding-bottom: 90px;
  }

  &--selection .content-center {
    max-height: 254px;
  }
}

.footer-bar {
  align-content: center;
  display: flex;
  justify-content: center;
  vertical-align: middle;
  border-top: 1px solid $black-20;
  border-radius: 0 0 4px 4px;
  padding: 24px;
  box-sizing: border-box;
  background-color: $white;
  position: absolute;
  width: 100%;
  bottom: 0;
}
</style>
