<template>
  <div class="widget-block">
    <div class="row-head">
      <div class="row-head__element row-head__name">Страница</div>
      <div class="row-head__element row-head__date">Дата</div>
    </div>
    <div class="widget-block__body">
      <div
        class="body__row"
        v-for="row in tableData"
        :key="`${row}_${updateKey}`"
      >
        <ExpandedRows :row="row" @close-block="closeBlock" type="LastActions" />
      </div>
    </div>
  </div>
</template>
<script>
import 'Root/assets/scss/common.scss';
import ExpandedRows from 'Elements/Widget/ExpandedRows';
import { mixin } from '@/utils/mixins';

export default {
  mixins: [mixin],
  components: {
    ExpandedRows
  },
  props: {
    widgetData: {
      type: Object || Array
    }
  },
  data() {
    return {
      expandRowKeys: [],
      tableData: [],
      roleAccess: false,
      updateKey: 0
    };
  },
  created() {
    let newInd = 0;
    for (let i = 0; i < this.widgetData.length; i++) {
      this.roleAccess = this.widgetData[i]['metadata']['role_access']
        ? true
        : this.roleAccess;

      if (this.widgetData[i]['metadata']['role_access']) {
        this.tableData.push({
          name: this.widgetData[i]['metadata']['lbl'],
          ind: newInd + 1,
          children: []
        });
        this.tableData[newInd]['show_module'] =
          this.widgetData[i]['metadata']['show_module'];
        this.tableData[newInd]['module'] = this.widgetData[i]['module'];
        for (let j = 0; j < this.widgetData[i]['data'].length; j++) {
          this.tableData[newInd]['children'].push(
            this.widgetData[i]['data'][j]
          );
          this.tableData[newInd]['children'][j]['ind'] = `${newInd + 1}${
            j + 1
          }`;
          this.tableData[newInd]['children'][j]['module'] =
            this.widgetData[i]['module'];
        }
        newInd++;
      }
    }
    if (!this.roleAccess) {
      this.$emit('block-access', 'LastActions');
    }
  },
  methods: {
    closeBlock(module, val) {
      this.$emit('close-block', module, val);

      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i]['module'] == module) {
          this.tableData[i]['show_module'] = val;
        }
      }
      this.updateKey++;
    }
  }
};
</script>
<style lang="scss" scoped>
.widget-block {
  height: 100%;
  font-family: Roboto, 'Roboto', sans-serif;
  width: 100%;
  background: $black-10;
  border-radius: 6px;
  color: $black;
}

.widget-block__body {
  margin-top: 41px;
}

.row-head {
  height: 40px;
  position: fixed;
  border-bottom: 1px solid $black-40;
  background: $black-10;
  margin-top: 0;
  display: flex;

  &__element {
    padding: 10px 24px;
    font-family: 'Roboto Medium';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 20px;
    color: $black-200;
  }

  &__name {
    width: 312px;
  }

  &__date {
    width: 178px;
  }
}
</style>
