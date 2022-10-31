<template>
  <div class="stages-list">
    <div
      v-for="stage in stageList" :key="stage.stage_id"
      :class="['stage', {'is-active': stage.is_active == false}]"
    >
      <div class="header">{{stage.stage_name | format}}</div>
      <div class="tags">
        <div v-if="stage.coordination_term" :class="['tag', {'is-expired': stage.is_expired}]">{{stage.coordination_term}}</div>
        <div class="tag">{{setTagOperator(stage.operator)}}</div>
      </div>
      <div
        class="candidats-list"
        v-for="coordinator in stage.coordinators" :key="coordinator.id"
      >
        <span :class="{strikethrough: coordinator.status == 'redirected'}">{{coordinator.user_name}}</span>
        <Tooltip
          popper-class="dark"
          placement="top-start"
          :content="getStatus(coordinator.status).tooltip"
        >
          <Icon :iconName="getStatus(coordinator.status).icon" />
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from 'Elements/Icon/Icon';
import Tooltip from 'Elements/Tooltip/Tooltip';

export default {
  props: {
    stageList: Array
  },
  methods: {
    setTagOperator(operator) {
      if (operator == 'AND') return 'Каждый из этапа'
      else if (operator == 'OR') return 'Любой из этапа'
      else return ''
    },
    getStatus(status) {
      switch (status) {
        case 'pending_approvement':
          return { tooltip: 'Ожидается согласование', icon: 'hourglass' };
        case 'approved':
          return { tooltip: 'Согласовано', icon: 'agreed' };
        case 'declined':
          return { tooltip: 'Отклонено', icon: 'rejected' };
        case 'need_refactoring':
          return { tooltip: 'Отправлено на доработку', icon: 'reply' };
        case 'redirected':
          return { tooltip: 'Перенаправлено', icon: 'users' };

        default:
          return { tooltip: '', icon: '' };
      }
    },
  },
  components: {
    Icon,
    Tooltip
  },
}
</script>

<style lang="scss" scoped>
.stages-list {
  display: flex;
  flex-direction: column;
  padding: 24px 24px 0 24px;
}
.stage {
  background: $white;
  border: 1px solid $black-40;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}
.header {
  font-size: 16px;
  font-weight: bold;
}
.tags {
  margin-top: 8px;
  display: flex;
}
.tag {
  font-size: 14px;
  color: $black-80;
  padding: 2px 8px;
  background: $black-10;
  border: 1px solid $black-30;
  border-radius: 4px;
  margin-right: 8px;
}
.is-expired {
  color: $red;
  background: #ffeeed;
  border: 1px solid $red;
}
.candidats-list {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
}
.candidats-list span {
  color: $blue-120;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.strikethrough {
  text-decoration: line-through;
}
.is-active {
  background: #f9f9f9;

  .candidats-list span {
    color: $black-100;
  }
}
</style>
