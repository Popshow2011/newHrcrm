<template>
  <el-form-item
    v-if="field && field.value.length"
    :prop="field.name"
    :class="[
      'row',
      field.readonly || readonly ? 'is-readonly' : '',
      isEmptyField(field, form[field.name]) ? 'is-empty-field' : ''
    ]"
  >
    <el-form
      v-if="metaData.panels"
      ref="form"
      :model="form"
      :rules="rules"
      :class="`${prefixClass}-form demo-ruleForm`"
      label-width="100%"
      :size="formSize"
      enctype="multipart/form-data"
    >
      <el-form-item :rules="rules" :prop="item.id">
        <span
          :class="['el-form-item__label']"
          v-if="field.type !== FIELD.TYPE.BOOL"
        >
          {{ field.lbl }}
          <p v-if="field.required">
            <Icon iconName="redStar" />
          </p>
        </span>
        <Editor
          v-else-if="textType(field.type)"
          :prop="field.name"
          :name="field.name"
          :value="form[field.name]"
          :disabled="disabled(field)"
          class="textarea el-textarea__inner"
          :class="[isEmptyField(field, field.value) ? 'is-empty-field' : '']"
          @change="val => setValue(field.name, val)"
        ></Editor>
        <Input
          v-else-if="hidden(field)"
          :field="field"
          model="Не доступно для редактирования"
          :disabled="true"
          :readonly="true"
        />
      </el-form-item>
    </el-form>
  </el-form-item>
</template>
<script>
import { Form, FormItem } from 'element-ui';
import { form } from '@/utils/mixins';
import Icon from 'Elements/Icon/Icon';
import Editor from 'Elements/Editor/Editor';
import Input from 'Elements/Input/Input.vue';
export default {
  mixins: [form],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    model: {
      type: [String, Array, Object, Boolean]
    }
  },
  data() {
    return {
      form: {},
      readonly: true // временно, пока не сохраняются
    };
  },
  components: { Icon, Editor, Input, 'el-form': Form, 'el-form-item': FormItem }
};
</script>
