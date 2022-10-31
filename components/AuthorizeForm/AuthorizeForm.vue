<template>
  <div>
    <div v-if="variant === 'multi'">
      <el-form
        :model="form"
        ref="form"
        label-width="0px"
        class="authorize-form"
      >
        <div
          v-if="auth && auth.work_site"
          class="authorize-form__row authorize-form__row_full"
        >
          <div class="authorize-form__field">
            <span class="el-form-item__label">Площадка</span>
            <Dropdown
              hasLeftIcon
              size="big"
              :options="{ ...availableOptions, [platformName]: platformName }"
              :field="{ type: 'enum', placeholder: 'Выберите', disabled: true }"
              :model="platformName"
              placeholder="Выберите"
              class="authorize-form__input authorize-form__input_sm"
            />
          </div>
          <div class="authorize-form__field">
            <span class="el-form-item__label">Учетная запись</span>
            <el-input
              :field="field"
              :value="`${auth.first_name} ${auth.last_name}`"
              :disabled="true"
              size="big"
              class="authorize-form__input authorize-form__input_lg big"
            />
          </div>
          <div class="authorize-form__field" v-if="visiblePlane">
            <span class="el-form-item__label">Тарифный план</span>
            <el-input
              v-if="selectedPublishedVacancy"
              :field="field"
              :value="
                field.billingTypes[selectedPublishedVacancy.billing_type.value]
              "
              :disabled="true"
              size="big"
              class="authorize-form__input authorize-form__input_sm big"
            />
            <Dropdown
              v-else
              size="big"
              :options="field.billingTypes"
              :model="billingType"
              :field="{ type: 'enum', placeholder: 'Выберите' }"
              disabled
              placeholder="Выберите"
              class="authorize-form__input authorize-form__input_mid"
              @set-value="(name, value) => (billingType = value)"
            />
          </div>
          <ActionsMenu
            :actions="[
              deleteField ? { id: 'delete', name: 'Удалить из списка' } : {},
              { id: 'exit', name: 'Выйти' }
            ]"
            class="actions_menu"
            :handle-command="p => handleCommand(p)"
            color="#21272C"
          />
        </div>

        <div v-else class="authorize-form__row">
          <div class="authorize-form__field">
            <span class="el-form-item__label">Площадка</span>
            <Dropdown
              hasLeftIcon
              size="big"
              :options="{ ...availableOptions, [platformName]: platformName }"
              :field="{ type: 'enum', placeholder: 'Выберите' }"
              :model="platformName"
              placeholder="Выберите"
              class="authorize-form__input authorize-form__input_sm"
              @set-value="(name, value) => changePlatformName(value)"
            />
          </div>
          <Button
            buttonSize="big"
            buttonColor="darkBlue"
            buttonText="Авторизация"
            hasRightIcon
            iconName="LinkBold"
            class="authorize-form__button authorize-form__button_auth"
            @click="authenticate"
          />
          <div v-if="deleteField" class="authorize-form__delete">
            <div @click="handleCommand('delete')">
              <Icon iconName="delete" iconColor="#C0C8D0" />
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <div v-if="variant === 'single'">
      <el-form
        :model="form"
        ref="form"
        label-width="0px"
        class="authorize-form"
      >
        <div
          v-if="auth && auth.work_site"
          class="authorize-form__row authorize-form__row_full"
        >
          <div class="authorize-form__field">
            <span class="el-form-item__label">Площадка</span>
            <Dropdown
              hasLeftIcon
              size="big"
              :options="{ ...availableOptions, [platformName]: platformName }"
              :field="{ type: 'enum', placeholder: 'Выберите', disabled: true }"
              :model="platformName"
              class="authorize-form__input authorize-form__input_sm"
            />
          </div>
          <div class="authorize-form__field login-record">
            <span class="el-form-item__label">Учетная запись</span>
            <el-input
              :field="field"
              :value="`${auth.first_name} ${auth.last_name}`"
              :disabled="true"
              size="big"
              class="authorize-form__input authorize-form__input_lg big"
            />
          </div>
          <Button
            buttonSize="big"
            buttonColor="darkBlue"
            buttonText="Выйти"
            hasRightIcon
            iconName="LinkBold"
            class="authorize-form__button authorize-form__button_auth"
            @click="handleCommand('exit')"
          />
        </div>

        <div v-else class="authorize-form__row">
          <div class="authorize-form__field">
            <span class="el-form-item__label">Площадка</span>
            <Dropdown
              hasLeftIcon
              size="big"
              :options="{ ...availableOptions, [platformName]: platformName }"
              :field="{ type: 'enum', placeholder: 'Выберите' }"
              :model="platformName"
              class="authorize-form__input authorize-form__input_sm"
              @set-value="(name, value) => changePlatformName(value)"
            />
          </div>
          <Button
            buttonSize="big"
            buttonColor="darkBlue"
            buttonText="Авторизация"
            hasRightIcon
            iconName="LinkBold"
            class="authorize-form__button authorize-form__button_auth"
            @click="authenticate"
          />
        </div>
      </el-form>
    </div>

    <div v-if="variant === 'edit'">
      <el-form
        :model="form"
        ref="form"
        label-width="0px"
        class="authorize-form"
      >
        <div
          v-if="auth && auth.work_site"
          class="authorize-form__row authorize-form__row_full"
        >
          <div class="authorize-form__field">
            <span class="el-form-item__label">Площадка</span>
            <Dropdown
              hasLeftIcon
              size="big"
              disabled
              :options="{ [platformName]: platformName }"
              :field="{ type: 'enum', placeholder: 'Выберите', disabled: true }"
              :model="platformName"
              class="authorize-form__input authorize-form__input_sm"
            />
          </div>
          <div class="authorize-form__field">
            <span class="el-form-item__label">Учетная запись</span>
            <el-input
              :field="field"
              :value="`${auth.first_name} ${auth.last_name}`"
              :disabled="true"
              size="big"
              class="authorize-form__input authorize-form__input_lg big"
            />
          </div>
          <div class="authorize-form__field" v-if="visiblePlane">
            <span class="el-form-item__label">Тарифный план</span>
            <el-input
              v-if="selectedPublishedVacancy"
              :field="field"
              :value="
                field.billingTypes[selectedPublishedVacancy.billing_type.value]
              "
              :disabled="true"
              size="big"
              class="authorize-form__input authorize-form__input_sm big"
            />
            <Dropdown
              v-else
              size="big"
              :options="field.billingTypes"
              :model="billingType"
              :field="{ type: 'enum', placeholder: 'Выберите' }"
              disabled
              class="authorize-form__input authorize-form__input_mid"
              @set-value="(name, value) => (billingType = value)"
            />
          </div>
          <ActionsMenu
            :actions="[
              field.delete ? { id: 'delete', name: 'Удалить из списка' } : {},
              { id: 'exit', name: 'Выйти' }
            ]"
            class="actions_menu"
            :handle-command="p => handleCommand(p)"
            color="#21272C"
          />
        </div>

        <div v-else class="authorize-form__row">
          <div class="authorize-form__field">
            <span class="el-form-item__label">Площадка</span>
            <Dropdown
              hasLeftIcon
              size="big"
              disabled
              :options="{ [platformName]: platformName }"
              :field="{ type: 'enum', placeholder: 'Выберите' }"
              :model="platformName"
              class="authorize-form__input authorize-form__input_sm"
              @set-value="(name, value) => changePlatformName(value)"
            />
          </div>
          <Button
            buttonSize="big"
            buttonColor="darkBlue"
            buttonText="Авторизация"
            hasRightIcon
            iconName="LinkBold"
            class="authorize-form__button authorize-form__button_auth"
            @click="authenticate"
          />
          <div v-if="deleteField" class="authorize-form__delete">
            <div @click="handleCommand('delete')">
              <Icon iconName="delete" iconColor="#C0C8D0" />
            </div>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { store } from '@/store';
