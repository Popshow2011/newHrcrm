<template>
  <div class="filter-frame shadow-lvl-1">
    <div class="filter-frame__header">
      <div class="filter-frame__header-content">
        <div>
          <Icon iconName="Filter" />
          <h4>Фильтры</h4>
        </div>
        <div class="filter-template">
          <Dropdown
            :model="myActiveFilter"
            :field="{
              name: 'template',
              type: 'enum',
              placeholder: 'Шаблоны',
              disabled: canNotSaveFilters || !Object.keys(savedFilters).length
            }"
            :options="savedFilters"
            size="medium"
            popper-class="template-list"
            :optionIcon="{
              name: 'delete',
              color: '#CDD4DA',
              action: 'remove-tag'
            }"
            @remove-tag="removeTag"
            @set-value="selectTemplate"
          />
        </div>
      </div>
    </div>
    <div class="filter-frame__header-buttons">
      <Button
        buttonSize="medium"
        buttonColor="blue"
        buttonText="Добавить"
        @click="addFilter(filters.length - 1)"
      />
      <Button
        buttonSize="medium"
        buttonColor="blue"
        buttonText="Удалить все"
        @click="resetForm"
      />
    </div>
    <div class="filter-frame__sortable" v-if="orderBy">
      <p>Сортировка</p>
      <div class="filter-frame__sort-items">
        <Dropdown
          class="choose"
          placeholder="Выберите"
          size="medium"
          :options="orderBy"
          :model="form.orderBy"
          :field="{
            disabled: Object.keys(menuOpts).length === 1,
            type: enumType
          }"
          default-first-option
          :callback="localModel => $set(form, 'orderBy', localModel)"
          @set-value="(name, val) => $set(form, 'orderBy', val)"
        />
        <Button
          class="button-sort"
          buttonSize="medium"
          buttonColor="blue"
          hasLeftIcon
          buttonText=""
          :iconName="getSortIconName"
          @click="sortBy"
        />
      </div>
    </div>
    <div class="filter-frame__items">
      <el-form
        ref="filterForm"
        id="filter-form"
        v-if="filters"
        :model="form"
        :rules="rules"
        size="mini"
        hide-required-asterisk
      >
        <el-form-item
          v-for="({ filter, menuOpts }, i) in filters"
          :key="`${filter.name}_${i}`"
          :prop="filter.name"
          :rules="rules[filter.name]"
          class="filter"
        >
          <div class="flex-row">
            <p>Поле</p>
            <button
              type="button"
              class="delete-button"
              @click="deleteFilter(i, filter.name)"
            >
              <Icon iconName="delete" iconColor="#DADFE4" />
            </button>
          </div>
          <div class="filter__choose-button">
            <Dropdown
              :model="filters[i].opt"
              size="medium"
              :options="menuOpts"
              filterable
              :field="{
                disabled: Object.keys(menuOpts).length === 1,
                type: enumType,
                placeholder: 'Выбрать'
              }"
              popper-class="filter-dropdown"
              default-first-option
              class="choose"
              @set-value="
                (name, model) => {
                  $set(filters[i], 'opt', model);
                  selectFilter(filters[i].opt, filter.name, i);
                }
              "
            />
          </div>
          <p>Значение</p>
          <Input
            v-if="
              filter.field_type === 'text' || filter.field_type === 'number'
            "
            :model="form[filter.name]"
            :field="{
              name: filter.name,
              maxlength: '255',
              type: filter.type,
              htmlType: filter.field_type
            }"
            :min="filter.min"
            size="medium"
            @set-value="
              (name, val) => {
                $set(form, filter.name, val);
                $refs.filterForm.validate();
              }
            "
            class="filter-form__filter"
          />
          <Multiselect
            v-if="filter.field_type === 'select' && filter.multiselect"
            v-model="form[filter.name]"
            :options="filter.options"
            :name="filter.name + '_val'"
            size="medium"
            filterable
            popper-class="filter-dropdown"
            placeholder="Выбрать"
          />
          <Dropdown
            v-else-if="filter.field_type === 'select'"
            :model="form[filter.name]"
            :field="{
              name: filter.name,
              placeholder: '',
              multiple: filter.multiselect,
              type: 'enum'
            }"
            filterable
            :options="filter.options"
            :arrow-multiselect-focus="true"
            popper-class="filter-dropdown"
            size="medium"
            class="filter-form__filter"
            @keyup.enter.native="findByFilter"
            @set-value="
              (name, val) => {
                $set(form, filter.name, val);
                changeFilter(filter, i);
              }
            "
          />
          <DatePicker
            v-if="
              filter.field_type === FIELD.TYPE.DATETIME ||
              filter.type === FIELD.TYPE.DATE ||
              filter.type == FIELD.TYPE.DATETIMECOMBO
            "
            :model="form[filter.name]"
            size="medium"
            :field="{
              name: filter.name,
              type:
                filter.type == FIELD.TYPE.DATETIMECOMBO ? 'datetime' : 'date'
            }"
            :datepicker="datepicker"
            :options="pickerOptions"
            :class="['filter-form__filter', 'filter-form__filter--date']"
            @set-value="(name, val) => $set(form, filter.name, val)"
          />
          <div class="filter-form__sub-filter" v-if="filter.double">
            <el-form-item
              v-for="(type, name) in filter.double"
              :key="name"
              :prop="name"
              v-show="type !== 'hidden'"
            >
              <input
                v-if="type === 'hidden'"
                :type="type"
                v-model="form[name]"
                :name="name"
              />
              <DatePicker
                v-if="type === FIELD.TYPE.DATETIME"
                :model="form[name]"
                :field="{
                  name,
                  type: 'date',
                  placeholder: new Date().toLocaleString().split(',')[0]
                }"
                :datepicker="datepicker"
                size="medium"
                :options="pickerOptions"
                @set-value="(name, val) => $set(form, name, val)"
              />
            </el-form-item>
          </div>
        </el-form-item>
      </el-form>
      <Button
        buttonSize="big"
        class="save-button"
        buttonColor="blue"
        buttonText="Сохранить как шаблон"
        @click="showDialogSave"
        :disabled="canNotSaveFilters"
      />
    </div>
    <div class="filter-frame__footer">
      <Button
        buttonSize="big"
        class="save-button"
        buttonColor="darkBlue"
        buttonText="Показать результаты"
        @click="findByFilter"
        :loading="requestSent"
      />
    </div>
    <FilterPopup
      :dialogVisible="is_visible.save"
      @closeForm="showDialogSave"
      @saveFilters="saveFilters"
      :value="savedFilters[myActiveFilter]"
    />
  </div>
