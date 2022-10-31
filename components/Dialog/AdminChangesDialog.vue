<template>
  <el-dialog
    ref="dialog"
    :title="title"
    :visible="is_visible"
    :close-on-click-modal="false"
    :width="type != 'editColor' ? '461px' : '345px'"
    class="dialog"
    @close="resetCallback"
  >
    <div>
      <p class="dialog__text">{{ text }}</p>
    </div>
    <el-form :model="form" :rules="rules" class="middle-area-form">
      <label>Название</label>
      <el-form-item prop="NAME">
        <Input
          :field="{
            name: 'NAME',
            type: 'text',
            required: true,
            placeholder: 'Введите'
          }"
          required
          :model="form.NAME"
          @set-value="handleChange"
          class="input"
        />
      </el-form-item>
      <label>Текст сообщения</label>
      <el-form-item prop="DESCRIPTION">
        <Textarea
          :field="{ name: 'DESCRIPTION', placeholder: 'Введите сообщение' }"
          :hasResizeIcon="true"
          class="textarea"
          required
          :model="form.DESCRIPTION"
          @change="handleChange"
          @keypress.native="inputHandler($event)"
        />
        <Menu
          v-if="visibleVariablesList"
          :menu="variables"
          class="variables-list"
          @click="chooseVariable"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <div class="footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Сохранить"
          :disabled="!form.NAME || !form.DESCRIPTION"
          @click.prevent="saveMessages"
          class="accept-button"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog, Form, FormItem } from 'element-ui';
import { MODULE, ACTION } from '@/utils/constants';
import { mixin, rules } from '@/utils/mixins';
import { postController } from '@/controllers/request.js';
import { store } from '@/store';
import Textarea from 'Elements/Textarea/Textarea';
import Button from 'Elements/Button/Button';
import Input from 'Elements/Input/Input';
import Menu from 'Elements/Menu/Menu';

export default {
  mixins: [mixin, rules],
  props: {
    is_visible: {
      type: Boolean
    },
    dataset: {
      type: Object
    },
    activeSubpanel: {
      type: Text
    }
  },
  data() {
    const validate = (rule, value, callback) => {
      if (!value) {
        callback(new Error(' '));
      } else {
        callback();
      }
    };

    return {
      form: { ...this.dataset },
      type: this.dataset.NAME ? 'edit' : 'create',
      rules: {
        NAME: [
          {
            required: true,
            validator: validate,
            trigger: ['blur', 'focus', 'change', 'input']
          }
        ],
        DESCRIPTION: [
          {
            required: true,
            validator: validate,
            trigger: ['blur', 'focus', 'change', 'input']
          }
        ]
      },
      visibleVariablesList: false
    };
  },
  computed: {
    title: function () {
      return this.type == 'create'
        ? 'Создать сообщение'
        : this.type == 'edit'
        ? 'Изменить сообщение'
        : '';
    },
    variables() {
      const variablesList = store.state.scenario.variables;
      return Object.values(variablesList).map((el, i) => ({
        id: Object.keys(variablesList)[i],
        name: el.name,
        submenu: el.variables
      }));
    }
  },
  methods: {
    handleChange(name, val) {
      this.$set(this.form, name, val);
    },
    resetCallback() {
      this.$emit('reset-callback');
    },
    async saveMessages() {
      if (!!this.form.NAME && !!this.form.DESCRIPTION) {
        const options = new FormData();

        options.append('module', MODULE.BOT_MESSAGES);
        options.append('record', this.form.ID || '');
        options.append('action', ACTION.SAVE);
        options.append('description', this.form.DESCRIPTION);
        options.append('name', this.form.NAME);
        options.append(
          'type_message',
          this.activeSubpanel == 'ask_again'
            ? 'reanswer_message'
            : 'reminder_message'
        );
        options.append('jsqon_return', '1');
        try {
          await postController({ options });
        } catch (err) {
          this.catchError(err, 'Возникла ошибка sаve');
        } finally {
          this.$emit('reset-callback');

          if (this.activeSubpanel == 'ask_again') {
            await store.dispatch('admin/confirmDelete', 'messages');
            await store.dispatch('admin/getMessageData', {
              type: 'reanswer_message'
            });
          } else {
            await store.dispatch('admin/confirmDelete', 'reminders');
            await store.dispatch('admin/getMessageData', {
              type: 'reminder_message'
            });
          }
        }
      }
    },
    inputHandler({ keyCode, target }) {
      setTimeout(() => {
        if (
          (keyCode == 123 || keyCode == 125) &&
          target.value.indexOf('{}') > -1
        ) {
          this.visibleVariablesList = true;
          target.blur();
        } else this.visibleVariablesList = false;
      }, 0);
    },
    chooseVariable(variable) {
      const value = this.form.DESCRIPTION;

      if (value.indexOf('{}') == -1) return;
      const sliceWithFirstBracket = value.slice(0, value.indexOf('{}'));
      const endSlice = value.slice(value.indexOf('{}') + 2);
      this.visibleVariablesList = false;
      this.handleChange(
        'DESCRIPTION',
        sliceWithFirstBracket + variable + endSlice
      );
    }
  },
  components: {
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    Textarea,
    Button,
    Input,
    Menu
  }
};
</script>
<style lang="scss" scoped>
.middle-area-form {
  & ::v-deep .el-form-item__content {
    flex-direction: column;
  }

  label {
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    color: $black-190;
    margin-bottom: 8px;
  }

  .color-block {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 15px;
      line-height: 24px;
      color: $black-100;
    }

    .input-color {
      background: #ffffff;
      border: 1px solid $black-30;
      box-sizing: border-box;
      border-radius: 4px;
      width: 60px;
      margin-left: 24px;
      height: 32px;

      &:hover {
        background: $black-10;
      }

      &:focus {
        border-color: $blue-120;
      }
    }
  }

  .input {
    margin-bottom: 24px;

    & ::v-deep .el-input__inner {
      font-size: 15px !important;
      line-height: 24px;
    }
  }

  .textarea {
    // min-height: 142px;
    // height: 142px;
    // resize: none !important;
    width: 100%;

    & ::v-deep .el-textarea__inner {
      border-radius: 4px;
      color: $black-190;
      font-family: 'Roboto', sans-serif;
      min-height: 142px !important;
      max-height: 320px;
      font-weight: normal;
      font-size: 15px;
      line-height: 24px;
      padding: 12px;
      box-sizing: border-box;
      -ms-overflow-style: none;
      list-style: none;

      &::-webkit-scrollbar {
        all: unset !important;
        // width: 0 !important;
        width: 16px !important;
      }

      &::-webkit-scrollbar-thumb {
        background-color: $black-60;
        border-radius: 2px;
        box-shadow: unset;
        -webkit-box-shadow: unset;
        border: 5px solid transparent;
        background-clip: content-box;
      }

      &::-webkit-scrollbar-track {
        -webkit-box-shadow: unset;
        box-shadow: unset;
        background-color: $black-20;
        border-radius: 0;
      }
    }

    ::-webkit-resizer {
      display: none;
    }
  }
}
.accept-button {
  width: 100%;
}

.variables-list {
  padding: 12px 0;
  border-radius: 4px;
  background: $white;
  position: absolute;
  border: 1px solid $black-30;
  font-size: 14px;
  width: 200px;
}
</style>
