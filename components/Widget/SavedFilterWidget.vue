<template>
  <div class="widget-block">
    <div
      class="widget-block__row"
      v-for="row in tableData"
      :key="`${row}_${updateKey}`"
    >
      <ExpandedRows :row="row" @close-block="closeBlock" type="SavedFilters" />
    </div>
  </div>
</template>
<script>
import 'Root/assets/scss/common.scss';
import ExpandedRows from 'Elements/Widget/ExpandedRows';
export default {
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
      tableData: [],
      updateKey: 0,
      roleAccess: false
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
      this.$emit('block-access', 'SavedFilters');
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
</style>