</template>

<script>
import { Form, FormItem } from 'element-ui';
import { setDateFormat } from '@/utils/helpers';
import { mixin } from '@/utils/mixins';
import { FIELD, SORT_ORDER } from '@/utils/constants';
import ButtonEl from 'Elements/Button/Button';
import Dropdown from 'Elements/Select/Dropdown';
import Input from 'Elements/Input/Input';
import Multiselect from 'Elements/Select/Multiselect';
import DatePicker from 'Elements/DatePicker/DatePicker';
import FilterPopup from 'Elements/Filters/FilterPopup';
import Icon from 'Elements/Icon/Icon';
import { store } from '@/store';
import lang from 'element-ui/lib/locale/lang/ru-RU';
import locale from 'element-ui/lib/locale';

locale.use(lang);

export default {
  mixins: [mixin],
  props: {
    dateFormat: {
      type: String,
      default: 'd/m/Y'
    },
    fModule: {
      type: String,
      default: ''
    },
    fAction: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: ''
    },
    only_assigned: {
      type: String,
      default: '0'
    }
  },
  data() {
    const validateSalaryRange = (rule, value, callback) => {
      this.validateNumberRange(false, value, callback, [
        this.form.salary_min_advanced,
        this.form.salary_max_advanced
      ]);
    };

    const validateAgeRange = (rule, value, callback) => {
      this.validateNumberRange(false, value, callback, [
        this.form.age_min_advanced,
        this.form.age_max_advanced
      ]);
    };

    const validateDateEnteredRange = (rule, value, callback) => {
      this.validateDateRange(
        false,
        value,
        callback,
        [
          this.form.start_range_date_entered_advanced,
          this.form.end_range_date_entered_advanced
        ],
        this.datepicker.dateFormat
      );
    };

    const validateDateStatusRange = (rule, value, callback) => {
      this.validateDateRange(
        false,
        value,
        callback,
        [
          this.form.start_range_date_status_modified_advanced,
          this.form.end_range_date_status_modified_advanced
        ],
        this.datepicker.dateFormat
      );
    };

    return {
      FIELD,
      enumType: FIELD.TYPE.ENUM,
      datepicker: {
        dateFormat: '',
        timeFormat: 'HH:mm'
      },
      pickerOptions: {
        // disabledDate(time) {
        //   return time.getTime() > Date.now();
        // },
        firstDayOfWeek: 1
      },
      filterModule: '',
      remove_filter_dialog: false,
      activeCollapse: '',
      loading: false,
      filterMode: {}, // храним данные из хранилища filter-mode по страницам
      menuOpts: [],
      form: {},
      filtersClone: {},
      filters: [],
      canNotSaveFilters: false,
      defaultParams: {},
      savedFilters: {},
      myActiveFilter: null,
      saved_search_name: '',
      orderBy: null,
      removableTag: null,
      unique: {
        date_fields: {}
      },
      hWidth: 0,
      defaultCount: 1,
      rules: {
        age_max_advanced: [
          {
            validator: validateAgeRange,
            trigger: 'change'
          }
        ],
        age_min_advanced: [
          {
            validator: validateAgeRange,
            trigger: 'change'
          }
        ],
        start_range_date_entered_advanced: [
          {
            validator: validateDateEnteredRange,
            trigger: 'change'
          }
        ],
        end_range_date_entered_advanced: [
          {
            validator: validateDateEnteredRange,
            trigger: 'change'
          }
        ],
        start_range_date_status_modified_advanced: [
          {
            validator: validateDateStatusRange,
            trigger: 'change'
          }
        ],
        end_range_date_status_modified_advanced: [
          {
            validator: validateDateStatusRange,
            trigger: 'change'
          }
        ],
        salary_max_advanced: [
          {
            validator: validateSalaryRange,
            trigger: 'change'
          }
        ],
        salary_min_advanced: [
          {
            validator: validateSalaryRange,
            trigger: 'change'
          }
        ]
      },
      is_visible: {
        save: false,
        add: false
      },
      action: ''
    };
  },
  created() {
    document.addEventListener('keypress', this.enterForm);
    this.$on('hook:beforeDestroy', () =>
      document.removeEventListener('keypress', this.enterForm)
    );

    const { filters, savedSearchData, sortable, custom_filters } =
      this.filterConfig;
    this.filterModule = savedSearchData ? savedSearchData.module : this.fModule;
    this.$set(this.datepicker, 'dateFormat', setDateFormat(this.dateFormat));

    if (sortable) {
      this.orderBy = { ...sortable.fields };
      const sortByColVal = sortable.orderBy || Object.keys(this.orderBy)[0];
      this.$set(
        this.form,
        'sortOrder',
        sortable.sortOrder || sortable.lvso || sortable.sorttype[0]
      );
      this.$set(
        this.form,
        'lvso',
        sortable.sortOrder || sortable.lvso || sortable.sorttype[0]
      );
      this.$set(this.form, 'orderBy', sortByColVal.toUpperCase());
    } else {
      this.$set(this.form, 'lvso', SORT_ORDER.DESC);
    }

    if (custom_filters) {
      Object.values(custom_filters).forEach(item =>
        store.commit('filters/setCustomFilter', {
          filter: item.name,
          val: item.value || '0'
        })
      );
    }

    if (savedSearchData) {
      const { hasOptions, options, selected } = savedSearchData;
      if (hasOptions && options) {
        this.savedFilters = { ...options };
        this.myActiveFilter = selected;
      }
    } else {
      this.canNotSaveFilters = true;
    }

    const hasValue = [];
    const hasDefaultParam = [];

    for (let key in filters) {
      const { label, name, type, subtype, parent, default_show } = filters[key];
      const params = {};
      const date_fields = this.setUniqFields(filters, key);
      const isDateRoot = this.hasDateFields && date_fields.root === key;
      const subDate =
        this.hasDateFields &&
        date_fields.double &&
        date_fields.double.hasOwnProperty(key);

      if (isDateRoot || subDate) continue;
      if (subtype && this.hasDateFields) {
        const parentField = this.unique.date_fields[parent];

        if (parent && parentField) {
          this.menuOpts[name] = filters[parentField.root].label;
          params.field_type = 'select';
          params.double = { ...parentField.double };
          parentField.child = key;
          const { value, ...obj } = filters[key];

          // для отсутствующих знач-й субполей в this.form:
          if (
            !Object.keys(parentField.double).filter(name => this.form[name])
              .length
          ) {
            this.filtersClone[name] = { ...obj, ...params };
            this.$set(
              this.form,
              key,
              filters[key].type == FIELD.TYPE.DATE && value
                ? this.formatDate(value, this.datepicker.dateFormat)
                : value
            );
            continue;
          }
        }
      } else {
        this.menuOpts[name] = label;
        switch (type) {
          case 'varchar':
          case 'text':
          case 'name':
            params.field_type = 'text';
            break;

          case 'decimal':
          case 'int':
          case 'currency':
            params.field_type = 'number';
            params.min = 0;
            break;

          case 'relate':
          case 'currency_id':
            params.field_type = 'select';
            break;

          case 'enum':
          case 'multienum':
            params.field_type = 'select';
            params.multiselect = true;
            break;

          case 'datetime':
            params.field_type = 'datetime';
            break;

          default:
            break;
        }
      }

      const { value, ...obj } = filters[key];
      this.filtersClone[name] = { ...obj, ...params };
      if (value) {
        this.$set(
          this.form,
          key,
          filters[key].type == FIELD.TYPE.DATE && value
            ? this.formatDate(value, this.datepicker.dateFormat)
            : this.formatHtml(value)
        );

        hasValue.push(name);
        this.filters.push({
          opt: name,
          filter: { ...obj, ...params }
        });
      }
      if (default_show) {
        hasDefaultParam.push(key);
      }
    }

    this.defaultCount = hasDefaultParam.length || 1;
    if (hasValue.length < this.defaultCount + 1) {
      // определяем дефолтное поле, если все фильтры без значений или с ограничениями
      const addDefaultField = () => {
        const defaultFilters = hasDefaultParam.length
          ? Array.from(hasDefaultParam, i => this.filtersClone[i])
          : [Object.values(this.filtersClone)[0] || {}];
        defaultFilters.forEach(obj => {
          if (!this.filters.find(i => i.opt === obj.name)) {
            this.$set(this.form, obj.name, '');
            this.filters.push({
              opt: obj.name,
              filter: obj
            });
          }
        });
      };

      if (hasValue.length >= this.defaultCount) {
        hasValue.forEach(key => {
          const { subtype, parent } = this.filtersClone[key];

          if (
            subtype &&
            this.hasDateFields &&
            this.unique.date_fields[parent]
          ) {
            if (
              !Object.keys(this.unique.date_fields[parent].double).filter(
                name => this.form[name]
              ).length
            ) {
              addDefaultField();
            }
          }
        });
      } else {
        addDefaultField();
      }
    }
    if (this.filters.length) {
      this.updateFilterList();
    }
  },
  mounted() {
    // фикс проблемы для кастомных фильтров (параметры в запросе при search)
    this.action = 'search';

    if (this.fAction !== 'Popup') {
      this.sendRequest('inject_config');
    }
  },
  computed: {
    filterConfig() {
      return store.state.filters.filterConfig || {};
    },
    getSortIconName() {
      return this.form.lvso.toUpperCase() == 'ASC' ? 'Sort-ASC' : 'Sort-DESC';
    },
    requestSent: {
      get() {
        return store.state.common.requestSent;
      },
      set(val) {
        store.commit('common/setRequestState', val);
      }
    },
    hasDateFields() {
      return (
        this.unique.date_fields && Object.keys(this.unique.date_fields).length
      );
    }
  },
  methods: {
    saveFilters(filterName, action) {
      this.action = action === 'update' ? 'update' : 'save';
      this.saveTag(filterName);
    },
    resetForm() {
      this.$refs.filterForm.resetFields();
      for (let key in this.form) {
        this.$set(this.form, key, '');
      }
      this.filters = this.filters.slice(0, 1);

      this.resetDateFields();
      this.myActiveFilter = null;
      this.removableTag = null;
      store.commit('filters/resetCustomFilters');

      if (this.orderBy) {
        this.$set(this.form, 'lvso', 'ASC');
        this.$set(this.form, 'sortOrder', 'ASC');
        this.$set(this.form, 'orderBy', Object.keys(this.orderBy)[0]);
      }

      store.commit('common/setSelected', {
        arr: [],
        replace: true
      });
      this.$emit('update');
    },
    resetDateFields(key) {
      if (!this.hasDateFields) return;

      this.filters.forEach(({ filter }, idx) => {
        if (!filter.parent) return;

        if ((key && filter.name === key) || !key) {
          const defaultVal = Object.keys(filter.options)[0];
          this.changeDateOperator(idx, filter.name, defaultVal);
          this.$set(this.form, filter.name, defaultVal);
        }
      });
    },
    setUniqFields(filters, data, choosenFilter = null) {
      const uniqField = {};
      const prepareDateFilter = key => {
        if (filters.hasOwnProperty(key)) {
          if (filters[key].type === FIELD.TYPE.DATETIME) {
            const { structure, operator, datef, value } = filters[key];
            if (!operator || !structure) return;

            const operatorEl = operator || Object.keys(structure)[0];

            uniqField.root = key;
            uniqField.double = {};

            if (this.dateFormat !== datef) {
              this.$set(this.datepicker, 'dateFormat', setDateFormat(datef));
            }

            const setParams = (type, name, i) => {
              uniqField.double[name] =
                type === 'string'
                  ? FIELD.PARAM.HIDDEN
                  : type === 'date'
                  ? FIELD.TYPE.DATETIME
                  : '';

              if (filters[name] && filters[name].value) {
                this.$set(
                  this.form,
                  name,
                  filters[name].value
                    ? this.formatDate(
                        filters[name].value,
                        this.datepicker.dateFormat
                      )
                    : filters[name].value
                );
              }
              // для случая, если субполя в filters не приходят,
              // значение по ним проставляем из value корневого поля:
              if (value && value[i]) {
                this.$set(
                  this.form,
                  name,
                  value[i]
                    ? this.formatDate(value[i], this.datepicker.dateFormat)
                    : value[i]
                );
              }
            };

            if (structure[operatorEl].hasOwnProperty('length')) {
              structure[operatorEl].forEach(({ name, type }, idx) =>
                setParams(type, name, idx)
              );
            } else {
              const { type, name } = structure[operatorEl];
              setParams(type, name, 0);
            }

            const fieldData = choosenFilter
              ? { ...uniqField, child: choosenFilter }
              : uniqField;
            this.$set(this.unique.date_fields, key, fieldData);
          }
        }
      };

      if (data && Array.isArray(data)) {
        // будет возвращать лишь по 1 найденному полю uniqField
        data.forEach(key => prepareDateFilter(key));
      }

      if (data && !Array.isArray(data)) {
        prepareDateFilter(data);
      }

      return uniqField;
    },
    checkForSubtype(field, obj) {
      if (field && obj && obj.name === field) {
        const { subtype, double } = obj;

        if (subtype && this.hasDateFields) {
          this.resetDateFields(field);
          Object.keys(double).forEach(f => this.$set(this.form, f, ''));
        }
      }
    },
    changeDateOperator(idx, filter, operator) {
      const obj = Object.assign({}, this.filterConfig.filters);
      const parentName = obj[filter].parent;
      const currentFilter = this.filters[idx] ? this.filters[idx].filter : null;
      obj[parentName]['operator'] = operator || this.form[filter];

      if (currentFilter) {
        Object.keys(currentFilter.double).forEach(key =>
          this.$set(this.form, key, '')
        );
      }

      const date_fields = this.setUniqFields(obj, parentName, filter);
      if (date_fields && date_fields.hasOwnProperty('double')) {
        Object.keys(date_fields.double).forEach(key =>
          this.$set(
            this.form,
            key,
            date_fields.double[key] !== 'hidden'
              ? ''
              : `[${obj[parentName]['operator']}]`
          )
        );

        if (currentFilter) {
          this.filtersClone[filter] = { ...currentFilter, ...date_fields };
          this.$set(currentFilter, 'double', { ...date_fields.double });
        }
      }
    },
    updateFilterList() {
      const selectedOpts = Array.from(this.filters, ({ opt }) => opt);
      this.filters.forEach(({ opt }, i) => {
        let filterList = { ...this.menuOpts };
        selectedOpts.forEach(s_opt => {
          if (s_opt !== opt) {
            this.$delete(filterList, s_opt);
          }
        });
        this.$set(this.filters[i], 'menuOpts', filterList);
      });
    },
    changeFilter(filter, idx) {
      if (filter.subtype) {
        this.changeDateOperator(idx, filter.name);
      }
    },
    sendRequest(mode = 'default') {
      this.requestSent = true;
      this.loading = true;
      let action = this.action;

      if (
        action == 'save' ||
        action == 'delete' ||
        action == 'select' ||
        action == 'update'
      ) {
        this.defaultParams.searchFormTab = 'advanced_search';
        this.defaultParams.module = 'SavedSearch';
        this.defaultParams.action = 'index';
      } else {
        this.defaultParams.action = this.fAction;
      }

      this.defaultParams.saved_search_name =
        this.action == 'save' ? this.saved_search_name : '';
      this.defaultParams.saved_search_select =
        action == 'delete'
          ? this.removableTag
          : action == 'select' || action == 'update'
          ? this.myActiveFilter
          : '_none';
      this.defaultParams.search_module =
        action != 'search' ? this.filterModule : ''; // && !this.page
      this.defaultParams.saved_search_action =
        action != 'search' && action != 'select' ? action : '';

      if (action == 'delete' && this.myActiveFilter) {
        this.defaultParams.after_search_select = this.myActiveFilter;
      }

      if (this.fModule) {
        if (mode === 'inject_config') {
          this.$emit('set-filters', { ...this.form, ...this.defaultParams });
          this.requestSent = false;
        } else {
          this.$emit('filter', { ...this.form, ...this.defaultParams });
        }
      }

      this.action = '';
    },
    deleteFilter(idx, filter) {
      if (this.filters.length > this.defaultCount) {
        this.$set(this.form, filter, '');
        this.checkForSubtype(filter, this.filters[idx].filter);
        this.filters.splice(idx, 1);
        this.updateFilterList();
      }
    },
    addFilter(idx) {
      let list = [...Object.values(this.filtersClone)];

      this.filters.filter(({ filter }) => {
        let idx;
        list.filter(({ name }, i) => (name === filter.name ? (idx = i) : name));
        list.splice(idx, 1);
      });

      if (list.length) {
        this.$delete(list[0], 'value');
        this.filters.splice(++idx, 0, {
          filter: list[0],
          menuOpts: [...this.menuOpts],
          opt: list[0].name
        });
        this.updateFilterList();
      }
    },
    selectFilter(filter, oldFilter, idx) {
      this.$set(this.form, oldFilter, '');
      this.checkForSubtype(oldFilter, this.filters[idx].filter);
      this.$set(this.filters[idx], 'filter', this.filtersClone[filter]);
      this.updateFilterList();
    },
    selectTemplate(name, val) {
      // let selected = this.myActiveFilter !== filter ? filter : '';
      this.myActiveFilter = val;
      this.defaultParams.saved_search_select = val;
      this.action = 'select';
      this.sendRequest();
    },
    findByFilter() {
      if (this.action !== 'update') {
        this.action = 'search';
      }
      this.$refs.filterForm.validate(valid => {
        if (valid) {
          this.sendRequest();
        }
      });
    },
    enterForm(e) {
      if (
        e.keyCode === 13 &&
        ((e.target.closest('.filter-frame') !== null &&
          e.target.dataset.event !== 'no-enter') ||
          e.target.localName === 'body')
      ) {
        this.findByFilter();
      }
    },
    sortBy() {
      const isDesc = this.form['lvso'] == SORT_ORDER.DESC.toUpperCase();
      const sortValue = isDesc ? SORT_ORDER.ASC : SORT_ORDER.DESC;
      this.$set(this.form, 'lvso', sortValue.toUpperCase());
      this.$set(this.form, 'sortOrder', sortValue.toUpperCase());
    },
    saveTag(value) {
      if (value) {
        this.saved_search_name = value;
        this.sendRequest();
        this.saved_search_name = '';
      }
    },
    removeTag(tag) {
      this.removableTag = tag;
      if (this.removableTag) {
        this.action = 'delete';
        this.sendRequest();
      }
    },
    showDialogSave: function () {
      return (this.is_visible['save'] = !this.is_visible['save']);
    }
  },
  components: {
    'el-form': Form,
    'el-form-item': FormItem,
    Button: ButtonEl,
    Dropdown,
    Input,
    Multiselect,
    DatePicker,
    FilterPopup,
    Icon
  }
};
</script>

