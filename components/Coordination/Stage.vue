<template>
  <div class="application-stage">
    <div class="application-stage__header">
      <el-form
        ref="form-body"
        :model="form"
        :rules="rules"
        label-width="100%"
        :size="formSize"
        enctype="multipart/form-data"
        class="header-form"
      >
        <div class="no-margin">
          <form-field
            :key="`${formFields.name.name}`"
            :item="{ ...formFields.name, lbl: 'Название', placeholder: 'Этап' }"
            :form="form"
            :form-size="formSize"
            :options="options"
            :blocked="blocked"
            :callback="callback"
            class="header-form__field-name"
            @set-value="setFieldValue"
          ></form-field>
          <form-field
            :key="`${formFields.coordination_term.name}_${updateKey}`"
            :item="{
              ...formFields.coordination_term,
              lbl: 'Срок в раб. дн.',
              disabled: !setCoordinationTerm,
              required: setCoordinationTerm,
              validation: {
                max: 999
              }
            }"
            :form="form"
            :form-size="formSize"
            :options="options"
            :blocked="blocked"
            :callback="callback"
            :class="[
              'header-form__field-coordination-term',
              { 'no-error': noError }
            ]"
            @set-value="validateAndSetCoordTermValue"
          ></form-field>
          <form-field
            :key="`${formFields.operator.name}`"
            :item="{ ...formFields.operator, lbl: 'Порядок согласования' }"
            :form="form"
            :form-size="formSize"
            :options="options"
            :blocked="blocked"
            :callback="callback"
            defaultFirstOption
            class="header-form__field-operator"
            @set-value="setFieldValue"
          ></form-field>
        </div>
      </el-form>
      <Button
        v-if="showDeleteStageButton"
        buttonSize="big"
        buttonColor="transparent"
        hasLeftIcon
        iconName="delete"
        buttonText="Удалить этап"
        class="header__delete-stage-button"
        @click="deleteStage"
      />
    </div>
    <div class="application-stage__body">
      <div class="application-stage-coordinators">
        <div
          class="coordinator"
          v-for="(coordinator, i) in coordinators"
          v-show="!coordinator.deleted"
          :key="`coord-${i}`"
        >
          <Dropdown
            :key="`${fields.hrpac_coordinators.value[0].coordinator_type.name}${i}`"
            :field="coordinator.coordinator_type"
            :model="form.hrpac_coordinators[i].coordinator_type"
            :options="coordinator.coordinator_type.options"
            defaultFirstOption
            class="coordinator__type"
            :callback="val => changeFieldValue('coordinator_type', val, i)"
          />
          <Dropdown
            ref="coordinator-value-dropdown"
            v-loading="coordinator.coord_value_loading"
            :key="`${fields.hrpac_coordinators.value[0].coordinator_value.name}${i}`"
            :field="{
              ...coordinator.coordinator_value,
              placeholder: 'Выберите'
            }"
            :model="form.hrpac_coordinators[i].coordinator_value"
            filterable="true"
            :options="coordinatorsNames(coordinator.coordinator_value.options)"
            class="coordinator__value"
            :callback="val => changeFieldValue('coordinator_value', val, i)"
          />
          <Button
            v-if="showDeleteCoordinatorButton"
            buttonSize="big"
            buttonColor="transparent"
            hasLeftIcon
            iconName="delete-user"
            buttonText="Удалить согласующего"
            class="coordinator__delete-button"
            @click="deleteCoordinator(coordinator)"
          />
        </div>
        <Button
          buttonSize="big"
          buttonColor="blue"
          hasLeftIcon
          iconName="Plus-bold"
          buttonText="Добавить согласующего"
          class="coordinator__add-button"
          @click="addCoordinator"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Form } from 'element-ui';
