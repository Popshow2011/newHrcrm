<template>
  <div class="item shadow-lvl-1">
    <div class="item-header">
      <h4 class="item-title">Параметры</h4>
    </div>
    <div class="item-body" v-if="fields && mod">
      <div class="form-item">
        <label :for="fields.name.name">{{ mod[fields.name.vname] }}</label>
        <Input
          :field="fields.name"
          :model="form.name"
          @set-value="changeValue"
        />
      </div>
      <div class="form-item">
        <label :for="fields.hrpac_vacancy_id_c.name">
          {{ mod[fields.vacancy.vname] }}
        </label>
        <Select
          :field="{ ...fields.vacancy, type: 'enum' }"
          :options="fields.vacancy.options"
          :filterable="true"
          :model="form.hrpac_vacancy_id_c"
          @set-value="changeVacancy"
        />
      </div>
      <div class="form-item">
        <label :for="fields.waiting_time.name">
          {{ mod[fields.waiting_time.vname] }}
        </label>
        <Stepper
          :min="fields.waiting_time.min"
          :max="fields.waiting_time.max || null"
          isInteger
          isRound
          size="big"
          :value="fields.waiting_time.value || fields.waiting_time.default"
          @diffChange="num => changeValue('waiting_time', String(num))"
        />
      </div>
      <div class="form-item">
        <p class="fw-500">{{ mod[fields.communication_channel.vname] }}</p>
        <Radio
          v-for="(val, key) in fields.communication_channel.options"
          :key="key"
          :label="key"
          :model="form.communication_channel"
          :text="val"
          class="radio"
          @set-value="
            val => changeValue(fields.communication_channel.name, val)
          "
        />
      </div>
    </div>
  </div>
</template>
<script>
import { store } from '@/store';
import { mixin, form } from '@/utils/mixins';
import Input from 'Elements/Input/Input';
import Select from 'Elements/Select/Dropdown';
import Radio from 'Elements/Radio/Radio';
import Stepper from 'Elements/Stepper/Stepper';

export default {
  mixins: [mixin, form],
  props: {
    fields: Object,
    mod: Object
  },
  data() {
    return {
      form: {
        name: this.formatHtml(this.fields.name.value),
        vacancy: this.formatHtml(this.fields.vacancy.value),
        hrpac_vacancy_id_c: this.fields.hrpac_vacancy_id_c.value,
        waiting_time: this.fields.waiting_time.value,
        communication_channel: this.fields.communication_channel.value
      }
    };
  },
  methods: {
    changeValue(name, val) {
      this.setFieldValue(name, val);
      store.commit('mailing/updateForm', this.form);
    },
    changeVacancy(name, val) {
      const options = this.fields[name].options || [];
      const selectedOpt = options.filter(opt => opt.id === val);

      this.$set(this.form, this.fields[name].id_name, val);
      this.$set(this.form, name, selectedOpt.length ? selectedOpt[0].name : '');
      store.commit('mailing/updateForm', this.form);
    }
  },
  components: { Input, Select, Radio, Stepper }
};
</script>
<style lang="scss" scoped>
.item {
  display: flex;
  flex-direction: column;
  width: 384px;
  height: 100%;
  background: $white;
  border-radius: 6px;
  overflow: hidden;

  &-header {
    width: 100%;
    padding: 16px;
    border-bottom: 1px solid $black-20;

    .item-title {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      line-height: 28px;
      color: $black-200;
    }
  }
  &-body {
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow: auto;

    .form-item {
      padding-bottom: 20px;
      display: flex;
      flex-direction: column;

      p {
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        display: flex;
        color: $black-200;
        padding-bottom: 16px;
      }

      .radio {
        margin-bottom: 12px;
      }
    }

    label {
      font-weight: normal;
      font-size: 14px;
      line-height: 24px;
      color: $black-200;
      margin: 0;
    }
  }
}
</style>
