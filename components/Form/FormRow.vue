<template>
  <el-form-item
    v-if="field && !blocked"
    :prop="field.name"
    :class="[
      'row',
      field.readonly ? 'is-readonly' : '',
      field.background ? 'with-background' : '',
      field.buttons ? 'row--with-btn' : '',
      field.name == 'currency_id' ? 'currency__input' : '',
      field.name == 'superjob_covid' ? 'column-radio__block' : '',
      field.name == 'superjob_payment_period' ? 'row-no-label' : '',
      isEmptyField(field, model) ? 'is-empty-field' : '',
      field.visual_type === 'radiobutton' ? 'radio__block' : ''
    ]"
    :style="`${
      field.background && field.background['background-color']
        ? `background-color: ${field.background['background-color']};`
        : ''
    }${
      field.name == 'superjob_payment_period'
        ? `padding-top: ${
            fieldSize == 'big' ? 40 : fieldSize == 'medium' ? 32 : 24
          }px`
        : ''
    }`"
  >
    <span
      v-if="
        field.type !== FIELD.TYPE.BOOL &&
        field.visual_type !== 'no-label' &&
        field.visual_type !== 'radiobutton'
      "
      v-tooltip
      class="el-form-item__label"
      :class="{
        currency__input: field.name == 'currency_id',
        'no-required-star':
          field.visual_type == 'no-required-star' || noRequiredStar
      }"
      :style="`line-height: ${
        fieldSize == 'big' ? 40 : fieldSize == 'medium' ? 32 : 24
      }px`"
    >
      {{ newLabel || field.lbl }}
      <p v-if="field.help && field.icon_help" class="help__text">
        {{ field.help }}
      </p>
      <Icon v-if="field.required" iconName="redStar" />
    </span>
    <!-- <span class="el-form-item__label" v-if="field.type === FIELD.TYPE.BOOL && field.name =='external_customer'">
     <br>
    </span> -->
    <DatePicker
      v-if="dateType(field.type) && !timePickerField"
      :field="field"
      :model="model"
      :datepicker="datepicker"
      :size="fieldSize"
      :options="pickerOptions[field.name] || {}"
      :callback="callback"
      @set-value="setValue"
    ></DatePicker>
    <TimePicker
      v-else-if="field.type == FIELD.TYPE.DATETIME && timePickerField"
      :model="model"
      :field="field"
      :options="{
        start: '00:00',
        end: '23:30',
        step: '00:30'
      }"
      @set-value="setValue"
    />
    <form
      v-else-if="field.type === FIELD.TYPE.FILE"
      id="upload-doc"
      enctype="multipart/form-data"
    >
      <Upload
        v-loading="addFile_loading"
        name="filename_file"
        :file="filename_file"
        :multiple="true"
        :show-file-list="false"
        uploadText="Перетащите сюда любой документ"
        class="form__upload"
        @upload-file="uploadDocument"
      ></Upload>
    </form>
    <Radio
      v-else-if="
        field.type == FIELD.TYPE.ENUM && field.visual_type === 'radiobutton'
      "
      v-for="(val, key) in field.options"
      :key="key"
      :label="key"
      :model="model"
      :text="val"
      @set-value="val => setValue(field.name, val, field.blocked)"
    />
    <div v-else-if="specializField && field.visual_type">
      <Dropdown
        :field="field"
        :model="categoryModel"
        :options="options"
        :callback="callback"
        :loading="loading"
        :visible-skill-btn="visibleSkillBtn"
        :size="fieldSize"
        :defaultFirstOption="defaultFirstOption"
        @set-value="setValue"
        @change-option="selectOption"
        @add-new-option="addNewOption"
      ></Dropdown>
      <div
        v-if="fieldValue[0] && field.visual_type == 'sub_checkbox'"
        class="specializations-tags"
      >
        <Tag
          v-for="tag in tags"
          :key="tag.index"
          :id="tag.index"
          @close="deleteTag(tag)"
          size="small"
          closable="true"
          :name="tag.name"
        />
      </div>
      <div
        v-else-if="categoryModel && field.visual_type == 'sub_checkbox'"
        class="specializations-tags"
      >
        <Tag
          v-for="tag in model"
          :key="tag"
          :id="tag"
          @close="deleteDraftTag(tag)"
          size="small"
          closable="true"
          :name="
            specializations[categoryModel[0]] &&
            specializations[categoryModel[0]].specializations[tag]
              ? specializations[categoryModel[0]].specializations[tag]
              : specializations[categoryModel[1]] &&
                specializations[categoryModel[1]].specializations[tag]
              ? specializations[categoryModel[1]].specializations[tag]
              : specializations[categoryModel[2]] &&
                specializations[categoryModel[2]].specializations[tag]
              ? specializations[categoryModel[2]].specializations[tag]
              : specializations[categoryModel[3]] &&
                specializations[categoryModel[3]].specializations[tag]
              ? specializations[categoryModel[3]].specializations[tag]
              : specializations[categoryModel[4]] &&
                specializations[categoryModel[4]].specializations[tag]
              ? specializations[categoryModel[4]].specializations[tag]
              : '0'
          "
        />
      </div>
      <p
        v-show="
          (fieldValue[0] || categoryModel[0]) &&
          field.visual_type == 'sub_checkbox'
        "
        style="margin: 12px 0; line-height: 24px"
      >
        Выберите не более 5 специализаций
      </p>
      <div
        v-if="
          (Array.isArray(fieldValue) && fieldValue.length) ||
          (fieldValue.length && field.visual_type == 'sub_radio')
        "
        class="specializations-block"
      >
        <div v-if="field.visual_type == 'sub_checkbox'" style="column-count: 2">
          <CheckboxGroup
            :elements="
              specializations[fieldValue[fieldValue.length - 1]].specializations
            "
            :trueValue="trueValueCheckbox"
            max="5"
            @change="checkSpecial"
          />
        </div>
        <div v-if="field.visual_type == 'sub_radio'" style="column-count: 2">
          <Radio
            v-for="(name, index) in specializations[fieldValue].specializations"
            :key="index"
            :label="index"
            :model="model"
            :text="name"
            @set-value="setRadioValue('specializations', index)"
          />
        </div>
        <Button
          v-if="field.visual_type == 'sub_checkbox'"
          buttonSize="big"
          hasLeftIcon
          :disabled="checkSpecializations.length < 1 || tags.length == 5"
          iconName="Plus-bold"
          buttonColor="blue"
          buttonText="Добавить специализации"
          @click="addSpecial"
        />
      </div>
      <div
        v-else-if="categoryModel && model.length > 0"
        class="specializations-block"
      >
        <div v-if="field.visual_type == 'sub_checkbox'" style="column-count: 2">
          <!-- <p>{{ model }}</p>
          <p>{{ categoryModel }}</p>
          <p>{{ specializations[categoryModel[0]] }}</p> -->

          <CheckboxGroup
            :elements="
              categoryModel.length >= 1 &&
              specializations[categoryModel[categoryModel.length - 1]] &&
              specializations[categoryModel[categoryModel.length - 1]]
                .specializations
            "
            :trueValue="(trueValueCheckbox = draftCheckboxData)"
            max="5"
            @change="checkSpecial"
          />
        </div>
        <div v-if="field.visual_type == 'sub_radio'" style="column-count: 2">
          <Radio
            v-for="(name, index) in specializations[categoryModel]
              .specializations"
            :key="index"
            :label="index"
            :model="Array.isArray(model) ? model[0] : model"
            :text="name"
            @set-value="setRadioValue('specializations', index)"
          />
        </div>
        <Button
          v-if="field.visual_type == 'sub_checkbox' && model"
          buttonSize="big"
          hasLeftIcon
          :disabled="checkSpecializations.length < 1 || tags.length == 5"
          iconName="Plus-bold"
          buttonColor="blue"
          buttonText="Добавить специализации"
          class="no_model"
          @click="addDraftSpecial"
        />
      </div>
    </div>
    <Dropdown
      v-else-if="selectType(field.type)"
      :field="field"
      :model="
        hidden(field)
          ? 'Не доступно для редактирования'
          : field.name == 'areas'
          ? areasModel
          : model
      "
      :options="
        field.type == FIELD.TYPE.RELATE || field.type == FIELD.TYPE.RELLINK
          ? newOptions
          : options
      "
      @load-more="setNewOptions"
      :callback="callback"
      :loading="loading"
      :visible-option-btn="visibleOptionBtn"
      :visibleLoadMoreBtn="loadMoreNum == 50"
      create-btn-text="Добавить"
      :size="field.background ? 'medium' : fieldSize"
      :class="[field.name == FIELD.ID.CURRENCY_ID ? 'currency__input' : '']"
      :defaultFirstOption="defaultFirstOption"
      @set-value="setValue"
      @change-option="selectOption"
      @add-new-option="addNewOption"
      @filter-option="filterOptions"
    />
    <InputMasked
      v-else-if="salaryField"
      :field="field"
      :model="model"
      :mask="['### ', '# ###', '## ###', '### ### ', '# ### ###', '## ### ###']"
      :callback="callback"
      :size="fieldSize"
      @set-value="setValue"
    ></InputMasked>
    <InputMasked
      v-else-if="phoneField"
      :field="field"
      :model="model"
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
      :callback="callback"
      :size="fieldSize"
      @set-value="setValue"
    />
    <CustomCheckbox
      v-else-if="
        field.type === FIELD.TYPE.BOOL && field.visual_type != 'switcher'
      "
      :disabled="disabled(field) || field.disabled"
      :name="field.name"
      :text="field.lbl"
      :value="Number(model)"
      :required="field.required"
      @change="val => setValue(field.name, val, field.blocked)"
    >
    </CustomCheckbox>
    <Switcher
      v-else-if="switcherField(field)"
      :model="!!Number(model)"
      :disabled="disabled(field) || field.disabled"
      :name="field.name"
      :required="field.required"
      :inactive-text="field.lbl"
      @switch="val => setValue(field.name, String(+val), field.blocked)"
    />
    <Input
      v-else-if="hidden(field)"
      :field="field"
      model="Не доступно для редактирования"
      :disabled="true"
      :readonly="true"
      :size="fieldSize"
    />
    <!-- <Input v-else-if="field.name == 'currency_id'" class="currency__input"  :field="field" :model="model" @set-value="setValue" /> -->
    <Input
      v-else
      :field="field"
      :model="model"
      :size="fieldSize"
      :disabled="disabled"
      @set-value="setValue"
    />
  </el-form-item>
</template>
<script>
import { FormItem } from 'element-ui';
import { form, mixin } from '@/utils/mixins';
import { FIELD, MODULE, ACTION } from '@/utils/constants';
import DatePicker from 'Elements/DatePicker/DatePicker';
import TimePicker from 'Elements/TimePicker/TimePicker';
import Dropdown from 'Elements/Select/Dropdown';
import Input from 'Elements/Input/Input';
import InputMasked from 'Elements/Input/InputMasked';
import Radio from 'Elements/Radio/Radio';
import CustomCheckbox from 'Elements/Checkbox/CustomCheckbox';
import CheckboxGroup from 'Elements/Checkbox/CheckboxGroup';
import Switcher from 'Elements/Switch/Switch';
import Icon from 'Elements/Icon/Icon';
import Button from 'Elements/Button/Button';
import Tag from 'Elements/Tag/Tag';
import { getController, postController } from '@/controllers/request.js';
import { store } from '@/store';
import Upload from 'Elements/Upload/Upload';

export default {
  mixins: [form, mixin],
  props: {
    field: {
      type: Object
    },
    parentId: {
      type: String,
      default: ''
    },
    model: {
      type: [String, Array, Object, Boolean]
    },
    module: String,
    options: {
      type: Array
    },
    callback: {
      type: Object
    },
    datepicker: Object,
    visibleOptionBtn: {
      type: Boolean,
      default: false
    },
    fieldSize: {
      type: String,
      default: 'big'
    },
    width: {
      type: String,
      default: 'unset'
    },
    loading: {
      type: Boolean
    },
    blocked: {
      type: Boolean,
      default: false
    },
    newLabel: {
      type: String,
      default: ''
    },
    noRequiredStar: Boolean,
    defaultFirstOption: {
      type: Boolean,
      default: false
    },
    searchParam: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      FIELD,
      filename_file: [],
      newOptions: [],
      pickerOptions: {
        birth_date: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          }
        },
        date_event: {
          disabledDate(time) {
            // disabled since yesterday
            var date = new Date();
            date.setDate(date.getDate() - 1);
            return time.getTime() <= date;
          },
          showWeekDay: true
        },
        date: {
          disabledDate(time) {
            // disabled since yesterday
            var date = new Date();
            date.setDate(date.getDate() - 1);
            return time.getTime() <= date;
          },
          showWeekDay: true
        }
      },
      fieldValue: [],
      checkSpecializations: [],
      tags: [],
      addFile_loading: false,
      trueValueCheckbox: this.draftCheckboxData || [],
      sendCheckboxData: [],
      checkOptions: [],
      loadMoreNum: 0
      // draftCheckboxData: []
    };
  },
  created() {
    if (
      (this.field.type == FIELD.TYPE.RELATE ||
        this.field.type == FIELD.TYPE.RELLINK) &&
      this.field.visual_type != FIELD.VISUAL_TYPE.ENUM
    ) {
      if (this.options?.length) {
        this.newOptions = this.options;
      }
    }
  },
  computed: {
    salaryField() {
      return (
        this.field.type === FIELD.TYPE.DECIMAL ||
        this.field.type === FIELD.TYPE.CURRENCY
      );
    },
    specializations() {
      return this.field.options;
    },
    areasModel() {
      if (typeof this.model === 'string') {
        return [`${this.model}`];
      } else {
        return this.model;
      }
    },

    categoryModel() {
      if (this.field.visual_type == 'sub_radio') {
        let stringModel = String(this.model);
        if (stringModel.slice(0, stringModel.indexOf('.'))) {
          return stringModel.slice(0, stringModel.indexOf('.'));
        } else return '';
      } else if (this.field.visual_type == 'sub_checkbox') {
        let newArray = [];
        for (let item in this.model) {
          if (
            newArray.indexOf(
              this.model[item].slice(0, this.model[item].indexOf('.'))
            ) < 0
          ) {
            newArray.push(
              this.model[item].slice(0, this.model[item].indexOf('.'))
            );
          }
        }
        return newArray;
      } else {
        return '';
      }
    },
    phoneField() {
      return (
        this.field.name == FIELD.ID.PHONE_NUMBER ||
        this.field.name == FIELD.ID.PHONE ||
        this.field.name == FIELD.ID.CONTACTS_PHONES
      );
    },
    draftCheckboxData() {
      let draftCheckbox = [];
      if (this.categoryModel) {
        for (let item in this.model) {
          for (let i in this.categoryModel) {
            if (
              typeof this.field.options[this.categoryModel[i]]?.specializations[
                this.model[item]
              ] !== 'undefined' &&
              draftCheckbox.indexOf(
                this.field.options[this.categoryModel[i]]?.specializations[
                  this.model[item]
                ] < 0
              )
            ) {
              draftCheckbox.push(
                this.field.options[this.categoryModel[i]]?.specializations[
                  this.model[item]
                ]
              );
            }
          }
        }
      }
      return draftCheckbox || '';
    },
    specializField() {
      return this.field.name == FIELD.ID.SPECIALIZATIONS;
    },
    timePickerField() {
      return (
        this.field.hasOwnProperty(FIELD.PARAM.VISUAL_TYPE) &&
        this.field[FIELD.PARAM.VISUAL_TYPE] == FIELD.VISUAL_TYPE.TIMEPICKER
      );
    }
  },
  methods: {
    updateFormData(formData) {
      formData.set('module', MODULE.NOTES);
      if (this.parentId) formData.set('parent_id', this.parentId);
      formData.set('action', ACTION.SAVE);
      formData.set('parent_type', this.module);
      formData.set('jsqon_return', 1);
      return formData;
    },
    uploadDocument(file) {
      const form = document.getElementById('upload-doc');
      let formData = new FormData(form);
      formData = this.updateFormData(formData);
      this.addFile_loading = true;

      if (file) {
        const { raw: blob, name } =
          Array.isArray(file) && file.length ? file[0] : file;
        formData.set('filename_file', blob, name);

        const params = {
          header: {
            'Content-Type': 'multipart/form-data'
          }
        };

        postController({ options: formData, params })
          .then(() => {
            this.filename_file = [];
            this.$emit('update-documents-list');
          })
          .catch(err =>
            this.catchError(
              err,
              'Возникла ошибка при загрузке документа',
              'upload file'
            )
          )
          .finally(() => {
            this.addFile_loading = false;
          });
      }
    },
    filterOptions(search_string, cb) {
      this.newOptions = [];
      this.setNewOptions(search_string, cb);
    },
    async setNewOptions(search_string = '', cb) {
      if (
        (this.field.name == FIELD.ID.MANNING_TABLE_NAME && this.field.oshs
          ? this.field.oshs
          : false) ||
        (this.field.name == FIELD.ID.LINE_MANAGER_NAME && this.field.oshs
          ? this.field.oshs
          : false) ||
        (this.field.name == FIELD.ID.NAME_ID && this.field.oshs
          ? this.field.oshs
          : false)
      ) {
        if (search_string != '' && this.options.length) {
          let searchArr = [];
          for (let key in this.options) {
            if (
              this.options[key].name
                .toLowerCase()
                .indexOf(search_string.toLowerCase()) >= 0
            ) {
              searchArr.push(this.options[key]);
            }
          }

          this.newOptions = searchArr;
        } else {
          this.newOptions = this.options || [];
        }
      } else {
        const perPage = 50;
        const iteration =
          0 || this.newOptions.length - this.model?.length <= 0
            ? 0
            : (this.newOptions.length - this.model?.length) / perPage;
        const params = {
          module: this.module,
          to_pdf: true,
          action: 'get_rel_fields_values',
          iteration: Math.ceil(iteration) || 0,
          field: this.field.name,
          search_string: search_string.trim()
        };

        if (this.field.search_param && this.searchParam) {
          params[this.field.search_param] = this.searchParam;
        }

        const { data } = await getController({ params });
        if (!data) return;

        this.loadMoreNum = 0;
        this.checkOptions = [];
        let keyOptions = [];
        if (this.options?.length) {
          for (let i in this.options) {
            keyOptions.push(this.options[i].id);
            if (this.newOptions && !this.newOptions.includes(this.options[i])) {
              this.newOptions.unshift(this.options[i]);
            }
          }
        }

        for (let key in data) {
          this.loadMoreNum++;

          if (typeof data[key] == 'object') {
            if (keyOptions.indexOf(data[key].id) == -1) {
              const params = {
                id: data[key].id,
                name: this.formatHtml(data[key].name)
              };

              if (data[key].sub_text) {
                params.sub_text = this.formatHtml(data[key].sub_text);
              }

              this.checkOptions = [...this.checkOptions, params];
            }
          } else if (typeof data[key] == 'string') {
            const value = this.formatHtml(data[key]);
            if (keyOptions.indexOf(key) == -1) {
              this.checkOptions = [
                ...this.checkOptions,
                { id: key, name: value }
              ];
            }
          }
        }

        this.newOptions = [...this.newOptions, ...this.checkOptions];

        store.commit('common/setNewOptions', {
          name: this.field.name,
          val: this.newOptions
        });
      }

      if (cb) cb(this.field, search_string);
      return this.newOptions;
    },
    selectOption(...params) {
      if (this.field.type == FIELD.TYPE.RELATE) {
        this.$emit('change-option', ...params, 'form', this.newOptions);
      } else {
        this.$emit('change-option', ...params);
      }
    },
    deleteTag(tag) {
      this.tags = this.tags.filter(e => e != tag);
      this.trueValueCheckbox.splice(
        this.trueValueCheckbox.indexOf(tag.name),
        1
      );
      this.sendCheckboxData.splice(this.sendCheckboxData.indexOf(tag.index), 1);

      this.$emit('set-value', 'specializations', this.sendCheckboxData);
    },
    deleteDraftTag(tag) {
      this.sendCheckboxData = [];
      for (let item in this.model) {
        if (this.model[item] != tag) {
          this.sendCheckboxData.push(this.model[item]);
        }
      }

      this.trueValueCheckbox.splice(this.trueValueCheckbox.indexOf(tag), 1);

      this.$emit('set-value', 'specializations', this.sendCheckboxData);
    },
    checkSpecial(name, ind) {
      if (this.draftCheckboxData.length > 0) {
        for (let item in this.model) {
          if (
            this.trueValueCheckbox.indexOf(this.draftCheckboxData[item]) < 0
          ) {
            this.trueValueCheckbox.push(this.draftCheckboxData[item]);
          }
          if (
            typeof this.checkSpecializations.find(
              spec => spec.index === this.model[item]
            ) == 'undefined'
          ) {
            this.checkSpecializations.push({
              index: this.model[item],
              name: this.draftCheckboxData[item]
            });
          }
        }
      }
      if (
        this.trueValueCheckbox.indexOf(name) < 0 &&
        this.model.indexOf(name) < 0
      ) {
        let index = ind;
        this.checkSpecializations.push({ name, index });
        this.trueValueCheckbox.push(name);
      } else {
        this.trueValueCheckbox.splice(this.trueValueCheckbox.indexOf(name), 1);
        let index = this.fieldValue[0];

        this.checkSpecializations.splice(
          this.checkSpecializations.indexOf({ name, index }),
          1
        );
      }
    },
    addSpecial() {
      for (let item in this.checkSpecializations) {
        let newArr = this.tags;
        if (
          newArr.filter(el => el.index == this.checkSpecializations[item].index)
            .length == 0 &&
          this.tags.length < 5
        ) {
          this.tags.push(this.checkSpecializations[item]);
          this.sendCheckboxData.push(this.checkSpecializations[item].index);
        } else if (this.tags.length == 0) {
          this.tags.push(this.checkSpecializations[item]);
          this.sendCheckboxData.push(this.checkSpecializations[item].index);
        }
      }

      this.$emit('set-value', 'specializations', this.sendCheckboxData);
      this.checkSpecializations = [];
    },
    addDraftSpecial() {
      this.sendCheckboxData = [];
      if (this.checkSpecializations.length <= 5) {
        for (let item in this.checkSpecializations) {
          this.sendCheckboxData.push(this.checkSpecializations[item].index);
        }
      }

      this.$emit('set-value', 'specializations', this.sendCheckboxData);
      this.checkSpecializations = [];
    },
    setValue(name, val, blocked) {
      if (
        name == 'specializations' &&
        (this.field.visual_type == 'sub_checkbox' ||
          this.field.visual_type == 'sub_radio')
      ) {
        this.fieldValue = val;
        if (this.tags) {
          let newValue = [];
          for (let item in this.tags) {
            for (let i in this.trueValueCheckbox) {
              if (this.tags[item].name == this.trueValueCheckbox[i]) {
                newValue.push(this.trueValueCheckbox[i]);
              }
            }
          }
          this.trueValueCheckbox = newValue;
        } else {
          this.trueValueCheckbox = [];
        }
        this.checkSpecializations = [];
      } else {
        this.$emit('set-value', name, val, blocked);
      }
    },
    setRadioValue(name, val) {
      this.$emit('set-value', name, val);
    },
    addNewOption(name) {
      this.$emit('add-new-option', name);
    }
  },
  watch: {
    options: {
      handler: function () {
        if (
          this.field.type == FIELD.TYPE.RELATE ||
          this.field.type == FIELD.TYPE.RELLINK
        ) {
          this.newOptions = this.options;
        }
      },
      deep: true
    }
  },
  components: {
    'el-form-item': FormItem,
    DatePicker,
    TimePicker,
    Dropdown,
    Input,
    InputMasked,
    CustomCheckbox,
    Icon,
    Radio,
    Switcher,
    Button,
    Tag,
    CheckboxGroup,
    Upload
  }
};
</script>
<style lang="scss" scoped>
.with-background {
  padding: 20px;
  border-radius: 4px;

  .el-form-item__content {
    .el-form-item__label {
      overflow: unset !important;
      white-space: normal !important;
      margin-bottom: 16px;
      margin-right: 0 !important;
      line-height: 24px !important;
    }
  }
}

.currency__input {
  width: 128px;

  & ::v-deep .el-form-item {
    width: auto !important;
  }
}

.form__upload {
  width: 100%;
  max-width: 448px;
}

.row-no-label {
  padding-top: 24px;
}

.el-form-item ::v-deep {
  .el-upload-dragger {
    min-height: 136px !important;
  }

  .specializations-tags {
    line-height: 0;
    margin-top: 12px;

    .el-tag {
      margin: 0 8px 8px 0;
    }
  }

  .specializations-block {
    background: $black-10;
    border-radius: 4px;
    margin-top: 12px;
    padding: 12px;

    > div {
      .spec-checkbox {
        margin-bottom: 12px;
        max-height: unset;
        display: inline-flex;
        column-count: 2;
        width: 100%;
        align-content: start;

        .el-checkbox__label {
          white-space: normal;
          word-break: break-word;
        }
      }

      .el-radio {
        margin-bottom: 12px;
        margin-right: 0;
        width: 100%;
        height: auto;
        display: inline-flex;

        .el-radio__label {
          font-size: 16px;
          padding-left: 10px;
          white-space: break-spaces;
          line-height: 20px;
          word-break: normal;
        }
      }
    }

    button {
      margin-top: 12px;
    }
  }

  &__content {
    & ::v-deep .el-checkbox {
      // margin-top: 30px;

      &__label {
        font-weight: normal;
        font-size: 16px;
        line-height: 24px;
      }
    }
  }

  &__label {
    color: $black-200;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 24px;
    display: flex;

    .help__text {
      display: inline;
      color: $black-80;
      margin-left: 4px;
    }
  }
}
</style>

<style lang="scss">
.el-form-item {
  width: auto;
}

.currency__input {
  width: 128px;

  .el-form-item {
    width: auto;
  }
}

.radio__block {
  display: flex;
  flex-direction: row;

  .el-form-item__content {
    width: fit-content !important;
    display: flex;
    flex-direction: row !important;

    .el-form-item__label {
      display: none;
    }

    .el-radio {
      width: fit-content;
    }
  }
}

.column-radio__block {
  .el-form-item__content {
    width: 100%;
    display: flex;
    flex-direction: column !important;

    .el-form-item__label {
      display: none;
    }

    .el-radio {
      margin-bottom: 12px;

      &__label {
        font-size: 14px;
        line-height: 24px;
      }
    }

    .el-radio:last-child {
      margin-bottom: 4px;
    }
  }
}
</style>