<style lang="css">
.el-scrollbar__view .el-select-dropdown__item .filter-template__text-wrapper {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style lang="scss" scoped>
.button-sort {
  margin-left: 12px;
  width: 48px;

  & ::v-deep .button-content {
    margin: 4px 12px;
  }
}

#front .filter {
  border: 1px solid $black-30;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 4px;
  margin-bottom: 8px;
  margin-right: 0;
  font-size: 16px;
  line-height: 24px;

  & ::v-deep .el-form-item__content {
    flex-direction: column;
    text-align: left;

    .el-input {
      &__inner {
        height: 32px;
        font-size: 16px;
      }

      // &__prefix {
      //   display: none;
      // }
    }

    p {
      margin: 12px 0 0 0;
      color: $black-200;
      font-size: 16px;
      line-height: 24px;
    }
  }

  &__choose-button {
    display: inline-flex;
    border: 1px solid #e2e2e2;
    box-sizing: border-box;
    border-radius: 4px;
    width: 100%;
    background: white;
    height: 32px;

    .choose {
      flex-grow: 1;
      border: none;
      overflow: hidden;

      & ::v-deep .el-input__inner {
        border: none;
        height: 30px;
        // color: #606266;
      }
    }
  }

  .sort {
    position: relative;
    margin: 0 16px;
    border: none;
    background: none;
    height: 100%;
    width: 24px;
    vertical-align: middle;
    padding: 0;

    &:hover {
      background: none;

      path {
        stroke: $black-30 !important;
      }
    }

    &:disabled {
      background: $black-30;
      color: $black-40;
    }
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    line-height: 24px;

    p {
      margin: 0 0 8px 0;
    }
  }
}

