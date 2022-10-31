<template>
  <el-dialog
    title="Нельзя запустить рассылку"
    width="470px"
    :visible="is_visible"
    :close-on-click-modal="true"
    @close="closeDialog"
    class="dialog"
  >
    <div class="dialog__body">
      <p class="dialog__text">
        Кандидаты уже используются в другой рассылке. Чтобы продолжить удалите
        кандидатов из текущей рассылки.
      </p>
      <div class="dialog__candidates">
        <div
          class="candidate"
          v-for="candidate in candidates"
          :key="candidate.id"
        >
          <Avatar
            class="candidate-item__avatar"
            :size="40"
            :url="`/index.php?entryPoint=download&id=${candidate.id}_photo&type=HRPAC_CANDIDATES`"
          />
          <a
            :href="`/index.php?module=HRPAC_CANDIDATES&action=DetailView&record=${candidate.id}`"
            class="candidate__name"
            >{{ candidate.name || '[нет имени]' }}</a
          >
        </div>
      </div>
    </div>
    <div class="dialog__footer">
      <Button
        buttonSize="big"
        buttonColor="darkBlue"
        buttonText="Удалить"
        @click="deleteAuditory"
      />
      <Button
        buttonSize="big"
        buttonColor="blue"
        buttonText="Сохранить не запуская"
        @click="saveWithConflictCandidates"
      />
    </div>
  </el-dialog>
</template>
<script>
import { Dialog } from 'element-ui';
import { store } from '@/store';
import { dialogMixin } from '@/utils/mixins';
import Button from 'Elements/Button/Button';
import Avatar from 'Elements/Avatar/Avatar';

export default {
  components: {
    'el-dialog': Dialog,
    Button,
    Avatar
  },
  mixins: [dialogMixin],
  props: {
    is_visible: {
      type: Boolean
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      candidates: store.state.mailing.conflictCandidates
    };
  },
  methods: {
    async deleteAuditory() {
      await store.dispatch('mailing/deleteAuditory');

      this.closeDialog();

      await store.dispatch('mailing/updateReceiversCount');
      store.dispatch('mailing/loadAuditoryEntries');
    },
    async saveWithConflictCandidates() {
      await store.dispatch('mailing/saveMailing', { status: 'not_active' });

      this.closeDialog();
    },
    closeDialog() {
      this.setVisibleDialog('mailings_conflict_dialog', false);
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog {
  &__body {
    padding-top: 24px;
  }

  &__footer {
    margin-top: 24px;
  }

  &__candidates {
    margin-top: 24px;
    background-color: $black-10;
    border-radius: 4px;
    max-height: 224px;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0;
    }
  }
}

.candidate {
  display: flex;
  align-items: center;
  padding: 12px;

  &__name {
    font-size: 16px;
    line-height: 24px;
    margin-left: 12px;
    color: $black-200;
  }
}
</style>
