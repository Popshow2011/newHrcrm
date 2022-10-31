<template>
  <div class="slots">
    <Slot
      v-for="slot in slots"
      :data="slot"
      :key="slot.id"
      :isSelectedLeft="slot.isSelectedLeft"
      :isSelectedRight="slot.isSelectedRight"
    />
  </div>
</template>

<script>
import Slot from 'Elements/Planner/Slot';
export default {
  mounted() {
    this.initSlots();
    this.selectSlots();
  },
  components: { Slot },
  props: {
    takenSlots: {
      type: Array,
      default: () => []
    },
    selectedSlots: Object
  },
  data() {
    return {
      slots: [],
      slotDisabled: true,
      slotFilled: false,
      slotOpened: false
    };
  },
  computed: {
    selSlots() {
      return this.selectedSlots;
    }
  },
  methods: {
    initSlots() {
      for (let i = 1; i < 25; i++) {
        let slotCondition = 'opened';
        if ((i >= 1 && i < 10) || (i >= 19 && i < 25)) {
          slotCondition = 'disabled';
        }
        slotCondition = this.slots.push({
          id: i,
          condition: slotCondition,
          halfHour: ''
        });
      }
      let periodTime = false;
      for (let i = 0; i < this.takenSlots.length; i++) {
        const period = this.takenSlots[i];
        const start = period.start.split(':');
        const end = period.end.split(':');
        let currSlot = {
          id: 0,
          condition: '',
          halfHour: ''
        };
        for (let j = 0; j < this.slots.length; j++) {
          currSlot = {
            id: j,
            condition: this.slots[j].condition,
            halfHour: this.slots[j].halfHour
          };
          if (Number(start[0]) == j && Number(end[0]) == j) {
            currSlot.condition = 'filled';
            currSlot.halfHour = 'first';
            if (periodTime) periodTime = false;
          } else {
            if (Number(start[0]) == j) {
              currSlot.condition = 'filled';
              Number(start[1] != '00' && this.slots[j].condition != 'filled')
                ? (currSlot.halfHour = 'second')
                : (currSlot.halfHour = '');
              periodTime = true;
            } else if (Number(end[0]) == j) {
              currSlot.condition = 'filled';
              if (Number(end[1] != '00')) {
                currSlot.halfHour = 'first';
              } else {
                currSlot.halfHour = '';
                currSlot.condition = 'opened';
              }
              // Number(end[1] != '00')
              //   ? (currSlot.halfHour = 'first')
              //   : (currSlot.halfHour = '');
              if (periodTime) periodTime = false;
            } else if (periodTime) currSlot.condition = 'filled';
          }
          this.$set(this.slots, j, currSlot);
        }
      }
    },
    selectSlots() {
      //отменяем выделение у слотов
      if (this.selSlots) {
        this.slots.forEach(slot => {
          slot.isSelectedLeft = false;
          slot.isSelectedRight = false;
        });
        const start = this.selSlots.start.split(':');
        const end = this.selSlots.end.split(':');
        let periodTime = false;
        //выделяем слоты
        for (let i = 0; i < this.slots.length; i++) {
          let slot = this.slots[i];
          if (i == Number(start[0]) || i == Number(end[0])) {
            if (i == Number(start[0])) {
              if (Number(start[1] == '00')) {
                slot.isSelectedLeft = true;
                slot.isSelectedRight = true;
              } else slot.isSelectedRight = true;
              if (Number(start[0]) != Number(end[0])) periodTime = true;
            }
            if (i == Number(end[0])) {
              if (Number(end[1] == '00')) {
                if (periodTime) periodTime = false;
              } else {
                slot.isSelectedLeft = true;
                slot.isSelectedRight = false;
                if (periodTime) periodTime = false;
              }
            }
          } else if (periodTime) {
            slot.isSelectedLeft = true;
            slot.isSelectedRight = true;
          }
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.slots {
  display: flex;
  overflow: auto;
  height: 100%;
}

.slot {
  display: flex;
  align-items: center;
  min-width: 60px;
  background-color: #fff;
  margin-right: 1px;

  &__area {
    width: 100%;

    &--disabled {
      height: 60%;
      padding: 20px 0;
      background: $black-40;
    }

    &--filled {
      height: 60%;
      padding: 20px 0;
      background: $blue-130;
    }

    &--opened {
      padding: 8px 0;
      background: $green-80;
    }
  }

  &:first-of-type {
    border-radius: 8px 0 0 8px;
    padding-left: 8px;
    width: 68px;

    .slot__inner {
      border-radius: 4px 0px 0px 4px;
    }
  }

  &:last-of-type {
    border-radius: 0 8px 8px 0;
    padding-right: 8px;
    width: 68px;

    .slot__inner {
      border-radius: 0px 4px 4px 0px;
    }
  }
}
</style>
