<template>
  <el-dialog
    ref="dialog"
    :visible.sync="is_visible"
    :close-on-click-modal="false"
    title="Авторизация в Telegram"
    @close="$emit('close-popup')"
  >
    <div>
      <p class="dialog__text">{{ text[status] }}</p>
    </div>
    <div class="dialog__content">
      <form v-loading="loading" novalidate ref="auth-form">
        <input-masked
          v-if="status == 'phone'"
          :key="fields.phone.name"
          :model="authForm.phone"
          :field="fields.phone"
          @set-value="handleChange"
          @set-hidden="setHidden"
          @keydown.prevent.native.enter.exact="sendPhone"
          :mask="[
            '+#######',
            '+########',
            '+#########',
            '+##########',
            '+###########',
            '+############',
            '+#############',
            '+##############',
            '+###############'
          ]"
          class="content-item"
        />
        <Input
          v-if="status == 'code'"
          :key="fields.code.name"
          :field="fields.code"
          :model="authForm.code"
          @set-value="handleChange"
          @set-hidden="setHidden"
          @keydown.prevent.native.enter.exact="sendCode"
          class="content-item"
        />
        <Input
          v-if="status == 'password'"
          :key="fields.password.name"
          :field="fields.password"
          :model="authForm.password"
          @set-value="handleChange"
          @set-hidden="setHidden"
          @keydown.prevent.native.enter.exact="sendPassword"
          class="content-item"
        />
      </form>
    </div>
    <div slot="footer">
      <div class="footer">
        <Button
          v-if="status == 'phone'"
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Принять"
          @click.prevent="sendPhone"
          class="footer__button-ok"
        />
        <Button
          v-if="status == 'code'"
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Принять"
          @click.prevent="sendCode"
          class="footer__button-ok"
        />
        <Button
          v-if="status == 'password'"
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Сохранить"
          @click.prevent="sendPassword"
          class="footer__button-ok"
        />
        <Button
          v-if="status"
          buttonSize="big"
          buttonColor="blue"
          buttonText="Закрыть"
          @click="$emit('close-popup')"
          class="footer__button-cancel"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mixin, rules, errorMsg } from '@/utils/mixins';
import { Dialog } from 'element-ui';
import { scrollToErrorField } from '@/utils/helpers';
import { getController } from '@/controllers/request.js';
import Input from 'Elements/Input/Input';
import InputMasked from 'Elements/Input/InputMasked';
import Button from 'Elements/Button/Button';
export default {
  mixins: [mixin, rules, errorMsg],
  props: {
    is_visible: {
      type: Boolean,
      default: false
    },
    module: String,
    sessionId: String,
    userId: String
  },
  data() {
    return {
      rules: {},
      authForm: {},
      fields: {
        phone: {
          name: 'phone',
          placeholder: 'Телефон',
          required: true,
          type: 'varchar'
        },
        code: {
          name: 'code',
          placeholder: 'Код подтверждения',
          required: true,
          htmlType: 'number'
        },
        password: {
          name: 'password',
          placeholder: 'Пароль',
          required: true,
          htmlType: 'password'
        }
      },
      loading: true,
      status: '' // phone | code | password
    };
  },
  computed: {
    text: function () {
      return {
        phone: 'Введите телефонный номер для авторизации в Telegram',
        code: 'Введите код подтверждения для авторизации в Telegram',
        password: 'Введите пароль аккаунта Telegram',
        '': ''
      };
    }
  },
  created() {
    this.createSession();
  },
  methods: {
    handleChange(name, val) {
      this.$set(this.authForm, name, val);

      if (name == 'phone') {
        this.checkPhoneInput(this.authForm, name);
      }

      this.validateForm(this.authForm, name);
    },
    createSession() {
      getController({
        params: {
          module: this.module,
          action: 'add_telegram_session',
          user_peer: this.sessionId
        }
      })
        .then(resp => {
          if (resp.data) {
            this.loading = true;
            this.status = 'phone';
            Object.values(this.fields).forEach(field => {
              if (field.required) {
                this.setRequiredFields(true, field.name);
              }
              this.$set(this.fields[field.name], 'hidden', true);
            });
          } else {
            this.$emit('close-popup');
          }
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка в экшне add_telegram_session',
            'add_telegram_session'
          )
        )
        .finally(() => (this.loading = false));
    },
    sendPhone() {
      const valid = this.validateForm(this.authForm);
      scrollToErrorField(this.fields, this.$refs.dialog.$el);

      if (valid) {
        this.loading = true;
        getController({
          params: {
            module: this.module,
            action: 'send_telegram_phone',
            user_peer: this.sessionId,
            phone: this.authForm.phone
          }
        })
          .then(resp => {
            if (resp.data && !resp.data.errors.length) {
              this.status = 'code';
            }
            if (resp.data.errors) {
              this.showErrorMessage(resp.data.errors, {
                className: 'el-message--telegram'
              });
            }
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка в экшне send_telegram_phone',
              'send_telegram_phone'
            )
          )
          .finally(() => (this.loading = false));
      }
    },
    sendCode() {
      const valid = this.validateForm(this.authForm);
      scrollToErrorField(this.fields, this.$refs.dialog.$el);

      if (valid) {
        this.loading = true;
        getController({
          params: {
            module: this.module,
            action: 'send_telegram_code',
            user_peer: this.sessionId,
            code: this.authForm.code
          }
        })
          .then(resp => {
            if (!resp.data || !resp.data.result) {
              this.showErrorMessage('Введите правильно код подтверждения!', {
                className: 'el-message--telegram'
              });
            }

            if (resp.data.type == 'password') {
              this.status = 'password';
            }

            if (resp.data.type == 'authorization') {
              this.saveSession();
            }
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка в экшне send_telegram_code',
              'send_telegram_code'
            )
          )
          .finally(() => (this.loading = false));
      }
    },
    sendPassword() {
      const valid = this.validateForm(this.authForm);
      scrollToErrorField(this.fields, this.$refs.dialog.$el);

      if (valid) {
        this.loading = true;
        getController({
          params: {
            module: this.module,
            action: 'send_telegram_password',
            user_peer: this.sessionId,
            password: this.authForm.password
          }
        })
          .then(resp => {
            if (resp.data) {
              this.saveSession();
            } else {
              this.showErrorMessage('Введите правильный пароль!', {
                className: 'el-message--telegram'
              });
            }
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка в экшне send_telegram_password',
              'send_telegram_password'
            )
          );
      }
    },
    saveSession() {
      this.loading = true;
      getController({
        params: {
          module: this.module,
          action: 'save_telegram',
          user_peer: this.sessionId,
          user_id: this.userId
        }
      })
        .then(resp => {
          if (resp.data) {
            this.$emit('close-popup');
            this.showNotification({
              offset: 80,
              showClose: true,
              message: 'Настройки успешно сохранены',
              duration: 15000,
              type: 'success'
            });
          }
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка в экшне save telegram',
            'save_telegram'
          )
        )
        .finally(() => (this.loading = false));
    }
  },
  components: {
    'el-dialog': Dialog,
    Input,
    InputMasked,
    Button
  }
};
</script>
