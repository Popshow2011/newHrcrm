<template>
  <!-- для панели подбора в старом интерфейсе -->
  <el-link
    v-if="!editMode"
    :ref="contact.id"
    :href="setContactsLink(contact)"
    :underline="false"
    target="_blank"
    :class="['contact-item', contact.value_type]"
  >
    <Tooltip :content="contact.label" :disabled="hideTooltip">
      <contact-icon
        :type="contact.value_type"
        class="contact-item__icon"
      ></contact-icon>
    </Tooltip>
    <span class="text">{{ contact.value }}</span>
  </el-link>
</template>

<script>
import { setContactData } from '@/utils/helpers';
import ContactIcon from 'Elements/ContactForm/ContactIcon';
import Tooltip from 'Elements/Tooltip/Tooltip';
export default {
  props: {
    contact: Object,
    editMode: {
      type: Boolean,
      default: false
    },
    hideTooltip: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    setContactsLink(item) {
      const { link } = setContactData(item.value_type, item.value);
      return link;
    }
  },
  components: { ContactIcon, Tooltip }
};
</script>
