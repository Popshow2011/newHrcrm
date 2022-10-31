<template>
  <Email v-if="type === CONTACT.TYPE.EMAIL" />
  <Phone v-else-if="type === CONTACT.TYPE.PHONE" />
  <Skype v-else-if="type === CONTACT.TYPE.SKYPE" />
  <Facebook v-else-if="type === CONTACT.TYPE.FACEBOOK" />
  <LinkedIn v-else-if="type === CONTACT.TYPE.LINKEDIN" />
  <Telegram v-else-if="type === CONTACT.TYPE.TELEGRAM" />
  <UsersIcon v-else-if="type === CONTACT.TYPE.C_HABR" />
  <Globe v-else-if="type === CONTACT.TYPE.SITE" />
  <i v-else :class="type"></i>
</template>
<script>
import { CONTACT } from '@/utils/constants';
import Email from 'Elements/SVG/Email';
import Phone from 'Elements/SVG/Phone';
import Skype from 'Elements/SVG/Skype';
import Facebook from 'Elements/SVG/Facebook';
import LinkedIn from 'Elements/SVG/LinkedIn';
import Telegram from 'Elements/SVG/Telegram';
import UsersIcon from 'Elements/SVG/Users';
import Globe from 'Elements/SVG/Globe';
export default {
  props: {
    type: String
  },
  data() {
    return {
      CONTACT
    };
  },
  components: {
    Email,
    Phone,
    Skype,
    Facebook,
    LinkedIn,
    Telegram,
    UsersIcon,
    Globe
  }
};
</script>