import { getController } from '@/controllers/request';
import { mixin, form, metadata, saveForm, rules } from '@/utils/mixins';
import { MODULE, DEFAULT_FORM_SIZE } from '@/utils/constants';
import FormField from 'Elements/Form/FormField';
import Button from 'Elements/Button/Button';
import Dropdown from 'Elements/Select/Dropdown';
export default {
  mixins: [mixin, form, metadata, saveForm, rules],
  components: {
    'el-form': Form,
    FormField,
    Button,
    Dropdown
  },
  props: {
    fields: Object,
    showDeleteStageButton: {
      type: Boolean,
      default: false
    },
    setCoordinationTerm: {
      type: Boolean,
      default: false
    },
    getFieldVals: Function,
    options: Array,
    getObjectWithoutValue: Function,
    deleted: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.coordinators = [...this.fields.hrpac_coordinators.value];
    this.form = this.getFieldVals(this.fields);
    this.formFields = this.fields;
    if (this.formFields.name.required) {
      this.formFields.name.required = !this.formFields.name.required;
    }
    if (!this.coordinators.length) this.addCoordinator();
    if (this.coordinators.length == 1 && !this.coordinators[0].id.value) {
      const id = this.generateCoordinatorId();
      this.$set(this.coordinators[0], 'coord_id', {
        value: id
      });
      this.$set(this.form.hrpac_coordinators[0], 'coord_id', id);
    }
    this.form.deleted = this.fields.deleted;
  },
  data() {
    return {
      coordinators: {},
      formSize: DEFAULT_FORM_SIZE,
      formFields: {},
      form: {},
      updateKey: 0,
      blocked: {}
    };
  },
  watch: {
    setCoordinationTerm() {
      this.form.coordination_term = '';
      this.updateKey++;
    },
    deleted() {
      this.form.deleted = this.deleted ? 1 : 0;
      if (this.deleted) {
        this.form.hrpac_coordinators = this.form.hrpac_coordinators.filter(
          val => val.id
        );
        this.form.hrpac_coordinators.forEach(val => (val.deleted = 1));
      }
    }
  },
  computed: {
    showDeleteCoordinatorButton() {
      return this.coordinators.filter(val => val.id && !val.deleted).length > 1;
    },
    rules() {
      return this.setCoordinationTerm
        ? {
            operator: {
              required: true,
              message: 'Необходимо заполнить поле',
              trigger: ['blur', 'focus', 'change']
            },
            coordination_term: {
              required: true,
              message: 'Необходимо заполнить поле',
              trigger: ['blur', 'focus', 'change']
            }
          }
        : {
            operator: {
              required: true,
              message: 'Необходимо заполнить поле',
              trigger: ['blur', 'focus', 'change']
            }
          };
    },
    noError() {
      return this.form.coordination_term;
    }
  },
  methods: {
    validateAndSetCoordTermValue(name, value, blocked) {
      if (Number(value) <= 999) {
        this.setFieldValue(name, value, blocked);
      } else {
        this.setFieldValue(name, '999', blocked);
        this.updateKey++;
      }
    },
    coordinatorsNames(option) {
      var sortable = [];
      for (var opt in option) {
        sortable.push([opt, option[opt]]);
      }

      sortable.sort(function (a, b) {
        return a[1].localeCompare(b[1]);
      });

      var objSorted = {};
      sortable.forEach(function (item) {
        objSorted[item[0]] = item[1];
      });
      return objSorted;
    },
    generateCoordinatorId() {
      let num = 0;
      let coordinatorId = '';
      let finish = false;
      do {
        coordinatorId = `newCoordinator${num}`;
        this.coordinators.length > 0
          ? this.coordinators.find(el => {
              return el.coord_id
                ? el.coord_id.value.includes(coordinatorId)
                : false;
            })
            ? num++
            : (finish = true)
          : (finish = true);
      } while (!finish);
      return coordinatorId;
    },
    deleteStage() {
      this.$emit(
        'delete-stage',
        this.fields.id.value ? this.fields.id.value : this.fields.stage_id.value
      );
    },
    addCoordinator() {
      if (!this.form.hrpac_coordinators) this.form.hrpac_coordinators = [];
      this.form.hrpac_coordinators.push({
        id: '',
        coord_id: `newCoordinator${this.coordinators.length}`,
        coordinator_type: '',
        coordinator_value: ''
      });
      this.coordinators = [
        ...this.coordinators,
        {
          id: {
            name: 'id',
            type: 'id',
            value: ''
          },
          coord_value_loading: false,
          coord_id: {
            value: `newCoordinator${this.coordinators.length}`
          },
          coordinator_type: this.getObjectWithoutValue(
            this.fields.hrpac_coordinators.value[0].coordinator_type
          ),
          coordinator_value: this.getObjectWithoutValue(
            this.fields.hrpac_coordinators.value[0].coordinator_value
          )
        }
      ];
    },
    deleteCoordinator(coordinator) {
      const coordToDel = coordinator.id.value
        ? this.form.hrpac_coordinators.find(
            coord => coord.id == coordinator.id.value
          )
        : this.form.hrpac_coordinators.find(
            coord => coord.coord_id == coordinator.coord_id.value
          );
      const coordToDelIndex = this.form.hrpac_coordinators.indexOf(coordToDel);
      if (coordinator.id.value) {
        this.$set(this.form.hrpac_coordinators[coordToDelIndex], 'deleted', 1);
        this.$set(this.coordinators[coordToDelIndex], 'deleted', 1);
      } else {
        this.form.hrpac_coordinators.splice(coordToDelIndex, 1);
        this.coordinators.splice(coordToDelIndex, 1);
      }
    },
    async changeFieldValue(field, val, i) {
      this.form.hrpac_coordinators[i][field] = val;
      if (field == 'coordinator_type') {
        try {
          this.coordinators[i].coord_value_loading = true;
          this.loadCoordinators = true;
          const data = await getController({
            params: {
              module: MODULE.HRPAC_COORDINATION_SCENARIOS,
              action: 'getList',
              type: val,
              to_pdf: true
            }
          });
          this.$set(
            this.coordinators[i].coordinator_value,
            'options',
            data.data
          );
          this.form.hrpac_coordinators[i]['coordinator_value'] = Object.keys(
            data.data
          )[0];
          this.form.hrpac_coordinators[i]['coordinator_value'] = '';
        } catch (err) {
          console.log(err);
        } finally {
          this.coordinators[i].coord_value_loading = false;
        }
      } else {
        this.$refs['coordinator-value-dropdown'][i].$el.classList.remove(
          'empty-value'
        );
      }
    },
    validateAndGetStageInfo() {
      let formValid = '';
      let formToSend = { ...this.form };
      if (formToSend.name == '') {
        formToSend.name = 'Этап';
      }
      //удаление технических полей id
      delete formToSend.stage_id;
      formToSend.hrpac_coordinators.forEach(
        coordinator => delete coordinator.coord_id
      );
      let hasEmptyCoodinator = false;
      for (let i = 0; i < this.form.hrpac_coordinators.length; i++) {
        if (!this.form.hrpac_coordinators[i].coordinator_value) {
          this.$refs['coordinator-value-dropdown'][i].$el.classList.add(
            'empty-value'
          );
          hasEmptyCoodinator = true;
        }
      }
      this.$refs['form-body'].validate(valid => {
        valid && !hasEmptyCoodinator
          ? (formValid = { validationResult: 'valid', formInfo: formToSend })
          : (formValid = { validationResult: 'not valid' });
      });
      return formValid;
    }
  }
};
</script>