.template-list li {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}

.delete-button {
  align-self: flex-start;
  position: relative;
  cursor: pointer;
  margin-left: 12px;
  border: none;
  background: none;
  height: 24px;
  width: 24px;
  padding: 0;

  &:hover {
    background: none;

    path {
      stroke: $black-30 !important;
    }
  }

  &:disabled {
    background: $black-30;
    color: $black-40;
  }
}

.filter-frame {
  height: calc(100vh - 100px);
}

#front .filter-frame {
  background: $white;
  border-radius: 6px;
  width: 384px;
  position: fixed;

  &__sort-items {
    display: flex;

    .choose {
      width: 292px;
    }
  }

  &__header {
    &-content {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px 16px 16px;
      border-bottom: 1px solid $black-20;

      div {
        display: inline-flex;
        align-items: center;

        h4 {
          margin: 0;
          margin-left: 4px;
          font-size: 18px;
          line-height: 28px;
          color: $black-200;
          font-weight: bold;
          padding: 0;
        }
      }

      .filter-template {
        .el-select-dropdown__item {
          // color: $black-90;
          align-items: center;
          display: flex;
        }

        &__option.selected {
          // font-family: Arial, sans-serif;
          font-size: 30px;
          line-height: 24px;
        }

        .el-select {
          width: 140px; //127
          height: 32px;

          &-dropdown__list {
            li {
              color: $blue-120 !important;
            }
          }

          & ::v-deep .filter-template__option.selected {
            // color: #000 !important;
            text-decoration-color: $blue-120;
            font-size: 45px;
          }

          .filter-template__option {
            // font-family: Arial, sans-serif;
            font-size: 15px;
            line-height: 24px;
            color: $black-90;
          }

          ::-webkit-input-placeholder {
            color: $black-200;
          }

          & ::v-deep .el-select__caret.is-reverse {
            transform: rotateZ(180deg);
            //padding-left: 16px;
            //padding-top: 2px;
            // padding-left: 0;
          }

          & ::v-deep .el-select__caret {
            transform: rotateZ(0deg);
          }

          & ::v-deep .el-input__inner {
            border-radius: 4px;
            height: 32px;
            padding: 0 35px 0 16px;
            border: none;
            font-size: 16px;
            // color: black !important;
            // font-family: Arial, sans-serif;
          }

          & ::v-deep .el-icon-arrow-up::before {
            content: url('../../../assets/img/arrow-down.svg');
          }

          & ::v-deep .el-input__icon {
            line-height: 20px;
            padding-bottom: 2px;
            box-sizing: border-box;
            //padding-right: 16px;
          }
        }
      }
    }

    &-buttons {
      padding: 8px 16px;
      border-bottom: 1px solid $black-20;
      text-align: left;

      .el-button {
        margin-right: 15px;
      }
    }
  }

  &__sortable {
    margin: 0;
    padding: 8px 16px;
    border-bottom: 1px solid $black-20;
    text-align: left;
  }

  &__items {
    padding: 8px;
    height: calc(100% - 185px);
    overflow-y: auto;

    // &::-webkit-scrollbar {
    //   width: 12px;
    //   background-color: $blue-20;
    //   border-radius: 4px;
    // }

    & ::v-deep .el-form-item__error {
      position: relative;
      margin-top: 4px;
      top: unset;
      left: unset;
    }
  }

  &__sortable + .filter-frame__items {
    height: calc(100% - 253px);
  }

  &__footer {
    padding: 24px;
    background-color: $white;
    border-top: 1px solid $black-20;
    padding: 16px;
    position: absolute;
    bottom: 0;
    width: 100%;
    border-radius: 0 0 6px 6px;
  }

  .save-button {
    width: 100%;
  }
}

.filter-form__sub-filter {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;

  .el-form-item {
    width: calc(50% - 10px);

    .el-input {
      width: auto;
    }
  }
}

.el-select {
  display: block;

  & ::v-deep .el-icon-arrow-up::before {
    content: url('/front/public/style/img/arrow-down.svg');
  }
}
</style>
<style lang="scss">
.filter-dropdown {
  max-width: 332px;
}
</style>
