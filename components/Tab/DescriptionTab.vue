<template>
  <div v-if="fields.length">
    <div v-for="i in fields" v-show="showField(i)" :key="i" class="desc-item">
      <h4>{{ mod[data[i].vname] }}</h4>
      <div v-if="showMultipleFields(data[i])">
        <span v-for="sub in data[i].fields_arr" :key="sub" class="desc-row">
          {{ multipleFieldValue(sub) }}
        </span>
      </div>
      <div v-else-if="blockedField(data[i])">
        <Tooltip
          v-for="el in data[i].blocked"
          :key="el"
          :disabled="!data[el].value"
          :content="mod[data[el].vname]"
        >
          <span v-html="formatHtml(data[el].value) || 'нет данных'"></span>
        </Tooltip>
      </div>
      <div v-else-if="relateField(data[i]) && data[i].value.length">
        <el-tag v-for="tag in tags(data[i])" :key="tag">
          {{ formatHtml(tag) }}
        </el-tag>
      </div>
      <div v-else v-html="formatHtml(data[i].value) || 'нет данных'"></div>
    </div>
  </div>
</template>
<script>
import { Tag } from 'element-ui';
import { mixin } from '@/utils/mixins';
import { FIELD } from '@/utils/constants';
import Tooltip from 'Elements/Tooltip/Tooltip';
import './description.scss';

export default {
  mixins: [mixin],
  props: {
    fields: {
      type: Array,
      default() {
        return [];
      }
    },
    data: Object,
    mod: Object
  },
  methods: {
    showField(key) {
      const field = this.data[key];
      if (this.blockedField(field)) {
        return !!Number(field.value);
      }
      // else if (this.relateField(field)) {
      //   return !!field.value.length;
      // }

      return true;
    },
    showMultipleFields(data) {
      const { type, fields_arr } = data;
      if (type === FIELD.TYPE.GROUP && fields_arr) {
        // проверка на true хотя бы в одном субполе
        return fields_arr
          .map(i => Boolean(Number(this.data[i].value)))
          .some(i => Boolean(i));
      }
      return false;
    },
    blockedField(data) {
      return data.type === FIELD.TYPE.BOOL && data.blocked;
    },
    relateField(data) {
      return (
        data.type === FIELD.TYPE.RELLINK || data.type === FIELD.TYPE.RELATE
      );
    },
    multipleFieldValue(field) {
      return this.data[field].type === FIELD.TYPE.CURRENCY_ID
        ? this.data[field].symbol
        : `${this.data[field].placeholder.toLowerCase()} ${parseInt(
            Number(this.data[field].value) || '0'
          )} ${this.data[field].after_placeholder || ''}`;
    },
    tags(data) {
      return data.value ? data.value.split(/,\s*/g) : [];
    }
  },
  components: { Tooltip, 'el-tag': Tag }
};
</script>
