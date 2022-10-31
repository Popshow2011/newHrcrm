<template>
  <el-select
    v-model="localModel"
    v-bind="$attrs"
    v-loading="calculateTags"
    :ref="field.name || 'dropdown'"
    :data-name="field.name"
    plain
    :size="size"
    :multiple="multiple || $attrs.multiple"
    :multiple-limit="multipleLimit || 0"
    :filterable="isFilterable || $attrs.filterable"
    :filter-method="fieldWithLazyOptions ? filterOptions : ''"
    :required="field.required"
    :readonly="field.readonly || ''"
    :placeholder="
      hidden(field) ? 'Не доступно для редактирования' : field.placeholder || ''
    "
    :default-first-option="defaultFirstOption"
    :disabled="disabled(field) || field.disabled || !!hidden(field)"
    no-data-text="Справочник пуст"
    no-match-text="Ничего не найдено"
    :popper-class="`
      popup-select 
      ${$attrs['popper-class'] || ''} 
      ${field.front_field_type && 'skills-popper' || ''}
    `"
    :value-key="specialField ? 'id' : 'name'"
    class="dropdown-el"
    :class="{
      big: size === 'big',
      medium: size === 'medium',
      small: size === 'small',
      'is-error':
        !!field.error || (simpleErrors && field.required && !localModel),
      'no-label': !!$attrs['no-label'],
      'multi-dropdown':
        (multiple || $attrs.multiple) && Array.isArray(localModel),
      'el-select--clearable':
        field.cancel_button && field.cancel_button == true,
      clearable: showClearButton,
      'loading-tags': calculateTags
    }"
    :collapse-tags="collapseTags"
    @change="changeValue"
    @input.native="
      callback && callback.field && !fieldWithLazyOptions
        ? callback.field.input(field, $event.target.value)
        : null
    "
    @clear="changeValue({ id: '', name: '' })"
    @visible-change="visibleChange"
  >
    <slot></slot>
    <template v-if="!Object.keys($slots).length">
      <el-option
        v-tooltip
        v-for="item in optionsData"
        :key="item.id"
        :label="formatHtml(item.name) || ''"
        :value="item"
        :disabled="item.disabled || disabledByLimit"
        :class="[
          'dropdown-el__option',
          item.sub_text ? 'full-option' : '',
          isSelectedOption(item) ? 'selected-opt' : ''
        ]"
      >
        <span v-if="optionIcon" class="dropdown-el__option-item">
          <span>{{ item.name || '' | format }}</span>
          <Icon
            @click.native.stop="$emit(optionIcon.action, item)"
            :iconName="optionIcon.name"
            :iconColor="optionIcon.color"
          />
        </span>
        <span
          v-else
          :class="[
            'dropdown-el__option-item',
            item.sub_text ? 'full-option__item' : ''
          ]"
        >
          <span :class="item.sub_text ? 'full-option__item__name' : ''">
            {{ item.name || 'Нет данных' | format }}
          </span>

          <span v-if="item.sub_text" class="full-option__item__description">
            {{ item.sub_text || '' | format }}
          </span>
          <Icon
            v-if="isSelectedOption(item) && !multiple"
            iconName="check-grey"
          />
          <Icon
            v-else-if="isSelectedOption(item) && multiple"
            iconName="checkbox-selected"
          />
          <Icon
            v-else-if="!isSelectedOption(item) && multiple"
            iconName="checkbox-unselected"
          />
        </span>
      </el-option>
    </template>
    <component :is="`style`">
      .popup-select { max-width: {{ maxOptionsWidth }}; }
    </component>
    <i
      v-if="hasLeftIcon"
      slot="prefix"
      :class="[
        model.toLowerCase() == 'hh'
          ? 'hh'
          : model.toLowerCase() == 'habr'
          ? 'habr'
          : model.toLowerCase() == 'avito'
          ? 'Avito'
          : model.toLowerCase() == 'superjob'
          ? 'SuperJob'
          : 'Website',
        'el-input__icon'
      ]"
    >
    </i>
    <i
      v-if="showClearButton"
      @click="clear"
      :class="[
        'el-input__icon el-icon-close',
        !localModel ? 'el-icon__blocked' : ''
      ]"
      ref="clear_icon"
    ></i>
    <div
      v-if="
        (!!fieldWithCreateButton && visibleOptionBtn && options.length) ||
        visibleLoadMoreBtn
      "
      class="add-option-btn"
    >
      <span class="add-option-btn__title fw-500 secondary">ДЕЙСТВИЯ</span>
      <span
        v-if="visibleOptionBtn && !!createOptionAccess"
        v-loading="loading"
        @click="$emit('add-new-option', field.name)"
        class="blue add-option-btn__action"
      >
        <Icon iconName="Plus-bold" iconColor="#0075DB" />
        {{ createBtnText }}
      </span>
      <span
        v-if="visibleLoadMoreBtn"
        v-loading="loading"
        @click="$emit('load-more', searchString)"
        class="blue add-option-btn__action"
      >
        <Icon iconName="refresh" iconColor="#0075DB" />
        Загрузить еще
      </span>
    </div>
    <div
      v-if="
        visibleOptionBtn &&
        !options.length &&
        !inputTimer &&
        !visibleLoadMoreBtn &&
        !!createOptionAccess
      "
      class="add-option-btn"
      slot="empty"
    >
      <span class="add-option-btn__title fw-500 secondary">ДЕЙСТВИЯ</span>
      <span
        v-loading="loading"
        @click="$emit('add-new-option', field.name)"
        class="blue add-option-btn__action"
      >
        <Icon iconName="Plus-bold" iconColor="#0075DB" />
        {{ createBtnText }}
      </span>
    </div>
  </el-select>
</template>

<script>
import { store } from '@/store';
import { Select, Option } from 'element-ui';
import { FIELD } from '@/utils/constants';
import { form, mixin } from '@/utils/mixins';
import Icon from 'Elements/Icon/Icon';

export default {
  mixins: [form, mixin],
  inheritAttrs: false,
  props: {
    options: {
      type: [Object, Array],
      default: () => []
    },
    hasLeftIcon: {
      type: Boolean,
      default: false
    },
    field: {
      type: Object,
      default: () => ({
        name: '',
        required: false,
        placeholder: '',
        disabled: false
      })
    },
    model: { type: String, default: '' },
    emitEvent: { type: String, default: 'set-value' },
    callback: {
      type: [Function, Object],
      default: null
    },
    size: {
      type: String,
      default: 'big'
    },
    defaultFirstOption: {
      type: Boolean,
      default: false
    },
    visibleOptionBtn: {
      type: Boolean,
      default: false
    },
    visibleLoadMoreBtn: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    createBtnText: {
      type: String,
      default: 'Создать'
    },
    optionIcon: {
      type: Object,
      default: null
    },
    simpleErrors: {
      type: Boolean, // искусственная подсветка ошибок
      default: false
    },
    clearable: {
      //временная отмашка от форм метаданных
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      elemWidth: 0,
      collapseTags: false,
      calculateTags: false,
      localModel: '',
      maxOptionsWidth: 'auto',
      disabledByLimit: false,
      searchString: '',
      // onceLoaded: false,
      inputTimer: null,
      focused: false,
      hovered: false
    };
  },
  created() {
    setTimeout(() => {
      let input = this.$refs[this.field.name || 'dropdown'].$el;
      input.addEventListener('focusin', () => {
        if (!this.focused) this.focused = true;
      });
      input.addEventListener('focusout', () => {
        if (this.focused) this.focused = false;
      });
      input.addEventListener('mouseenter', () => {
        if (!this.hovered) this.hovered = true;
      });
      input.addEventListener('mouseleave', () => {
        if (this.hovered) this.hovered = false;
      });
      input.addEventListener('resize', () => this.isTagsFitContainer);
    }, 0);
    this.isTagsFitContainer();
  },
  mounted() {
    if (this.$attrs['arrow-multiselect-focus'] && this.field.multiple) {
      this.$refs[this.field.name].$el.querySelector(
        '.el-input input'
      ).readOnly = false;
    }

    if (this.defaultValue) {
      this.localModel = this.defaultValue;
      if (!this.model) this.changeValue(this.optionsData[0]);
    }

    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, false);
    }

    // задаем максимальную ширину списков опций
    const dropdownEl = this.$refs[this.field.name];
    this.maxOptionsWidth = dropdownEl
      ? dropdownEl.$el.offsetWidth + 'px'
      : 'auto';
  },
  computed: {
    showClearButton() {
      return (
        this.clearable &&
        this.localModel != '' &&
        !this.field.readonly &&
        !this.field.disabled &&
        (this.focused || this.hovered)
      );
    },
    defaultValue() {
      return this.defaultFirstOption && !this.model
        ? this.optionsData[0]
        : Array.isArray(this.model)
        ? this.optionsData.filter(opt => this.model.includes(opt.id))
        : this.model
        ? this.optionsData.find(opt =>
            this.field.id_name && this.model == this.field.value
              ? opt.id == this.field.id_name.value
              : (this.specialField ? opt.id : this.formatHtml(opt.name)) ==
                this.model
          )
        : '';
    },
    optionsData: function () {
      if (Array.isArray(this.options)) {
        return this.options.length
          ? this.options
          : this.field.visual_value &&
            this.model == this.field.value &&
            !Array.isArray(this.field.visual_value)
          ? [this.field.visual_value]
          : [];
      } else {
        return Object.keys(this.options).map(key => ({
          id: key,
          name: this.options[key]
        }));
      }
    },
    isFilterable() {
      return (
        this.field.type === FIELD.TYPE.MULTIENUM || this.fieldWithLazyOptions
      );
    },
    specialField() {
      return (
        this.selectType(this.field.type) &&
        (this.multiple ||
          this.field.type === FIELD.TYPE.CURRENCY_ID ||
          this.field.type === FIELD.TYPE.ENUM)
      );
    },
    multiple() {
      return this.field.isMultiSelect || this.field.multiple;
    },
    multipleLimit() {
      return this.field['multiple-limit'] || this.$attrs['multiple-limit'];
    },
    fieldWithLazyOptions() {
      return (
        this.field.type === FIELD.TYPE.RELLINK ||
        this.field.type === FIELD.TYPE.RELATE
      );
    },
    fieldWithCreateButton() {
      return (
        this.field.front_field_type ||
        this.field.quick_create ||
        this.field.answers_collection ||
        this.fieldWithLazyOptions
      );
    },
    config() {
      return store.state.common.config || {};
    },
    createOptionAccess() {
      return this.config.createOptionAccess &&
        this.config.createOptionAccess.hasOwnProperty(this.field.name)
        ? !!this.config.createOptionAccess[this.field.name]
        : true;
    }
  },
  methods: {
    isTagsFitContainer() {
      if (this.localModel.length) {
        this.calculateTags = true;
        this.collapseTags = false;
        setTimeout(() => {
          let select = this.$refs[this.field.name || 'dropdown'].$el;
          let tagsContainer =
            select.getElementsByClassName('el-select__tags')[0];
          let tagsMaxWidth = tagsContainer.offsetWidth;
          let tagWidths = Array.from(
            tagsContainer.getElementsByClassName('el-tag')
          ).map(elem => elem.offsetWidth);
          if (!this.calculateTags) this.calculateTags = true;
          this.collapseTags = false;
          let totalTagsWidth = 0;
          for (let tagWidth of tagWidths) {
            totalTagsWidth += tagWidth + 6;
            if (totalTagsWidth > tagsMaxWidth) {
              this.collapseTags = true;
              this.calculateTags = false;
              return;
            }
          }
          this.calculateTags = false;
        }, 0);
      }
    },
    clear() {
      if (this.localModel && !this.disabled(this.field)) {
        this.localModel = '';
        this.$emit(
          this.emitEvent,
          this.field.name,
          this.localModel,
          this.field.blocked
        );
      }
    },
    changeValue: function (opt) {
      const val = !Array.isArray(opt)
        ? this.specialField
          ? opt.id
          : opt.name
        : opt.map(o => o.id);

      this.$emit(
        this.emitEvent,
        this.field.name,
        val /*  || this.localModel */,
        this.field.blocked
      );

      if (this.callback) {
        if (this.callback && this.callback.field) {
          this.callback.field.change(
            this.field,
            val /* || this.localModel */,
            this.field.blocked
          );
        } else {
          this.callback(val /*  || this.localModel */);
        }
      }

      const { id_name, name, type } = this.field;
      if (
        !this.multiple &&
        type !== FIELD.TYPE.CURRENCY_ID &&
        type !== FIELD.TYPE.ENUM
      ) {
        this.$emit('change-option', name, id_name, opt);
      }

      if (this.multiple) {
        this.isTagsFitContainer();
      }

      if (this.multipleLimit) {
        this.disabledByLimit = this.localModel.length == this.multipleLimit;
      }
    },
    visibleChange(visible) {
      if (!visible && this.fieldWithCreateButton && this.callback) {
        this.callback.field?.visibleChange
          ? this.callback.field.visibleChange(this.field, visible)
          : this.callback.field;
        this.$nextTick(() => this.$refs[this.field.name].blur());
      }
      this.searchString = '';
      if (
        this.field.type === FIELD.TYPE.RELLINK ||
        (this.field.type === FIELD.TYPE.RELATE &&
          visible) /* && !this.onceLoaded */
      ) {
        this.$emit('filter-option', this.searchString);
        // this.onceLoaded = true;
      }
    },
    filterOptions(filterValue) {
      this.searchString = filterValue;
      this.inputPause();
    },
    inputPause() {
      if (this.inputTimer != null) clearTimeout(this.inputTimer);

      this.inputTimer = setTimeout(async () => {
        if (!this.disabledByLimit)
          await this.$emit(
            'filter-option',
            this.searchString,
            this.callback?.field?.input && !!this.createOptionAccess
              ? this.callback.field.input(
                  this.field,
                  this.searchString,
                  this.createOptionAccess
                )
              : null
          );
        this.inputTimer = null;
      }, 1000);
    },
    isSelectedOption(item) {
      return !this.multiple
        ? this.localModel.id === item.id
        : Array.isArray(this.localModel) &&
            this.localModel.some(({ id }) => id === item.id);
    }
  },
  watch: {
    model: function () {
      this.localModel = this.defaultValue || '';
    },
    visibleOptionBtn: function () {
      if (this.visibleOptionBtn) {
        const timer = setInterval(() => {
          const elSelect = $('.add-option-btn').closest(
            '.el-scrollbar.is-empty'
          );

          if (elSelect?.length > 1) return;
          if (elSelect.length) {
            elSelect.show(); // переопределяем библиотечные стили
            // перемещаем элемент с удалением во избежание дублирования:
            elSelect.closest('.el-select-dropdown').append(elSelect.remove());
            clearInterval(timer);
          }
        }, 100);

        setTimeout(() => clearInterval(timer), 1000);
      }
    },
    showClearButton: function () {
      if (this.showClearButton) {
        setTimeout(() => {
          let input = this.$refs[this.field.name || 'dropdown'].$el;
          let clearIcon = this.$refs['clear_icon'];
          let suffixArea = input?.getElementsByClassName(
            'el-input__suffix-inner'
          )[0];
          if (clearIcon) suffixArea?.append(clearIcon);
        }, 0);
      }
    }
  },
  destroyed() {
    if (this.$listeners['set-hidden']) {
      this.$emit('set-hidden', this.field.name, true);
    }
  },
  components: {
    'el-select': Select,
    'el-option': Option,
    Icon
  }
};
</script>

<style lang="scss" scoped>
.el-select {
  width: 100%;

  & ::v-deep .el-input.is-focus > .el-input__inner {
    border: 2px solid $blue80 !important;
  }

  &.loading-tags {
    & ::v-deep .el-tag {
      visibility: hidden;
    }
  }

  &--clearable {
    & ::v-deep .el-input__suffix {
      width: 50px;

      .el-input__suffix-inner {
        display: flex;
        height: 100%;
        flex-direction: row-reverse;
        align-items: center;

        .el-icon-arrow-up {
          display: block !important;
        }

        .el-icon-circle-close {
          content: url('/style/img/cross-small.svg') !important;
          width: 16px;
          height: 16px;
          pointer-events: all;
        }
      }
    }
  }

  & ::v-deep .el-select__caret.is-reverse {
    transform: rotateZ(180deg);
  }

  & ::v-deep .el-select__caret {
    transform: rotateZ(0deg);
  }

  & ::v-deep .el-input__inner {
    border-radius: 4px;
    font-size: 16px;
    color: $black-190;
    font-family: 'Roboto', sans-serif;
  }

  // & ::v-deep .el-input__suffix {
  //   &-inner {
  //     pointer-events: none;
  //   }
  // }

  & ::v-deep .el-input__prefix {
    left: 0 !important;

    .el-input__icon:before {
      content: '';
      width: 24px;
      height: 24px;
      display: inline-block;
      background-size: 20px 20px;
      background-repeat: no-repeat;
      background-position: center center;
      position: absolute;
      top: 50%;
      left: 12px;
      margin-top: -12px;
    }

    .hh:before {
      background-image: url('/style/img/hh.svg');
    }

    .habr:before {
      background-image: url('/style/img/habr.svg');
    }

    .Avito:before {
      background-image: url('/style/img/Avito.svg');
    }

    .SuperJob:before {
      background-image: url('/style/img/SuperJob.svg');
    }

    .widget:before {
      background-image: url('/style/img/widget.svg');
    }
  }

  & ::v-deep .el-icon-arrow-up {
    content: url('/style/img/big-arrow-down.svg');
  }

  & .el-input__icon.el-icon-close {
    content: url('/style/img/cross-small.svg');
    width: 16px;
    height: 16px;
    pointer-events: all;
  }

  & ::v-deep .el-input__icon {
    line-height: 20px;
    padding-bottom: 2px;
  }

  & ::v-deep &__input {
    border: none;
    background-color: inherit;
  }

  &.small:not(.multi-dropdown) ::v-deep .el-input,
  &.small:not(.multi-dropdown) ::v-deep .el-input__inner {
    height: 24px;
    line-height: 24px;
  }

  &.medium:not(.multi-dropdown) ::v-deep .el-input,
  &.medium:not(.multi-dropdown) ::v-deep .el-input__inner {
    height: 32px;
    line-height: 32px;
  }

  &.big:not(.multi-dropdown) ::v-deep .el-input,
  &.big:not(.multi-dropdown) ::v-deep .el-input__inner {
    height: 40px;
    line-height: 40px;
  }

  &:not(.multi-dropdown):hover ::v-deep .el-input__inner {
    background: $black-10 !important;
  }
}

.full-option {
  height: 60px;
  padding: 8px 16px;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: start;

    &__description {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: $black-100;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }

    &__name {
      line-height: 24px;
    }
  }
}

.el-select-dropdown.el-popper {
  font-family: Roboto, sans-serif;

  .full-option {
    height: 60px;
    padding: 8px 16px !important;

    &:hover {
      background-color: $blue-10;
    }
  }

  & ::v-deep .popper__arrow {
    display: none;
  }
}

.dropdown-el__option {
  font-family: 'Roboto', sans-serif;

  .full-option__item {
    display: flex;
    flex-direction: column;
    align-items: start;

    // &__description {
    //   font-weight: 400;
    //   font-size: 14px;
    //   line-height: 20px;
    //   color: $black-100;
    // }

    // &__name {
    //   line-height: 24px;
    // }
  }

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    svg {
      min-width: 20px;
      width: 20px;
      height: 20px;
    }
  }

  &.is-disabled {
    color: $black-50 !important;

    &:hover {
      background-color: unset;
    }

    & ::v-deep span {
      pointer-events: none;
    }
  }
}
</style>

<style lang="scss">
.dropdown-el {
  width: 100%;

  .el-select__tags {
    padding-left: 4px;
    pointer-events: none;

    & > span {
      .el-tag {
        display: flex;
        gap: 4px;
        background: $blue40;
        box-sizing: border-box;
        border-radius: 4px;
        right: 0;

        .el-icon-close {
          display: none;
          content: url('../../../assets/img/close.svg') !important;
          right: 0;
          transform: scale(0.625);
          width: 16px;
          height: 16px;
        }

        &__close {
          background-color: transparent;
          color: $black-80;

          &:hover {
            background-color: transparent;
            color: $black-90;
          }
        }

        .el-select__tags-text {
          color: $white;
          font-weight: normal;
          font-size: 16px;
          line-height: 20px;
          font-family: 'Roboto Medium', sans-serif;
          max-width: 101px;
        }

        &:hover {
          background: $black-20;
          border: 1px solid transparent;

          &__close {
            background-color: transparent;
            color: $black-80;
          }

          .el-select__tags-text {
            color: $black-80;
          }
        }

        &:disabled {
          background: $black-20;
          border: 1px solid #dadfe4;

          &__close {
            background-color: transparent;
            color: $black-50;
          }

          .el-select__tags-text {
            color: $black-50;
          }
        }
      }

      // .el-tag__close
    }
  }
}

.add-option-btn {
  &__title {
    display: block;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 8px 16px;
  }

  &__action {
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 18px;
    padding: 2px 16px;
    cursor: pointer;

    svg {
      margin-right: 4px;
    }
  }
}

.skills-popper .el-scrollbar__wrap {
  overflow: auto;
  margin: 0 !important;
}
</style>
