<template>
  <el-dialog
    title="Экспорт резюме в XLS"
    :visible="is_visible"
    :close-on-click-modal="false"
    width="456px"
    @close="resetCallback"
    class="dialog"
  >
    <div v-loading="loading">
      <div class="dialog-body">
        <div class="message">Выберите необходимые поля для экспорта</div>
        <Button
          buttonSize="medium"
          buttonColor="blue"
          :buttonText="isSelectedAll ? 'Снять всё' : 'Выбрать всё'"
          @click.prevent="switchAll"
        />
        <div class="checkbox-form">
          <div class="checkbox-item" v-for="(checkbox, index) in serverData" :key="index">
            <Checkbox
              :name="checkbox.name"
              :value="Number(checkbox.value)"
              :disabled="checkbox.required"
              @change="val => handleCheckbox(checkbox, val)"
            />
            {{checkbox.label}}
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Сохранить"
          @click.prevent="saveData"
        />
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отмена"
          @click.prevent="resetCallback"
          class="cancel-button"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { postController } from '@/controllers/request.js';
import { mixin, errorMsg } from '@/utils/mixins';
import { MODULE } from '@/utils/constants';
import { Dialog } from 'element-ui';
import { store } from '@/store';
import Button from 'Elements/Button/Button';
import Checkbox from 'Elements/Checkbox/CustomCheckbox';

export default {
  mixins: [mixin, errorMsg],
  props: {
    is_visible: {
      type: Boolean
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      serverData: []
    };
  },
  computed: {
      isSelectedAll() {
        return this.serverData.every(elem => elem.value == true);
      }
    },
  created() {
    const formData = new FormData();
    const params = {
      action: 'getResumeExcelExportFieldsPopup',
      module: MODULE.CANDIDATES_MODULE,
      to_pdf: 1,
      jsqon_return: 1
    };

    for (let key in params) {
      formData.set(key, params[key]);
    }

    postController({ options: formData })
      .then(resp => {
        const checkboxList = resp.data.map(element => ({
          ...element, value: true
        }));

        this.serverData = checkboxList;
      })
      .catch(err =>
        this.catchError(
          err,
          'Возникла ошибка при получении чекбоксов',
          'save candidates to the bot auditory'
        )
      );
  },
  methods: {
    switchAll() {
      if(this.isSelectedAll) {
        this.serverData.forEach(element => {
          if (element.required == false)
            this.$set(element, 'value', false);
        });
      } else {
        this.serverData.forEach(element => {
          if (element.required == false)
            this.$set(element, 'value', true);
        });
      }
    },
    handleCheckbox(checkbox, val) {
      this.$set(checkbox, 'value', Boolean(val));
    },
    saveData() {
      this.loading = true;

      const checkedFields = this.serverData.reduce((accum, currentValue) => {
        if(currentValue.value)
          accum.push(currentValue.name);
        return accum;
      }, []);
      const formData = new FormData();
      const params = {
        action: 'massExportResumes',
        module: MODULE.CANDIDATES_MODULE,
        to_pdf: 1,
        jsqon_return: 1
      };

      for (let key in params) {
        formData.set(key, params[key]);
      }
      for (let field of checkedFields) {
        formData.append('fields[]', field);
      }
      for (let candidate of store.state.common.selected) {
        formData.append('candidate_id[]', candidate);
      }

      postController({ options: formData })
        .then(resp => {
          let blob = new Blob([this.s2ab(atob(resp.data.fileData))], {
            type: resp.data.fileType
          });
          let url = URL.createObjectURL(blob);
          let a = document.createElement("a");

          document.body.appendChild(a);
          a.style = "display: none";
          a.href = url;
          a.download = resp.data.fileName;
          a.click();
          a.remove();
          URL.revokeObjectURL(url);

          if (resp.status == 200) {
            this.showFullNotification({
              title: 'Кандидаты экспортированы в XLS формате',
              showClose: true,
              type: 'success',
              customClass: 'vacancy-success__toast',
              position: 'top-left',
              duration: 10000,
              offset: 100
            });
          }
        })
        .catch(err =>
          this.catchError(
            err,
            'Возникла ошибка при экспотре',
            'export error'
          )
        ).finally(() => {
          this.loading = false;
          store.commit('common/setSelected', {
            arr: [],
            replace: true
          });
          this.resetCallback();
        });
    },
    resetCallback() {
      this.closeDialog('export_resume_to_xls_dialog');
    },
    s2ab(s) {
      let buf = new ArrayBuffer(s.length);
      let view = new Uint8Array(buf);
      for (let i = 0; i != s.length; ++i)
        view[i] = s.charCodeAt(i) & 0xFF;

      return buf;
    }
  },
  components: {
    'el-dialog': Dialog,
    Button,
    Checkbox
  }
}
</script>

<style lang="scss" scoped>
.el-dialog__wrapper.dialog {
  & ::v-deep .el-dialog {
    background: $white !important;
    margin-top: 15vh !important;
    padding: 0px !important;

    &__header {
      padding: 12px 24px !important;

      .el-dialog__title {
        font-size: 18px !important;
        line-height: 28px !important;
        color: $black-200;
        font-family: 'Roboto Medium';
        font-weight: 500;
      }
    }
  }
}

.dialog-body {
  padding: 16px 24px;
  border-top: 1px solid $black-20;
  border-bottom: 1px solid $black-20;
  max-height: 420px;
  overflow-y: auto;

  .message {
    font-size: 15px;
    line-height: 24px;
    color: $black-100;
    margin-bottom: 12px;
    word-break: normal;
  }

  .el-button {
    margin-bottom: 12px;
  }

  .checkbox-form {
    background: $black-10;
    padding: 12px;
    display: flex;
    flex-direction: column;
    background: $black-10;
    gap: 12px;

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: $black-200;
      
      .el-checkbox {
        margin: 0;
      }
    }
  }
}

.dialog-footer {
  padding: 24px;
}

</style>