<style lang="scss" scoped>
.no-error {
  & ::v-deep .el-form-item__error {
    display: none;
  }
}

.application-stage {
  margin-top: 24px;
  &__header {
    display: flex;
    background: $black-10;
    padding: 24px;
    border-bottom: 1px solid $border-black;
    border-radius: 4px 4px 0 0;
  }

  .header {
    &-form {
      &__field {
        &-name {
          min-width: 516px;
        }
        &-coordination-term {
          max-width: 136px;
          margin-left: 16px;

          & ::v-deep .el-input__inner:focus {
            border-color: $border-focused !important;
          }

          & ::v-deep .el-input.is-disabled {
            & > .el-input__inner {
              border-color: $black-30 !important;
            }
          }
        }
        &-operator {
          max-width: 185px;
          margin-left: 16px;

          & ::v-deep .el-form-item__label {
            padding: 0;
          }
        }
      }
    }

    &__delete-stage-button {
      margin: 24px 0 0 16px;
    }
  }

  &__body {
    display: flex;
    background: $black-10;
    padding: 8px 24px 24px 24px;
    border-radius: 0 0 4px 4px;
  }

  &-coordinators {
    .coordinator {
      display: grid;
      grid-template-columns: 0.5fr 1fr 1fr;
      gap: 16px;
      margin-top: 16px;

      &__type {
        width: 198px;
      }

      &__value {
        width: 655px;

        &.empty-value {
          & ::v-deep .el-input__inner {
            border: 1px solid $red-error !important;
          }
        }
      }

      &__add-button {
        margin-top: 24px;
        width: 869px;
      }
    }
  }
}

.no-margin {
  padding: 0;
  margin-left: 0;
  display: flex;

  .sub-fields {
    .el-form-item__content {
      display: flex;
    }
  }

  .el-form-item {
    margin: 0;
  }

  .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