import { Form, Input } from 'element-ui';
import { form } from '@/utils/mixins';
import { scrollToError } from '@/utils/helpers';
import ActionsMenu from 'Elements/Menu/ActionsMenu';
import Dropdown from 'Elements/Select/Dropdown';
import Button from 'Elements/Button/Button';
import Icon from 'Elements/Icon/Icon';

export default {
  mixins: [form],
  components: {
    'el-form': Form,
    'el-input': Input,
    Dropdown,
    Button,
    ActionsMenu,
    Icon
  },
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    tabs: {
      type: Function
    },
    visiblePlane: {
      type: Boolean,
      default: true
    },
    options: {
      type: [Object, Array]
    },
    variant: {
      type: String,
      default: 'multi'
    },
    isPopup: {
      type: Boolean,
      default: false
    },
    platformName: {
      type: String,
      default: 'hh'
    },
    delete: {
      type: Function
    },
    deleteField: {
      type: Boolean,
      default: false
    },
    disabledField: { type: Boolean, default: false }
  },
  data() {
    return {
      work_site: 'hh',
      hasEdited: false
    };
  },
  async created() {
    await store.dispatch('publicator/loadBillngTypes', this.field.name);
    await store.dispatch('publicator/checkAuth', this.field.name);
  },
  computed: {
    auth: {
      get: function () {
        return this.field.authData;
      },
      set: function (val) {
        this.auth = val;
      }
    },
    selectedEdit() {
      return store.state.publicator.selectedPublishedVacancy;
    },
    fields() {
      return store.state.candidate.fields || {};
    },
    selectedPublishedVacancy() {
      return store.state.publicator.selectedPublishedVacancy || null;
    },
    billingType: {
      get() {
        return this.field.activeBilling;
      },
      set(val) {
        store.commit('publicator/setBillingType', {
          work_site: this.field.name,
          billingType: val
        });
      }
    },
    availableOptions() {
      let result = {};
      this.options.map(item => {
        result[item] = item;
      });
      return result;
    }
  },
  methods: {
    async checkAuthElement() {
      await store.dispatch('publicator/checkAuth', this.field.name);
    },
    async changePlatformName(value) {
      await store.commit('publicator/setPlatformName', {
        id: this.field.id,
        name: value,
        item: this.field
      });
      this.checkAuthElement();
      this.tabs();
      await store.dispatch('publicator/loadBillngTypes', this.field.name);
      this.$emit('setFormLoading', false);
    },

    handleCommand(command) {
      switch (command) {
        case 'delete':
          this.$emit('delete', { id: this.field.id, name: this.field.name });
          store.commit('publicator/setAvailableOptions', {
            name: this.field.name,
            action: 'addOpt'
          });
          this.tabs('', true);
          break;

        case 'exit':
          this.deauthenticate();
          break;

        default:
          break;
      }
    },

    validateForm() {
      let success = '';

      this.$nextTick(() => {
        this.$refs.form.validate(async (valid, fields) => {
          store.commit('common/setDetachedFormStatus', {
            name: this.field.name,
            valid
          });

          // detachedRules можно объединить с общими rules
          if (!valid) {
            const errorFields = Object.keys(fields);
            scrollToError(
              errorFields,
              this.isPopup ? this.$refs.form.$el : window
            );
            store.commit('common/setDetachedFormMode', false);
          }
          success = valid;
        });
      });

      return success;
    },
    async authenticate() {
      await store.dispatch('publicator/authenticate', {
        work_site: this.field.name
      });
    },
    async deauthenticate() {
      await store.dispatch('publicator/deauthenticate', this.field.name);
    }
  },
  destroyed() {
    store.dispatch('publicator/destroyAuthInterval');
  }
};
</script>
<style lang="scss" scoped>
.authorize-form {
  .login-record {
    margin-left: 16px;
  }

  &__delete {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;

    svg {
      cursor: pointer;
    }
  }

  &__row {
    margin-bottom: 12px;
    display: flex;
    align-items: flex-end;

    .actions_menu {
      transform: translateY(-7px);
    }

    &_full {
      justify-content: space-between;
    }
  }

  &__row:last-child {
    margin-bottom: 12px;
  }

  &__input {
    &_mid {
      width: 207px;
    }

    &_sm {
      width: 143px;
    }

    &_lg {
      width: 170px;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
  }

  &__button {
    &_auth {
      width: 159px;
      margin-left: 16px;
    }
  }
}
</style>
