<template>
  <div :class="['message__area', editorError ? 'message__area_expanded' : '']">
    <div class="message__area-input">
      <div class="message__editor primary">
        <Editor
          :autofocus="true"
          @change="changeText($event)"
          :value="comment.text"
          :key="editorKey"
        />
      </div>

      <div @click="leaveComment()">
        <Icon class="message__area-button" iconName="send_message" />
      </div>
    </div>

    <p v-if="editorError" class="message__error">
      Необходимо указать сообщение
    </p>

    <Checkbox
      class="message__area-checkbox"
      text="Виден только рекрутерам"
      :value="comment.to_recruits"
      @change="
        value => {
          comment.to_recruits = value;
        }
      "
    />
  </div>
</template>

<script>
import Checkbox from 'Elements/Checkbox/CustomCheckbox';
import Editor from 'Elements/Editor/Editor';
import Icon from 'Elements/Icon/Icon';

export default {
  components: { Icon, Editor, Checkbox },
  props: {
    error: {
      type: Boolean,
      default: false
    },
    commentToEdit: {
      type: Object,
      default: () => {}
    },
    mode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      editorError: this.error,
      comment: {
        ...this.commentToEdit,
        to_recruits: this.getRecruitsValue(this.commentToEdit.to_recruits)
      },
      editorKey: 0,
      messageWasSent: false
    };
  },
  methods: {
    changeEditorKey() {
      this.editorKey++;
    },
    changeText(data) {
      if (!data && !this.messageWasSent) this.editorError = true;
      else {
        this.editorError = false;
        this.messageWasSent = false;
      }

      this.$set(this.comment, 'text', data);
    },
    leaveComment() {
      this.$emit(
        this.comment.id ? 'editComment' : 'leaveComment',
        this.comment
      );
      this.messageWasSent = true;
      this.comment.text = '';
    },
    getRecruitsValue(value) {
      if (!value || value == '0') return false;
      else return true;
    }
  },
  watch: {
    error(val) {
      this.editorError = val;
    },
    commentToEdit() {
      if (this.mode == 'selection') this.changeEditorKey();
      this.comment = {
        ...this.commentToEdit,
        to_recruits: this.getRecruitsValue(this.commentToEdit.to_recruits)
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.message__editor {
  width: 100%;
  max-height: 130px;
  overflow: auto;
  -ms-overflow-style: none;
  // scrollbar-width: none;

  // &::-webkit-scrollbar {
  //   width: 12px;
  //   background-color: $blue-20;
  //   border-radius: 4px;
  // }

  * {
    font-size: 15px;
  }

  & > .ck::after {
    background-image: none !important;
  }
}

.message__error {
  text-align: left;
  color: $red-700;
  margin: 14px 0;
}

.message__area {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-bottom: 1px solid $black-30;
  box-shadow: 0 7px 9px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  max-height: 220px;
  transition: 300ms;

  &_expanded {
    max-height: 268px;
  }

  &-button {
    cursor: pointer;
    margin-right: 12px;

    &:hover {
      background: inherit;
    }

    &::v-deep .button-content {
      margin: 0;
    }
  }

  &-input {
    border: 1px solid $black-30;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: stretch;
    min-height: 50px;
    max-width: 100%;
  }

  &-checkbox {
    margin-top: 12px;
  }

  & ::v-deep .ck.ck-editor__editable {
    border: none;
  }
}
</style>
