<template>
  <el-dialog
    :visible.sync="is_visible"
    ref="dialog"
    :title="title"
    :close-on-click-modal="false"
    @close="$emit('cancel-callback')"
    class="dialog"
  >
    <div>
      <p class="dialog__text">{{ subtitle }}</p>
      <Stepper
        :min="getRawNum(max) != 0 ? 1 : 0"
        :max="+getRawNum(max)"
        isInteger
        isRound
        :value="+defaultValue.replace(/\s*/g, '')"
        @diffChange="setAmount"
      />
    </div>
    <div slot="footer">
      <div class="footer">
        <Button
          buttonSize="big"
          buttonColor="darkBlue"
          buttonText="Ок"
          :disabled="!Number(getRawNum(defaultValue)) || requestSent"
          :loading="requestSent"
          @click="validateForm"
          class="footer__button-ok"
        />
        <Button
          buttonSize="big"
          buttonColor="blue"
          buttonText="Отмена"
          @click="$emit('cancel-callback')"
          class="footer__button-cancel"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { store } from '@/store';
import { Dialog } from 'element-ui';
import Stepper from 'Elements/Stepper/Stepper';
import Button from 'Elements/Button/Button';
export default {
  props: {
    is_visible: {
      type: Boolean
    },
    title: {
      type: String
    },
    subtitle: {
      type: String
    },
    defaultValue: {
      type: String,
      default: '0'
    },
    max: {
      type: String
    }
  },
  data() {
    return {
      amount: '0'
    };
  },
  mounted() {
    this.amount = this.defaultValue.replace(/\s*/g, '');
  },
  computed: {
    requestSent: {
      get() {
        return store.state.common.requestSent;
      },
      set(val) {
        store.commit('common/setRequestState', val);
      }
    }
  },
  methods: {
    validateForm() {
      if (Number(this.amount)) {
        this.$emit('save-amount', this.amount);
      } else {
        console.log('Заполните обязательные поля!');
        return false;
      }
    },
    setAmount(val) {
      this.amount = this.getRawNum(val);
    },
    getRawNum(num) {
      return String(Number(String(num).replace(/,|\.|-|\+|e|\s/g, '')));
    }
  },
  components: { 'el-dialog': Dialog, Stepper, Button }
};
</script>
