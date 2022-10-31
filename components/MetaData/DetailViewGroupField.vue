<template>
  <div
    class="group-field-item"
    v-if="item[0].lbl && item[0].name && parentBoolFieldChecked"
  >
    <p v-if="hasLabel" class="group-field-item__label primary">
      {{ item[0].lbl }}:
    </p>
    <p
      v-if="!hasValue && !isCollapse"
      class="group-field-item__value group-field-item__value-noinfo disabled-reg"
    >
      нет данных
    </p>
    <div v-else-if="isTag" class="header-tags">
      <Tag
        v-for="(tag, index) in fieldValue.split(/,\s*/g)"
        :key="index"
        class="tags-item"
        :name="tag"
        :closable="false"
      />
    </div>
    <el-collapse v-else-if="isCollapse" @change="readonlyMode = true">
      <el-collapse-item
        name="1"
        :disabled="
          item[0].disabled ||
          item[0].visibility == 'disabled' ||
          !item[0].id_name.value
        "
        :class="{ 'edit-mode': !readonlyMode }"
      >
        <template slot="title">
          <h3 class="description-title primary">
            {{ item[0].lbl }}
          </h3>
          <Icon iconName="smallTriangle" class="arrow-icon" />
        </template>
        <VacancyProjectDescription
          v-if="item[0].name == 'project_description_id'"
          :item="item[0]"
          :readonly="readonlyMode"
          @set-mode="val => (readonlyMode = val)"
        />
        <div v-else v-html="item[0].value"></div>
      </el-collapse-item>
    </el-collapse>
    <Link
      v-else-if="!isTag && !isCollapse && isUrl"
      :href="item[0].value"
      :text="item[0].value"
      :underline="false"
    />
    <p
      v-else-if="!isTag && !isCollapse && !isUrl"
      class="group-field-item__value"
      :class="isText ? 'primary' : 'blue'"
      v-html="fieldValue"
    ></p>
  </div>
</template>

<script>
import { store } from '@/store';
import { FIELD } from '@/utils/constants';
import { Collapse, CollapseItem } from 'element-ui';
import VacancyProjectDescription from 'Parts/Vacancy/Details/VacancyProjectDescription';
import Tag from 'Elements/Tag/Tag';
import Icon from 'Elements/Icon/Icon';
import Link from 'Elements/Link/Link';
export default {
  props: {
    item: {
      type: Array,
      default: () => []
    },
    storeModule: String,
    countId: String,
    rowsCount: Number
  },
  data() {
    return {
      readonlyMode: true
    };
  },
  computed: {
    fields() {
      return this.storeModule == 'selectionPanel'
        ? store.state.selectionPanel.candidates[this.countId].fields
        : store.state[this.storeModule].fields || {};
    },
    hasLabel() {
      return (
        !(
          this.item[0].detailview_visual_type == 'no-label' &&
          this.rowsCount == 1
        ) && this.item[0].detailview_visual_type != 'collapse'
      );
    },
    hasValue() {
      const { type, fields_arr, blocked } = this.item[0];
      if (type === FIELD.TYPE.GROUP && fields_arr) {
        // проверка на true хотя бы в одном субполе
        return fields_arr.some(name => !!Number(this.fields[name].value));
      } else if (type === FIELD.TYPE.BOOL && blocked) {
        return blocked.some(name => {
          const { validation, value } = this.fields[name];
          return validation && validation.rules ? !!Number(value) : !!value;
        });
      }

      return this.fieldValue.trim();
    },
    fieldValue() {
      const field = this.fields[this.item[0].name];
      const concatValues = () => {
        const fieldsArray = field.fields_arr || field.blocked || [];

        if (!fieldsArray.length) return field.value;
        return fieldsArray.reduce((acc, name) => {
          const { symbol, type, validation, options, after_placeholder } =
            this.fields[name];

          const value = this.fields[name].value;
          const isRange = validation && validation.rules;
          const fieldVal = isRange
            ? new Intl.NumberFormat().format(parseInt(value || '0'))
            : value;

          const rangeString = isRange
            ? validation.rules.includes('<') && fieldVal != 0
              ? 'От '
              : validation.rules.includes('>') && fieldVal != 0
              ? ' до '
              : ''
            : '';

          return type == FIELD.TYPE.CURRENCY_ID
            ? acc + symbol
            : type == FIELD.TYPE.ENUM
            ? acc + options[value] || ''
            : acc +
              rangeString +
              `${fieldVal == 0 ? '' : fieldVal}  ${after_placeholder || ''}`;
        }, '');
      };

      return field.type == FIELD.TYPE.GROUP || field.type == FIELD.TYPE.BOOL
        ? concatValues()
        : field.type == FIELD.TYPE.ENUM
        ? field.options[field.value] || ''
        : field.value;
    },
    isTag() {
      return !!this.item[0].front_field_type;
    },
    isCollapse() {
      return this.item[0].detailview_visual_type == 'collapse';
    },
    isText() {
      return this.item[0].type == FIELD.TYPE.TEXT;
    },
    isBool() {
      return this.item[0].type == FIELD.TYPE.BOOL;
    },
    isUrl() {
      return this.item[0].type == FIELD.TYPE.URL;
    },
    parentBoolFieldChecked() {
      if (!this.item[0].name) return;

      const parentName = this.fields[this.item[0].name].parent_field;
      return parentName
        ? parentName && !!Number(this.fields[parentName].value)
        : this.isBool
        ? !!Number(this.item[0].value)
        : true;
    }
  },
  components: {
    'el-collapse': Collapse,
    'el-collapse-item': CollapseItem,
    VacancyProjectDescription,
    Tag,
    Icon,
    Link
  }
};
</script>

<style lang="scss" scoped>
.group-field-item {
  display: flex;
  flex-direction: row;
  align-items: center;

  &__label {
    margin: 0 4px 0 0;
    font-size: 14px;
    line-height: 20px;
    // min-width: fit-content;
  }

  &__value {
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: $blue-120;

    & ::v-deep ul > li {
      list-style: disc;
      margin-left: 16px;
    }

    &-noinfo {
      color: $black-40;
    }
  }
}

.el-collapse {
  border-color: transparent;
  margin-top: 4px;
  width: 100%;
}

.el-collapse-item {
  background-color: $black-10;
  padding: 16px;
  border-radius: 4px;

  & ::v-deep &__header,
  & ::v-deep &__wrap {
    background-color: inherit;
  }

  & ::v-deep &__content {
    background-color: inherit;
    border-radius: 8px;
    margin-top: 12px;
    padding-bottom: 0;
  }

  & ::v-deep &__arrow {
    display: none;
  }

  .arrow-icon {
    transition: all 0.5s;
  }

  &.edit-mode {
    background-color: $white;
  }

  &.is-active .arrow-icon {
    transform: rotate(180deg);
  }

  & ::v-deep &__header {
    border-bottom: none;
    height: 24px;
    line-height: 24px;
  }

  & ::v-deep &__wrap {
    border-bottom: none;
  }

  .description-title {
    font-size: 14px;
    line-height: 24px;
    font-weight: normal;
    margin: 0;
    color: $black-190;
  }
}
</style>
