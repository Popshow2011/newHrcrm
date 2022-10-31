<template>
  <el-dialog
    ref="dialog"
    :title="title"
    :visible="is_visible"
    :close-on-click-modal="false"
    width="345px"
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
      <el-form-item prop="SORT">
        <label>Номер позиции этапа в отчете</label>
        <Stepper
          :min="0"
          :max="Infinity"
          isInteger
          isRound
          size="big"
          class="stepper"
          :value="Number(form.SORT) || 0"
          @diffChange="val => handleChange('SORT', val || 0)"
        />
      </el-form-item>
      <div class="color-block">
        <span>Нажмите чтобы выбрать цвет</span>
        <InputColor
          :color="color || form.COLOR"
          @change="val => (color = val)"
        />
      </div>
    </el-form>
    <div slot="footer">
      <div class="footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Сохранить"
          :disabled="!form.NAME || !color"
          @click.prevent="saveMessages"
          class="accept-button"
        />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { store } from '@/store';
import { MODULE, ACTION } from '@/utils/constants';
import { mixin, rules } from '@/utils/mixins';
import { postController } from '@/controllers/request.js';
import { Dialog, Form, FormItem } from 'element-ui';
import Button from 'Elements/Button/Button';
import Input from 'Elements/Input/Input';
import InputColor from 'Elements/Input/InputColor';
import Stepper from 'Elements/Stepper/Stepper';

export default {
  mixins: [mixin, rules],
  props: {
    is_visible: {
      type: Boolean
    },
    dataset: {
      type: Object
    }
  },
  data() {
    const validate = (rule, value, callback) => {
      if (!value && value != 0) {
        callback(new Error(' '));
      } else {
        callback();
      }
    };

    return {
      form: { ...this.dataset },
      color: this.dataset.COLOR || '#000000',
      type: this.dataset.COLOR ? 'edit' : 'create',
      rules: {
        NAME: [
          {
            required: true,
            validator: validate,
            trigger: ['blur', 'focus', 'change', 'input']
          }
        ],
        SORT: [
          {
            required: true,
            validator: validate,
            trigger: ['blur', 'focus', 'change', 'input']
          }
        ]
      },
      key: 0
    };
  },
  computed: {
    title: function () {
      return this.type == 'create'
        ? 'Создать этап'
        : this.type == 'edit'
        ? 'Изменить цвет этапа'
        : '';
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
      if (!!this.form.NAME && !!this.color) {
        const options = new FormData();
        if (!this.form.SORT) {
          this.handleChange('SORT', 0);
        }

        options.append('module', MODULE.BOT_STAGES_OF_SCRIPT);
        options.append('record', this.form.ID || '');
        options.append('action', ACTION.SAVE);
        options.append('color', this.color);
        options.append('name', this.form.NAME);
        options.append('sort', this.form.SORT);
        options.append('jsqon_return', '1');
        try {
          await postController({ options });
        } catch (err) {
          this.catchError(err, 'Возникла ошибка sаve');
        } finally {
          this.$emit('reset-callback');

          await store.dispatch('admin/confirmDelete', 'stages');
          await store.dispatch('admin/getStagesData');
        }
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    Button,
    Input,
    InputColor,
    Stepper
  }
};
</script>
<style lang="scss" scoped>
.middle-area-form {
  & ::v-deep .el-form-item__content {
    flex-direction: column;

    label {
      margin-bottom: 4px;
    }
  }

  label {
    font-weight: normal;
    font-size: 14px;
    line-height: 24px;
    color: $black-190;
    margin-bottom: 0;
  }

  .color-block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;

    span {
      font-size: 15px;
      line-height: 24px;
      color: $black-100;
    }
  }

  .input {
    margin-bottom: 24px;

    & ::v-deep .el-input__inner {
      font-size: 15px !important;
      line-height: 24px;
    }
  }

  .stepper {
    width: 180px;
  }
}
.accept-button {
  width: 100%;
}
</style>
