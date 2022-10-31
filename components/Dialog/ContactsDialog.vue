<template>
  <el-dialog
    ref="contact-dialog"
    :visible="is_visible"
    :close-on-click-modal="false"
    title="Средства связи"
    width="476px"
    @close="saveContacts"
    class="dialog"
  >
    <div>
      <p class="dialog__text">Добавьте или измените средства связи кандидата</p>
    </div>
    <contact-form
      v-loading="loading"
      :field="fields.communications"
      :model="filteredFields"
      :options="config.value_type_list"
      :is-popup="true"
    ></contact-form>
    <div slot="footer">
      <div class="footer footer--multiple-buttons">
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Добавить контакт"
          @click="addContact"
          class="footer__button-cancel"
        />
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Готово"
          @click.prevent="saveContacts"
          class="footer__button-ok accept-button"
        />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
import { store } from '@/store';
import { postController } from '@/controllers/request';
import { MODULE, ACTION } from '@/utils/constants';
import ContactForm from 'Elements/ContactForm/ContactForm';
export default {
  props: {
    is_visible: Boolean,
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      module: MODULE.CANDIDATES_MODULE,
      loading: false
    };
  },
  created() {
    // инициализация переменных в сторе
    store.commit('common/setDetachedFormStatus', {
      name: 'communications',
      valid: true
    });
    store.commit('common/setDetachedFormFields', {
      fieldName: 'communications',
      form: []
    });
  },
  computed: {
    fields() {
      return store.state.candidate.fields || {};
    },
    filteredFields() {
      const fields = store.state.candidate.fields.communications.value;
      const mainContact = fields
        .filter(contact => this.config.priority.includes(contact.value_type))
        .sort((a, b) => {
          const indexA = this.config.priority.findIndex(
            type => type === a.value_type
          );
          const indexB = this.config.priority.findIndex(
            type => type === b.value_type
          );
          return indexA - indexB;
        });
      const socialContacts = fields.filter(
        contact => !this.config.priority.includes(contact.value_type)
      );
      return [...mainContact, ...socialContacts] || [];
    }
  },
  methods: {
    addContact() {
      store.commit('common/addContact', { opts: this.config.value_type_list });
    },
    async saveContacts() {
      const storeCommunications =
        store.state.common.detachedForm.fields.communications || [];
      const formIsValid =
        store.state.common.detachedForm.validateStatus.communications;
      store.commit('common/setDetachedFormMode', true);

      if (!formIsValid) return;

      const options = new FormData();
      this.loading = true;

      options.append('module', this.module);
      options.append('record', this.fields.id.value);
      options.append('action', ACTION.SAVE);
      options.append('jsqon_return', '1');

      storeCommunications.forEach((communication, index) => {
        Object.keys(communication).forEach((c, i) => {
          options.append(
            `communications[${index}][${c}]`,
            Object.values(communication)[i]
          );
        });
      });

      try {
        postController({
          options,
          params: {
            header: {
              'Content-Type': 'multipart/form-data'
            }
          }
        })
          .then(resp => {
            if (resp.data) {
              this.$emit('save-callback', storeCommunications);
            }
          })
          .finally(() => {
            this.loading = false;
            store.commit('common/setDetachedFormMode', false);
          });
      } catch (e) {
        console.error(e);
      }
    }
  },
  components: {
    'el-dialog': Dialog,
    ContactForm,
    Button
  }
};
</script>

<style lang="scss" scoped>
.el-dialog__wrapper {
  & ::v-deep .el-dialog {
    max-width: 477px !important;
  }

  & ::v-deep .contact-form {
    & ::v-deep .el-select {
      width: 160px;
      min-width: 160px;
      margin-right: 12px;
    }

    & ::v-deep .el-select + .el-form-item {
      width: 253px;
    }

    & ::v-deep .el-input {
      margin-right: 12px;
    }
  }

  & ::v-deep .contact-type {
    margin-right: 12px;
    width: 160px;
    min-width: 160px;
  }

  & ::v-deep .contact-value {
    width: 253px;
  }

  & ::v-deep .delete-button {
    margin-left: 12px;
  }
}
</style>
