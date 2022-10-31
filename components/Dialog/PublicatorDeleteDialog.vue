<template>
  <el-dialog
    title="Удаление публикации"
    width="440px"
    :visible.sync="is_visible"
    :close-on-click-modal="true"
    @close="$emit('reset-callback')"
    class="dialog"
  >
    <div class="dialog-body">
      Публикация будет удалена без возможности восстановления и на работном
      сайте и в TalentForce.
    </div>
    <div class="dialog-footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Отмена"
        @click="$emit('reset-callback')"
      />
      <Button
        buttonSize="big"
        buttonColor="blue"
        buttonText="Удалить"
        @click="deleteVacancy"
      />
    </div>
  </el-dialog>
</template>
<script>
import { Dialog } from 'element-ui';
import Button from 'Elements/Button/Button';
import { store } from '@/store';

export default {
  props: {
    is_visible: {
      type: Boolean
    },
    work_site: {
      type: String,
      required: true
    },
    external_id: {
      type: Number,
      required: true
    }
  },
  methods: {
    deleteVacancy() {
      store.dispatch('publicator/deletePublishedVacancy', {
        external_id: this.external_id,
        work_site: this.work_site,
        employer_id: this.auth[0].authData.employer
          ? this.auth[0].authData.employer.id
          : ''
      });
      this.$emit('reset-callback');
    }
  },
  computed: {
    auth() {
      return store.state.publicator.authForm.filter(
        el => el.name === this.work_site
      );
    }
  },
  components: {
    'el-dialog': Dialog,
    Button
  }
};
</script>
<style lang="scss" scoped>
.el-dialog {
  position: relative;
}

.dialog-footer {
  display: flex;
  padding-top: 24px;

  &:before {
    content: '';
    position: absolute;
    bottom: 88px;
    left: 0;
    right: 0;
    border-top: 1px solid $black-20;
  }
}

.dialog-body {
  padding: 43px 0 40px 0;
  font-family: Roboto, sans-serif;
  font-size: 15px;
  color: $black-200;
  word-break: keep-all;

  &:before {
    content: '';
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    border-top: 1px solid $black-20;
  }
}
</style>
