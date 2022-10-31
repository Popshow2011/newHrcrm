<template>
  <nav class="navbar navbar-inverse navbar-fixed-top shadow-lvl-2">
    <div class="navbar-container" ref="navbar">
      <div class="navbar-container__left">
        <div class="navbar-logo" ref="logo">
          <a href="/">
            <img :src="data.company_logo" alt="logo" />
          </a>
        </div>
        <div class="navbar-menu">
          <ul class="main-menu">
            <li
              v-for="item in data.menu"
              ref="menu"
              :key="item.url"
              :class="[
                module === item.MODULE ? 'active' : '',
                item.isHidden ? 'is-hidden' : ''
              ]"
            >
              <a :href="item.URL" class="fw-500">{{ item.LABEL }}</a>
            </li>
            <li
              v-if="moreItem.length"
              ref="more"
              :class="[
                activeMoreItem ? 'active menu-children' : 'menu-children'
              ]"
            >
              <a href="" class="fw-500">Еще</a>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 10.5L12 15.5L17 10.5L7 10.5Z"
                  :fill="[activeMoreItem ? '#21272C' : '#788694']"
                />
              </svg>
              <ul class="shadow-lvl-2">
                <li
                  v-for="item in moreItem"
                  :key="item.URL"
                  :class="[module === item.MODULE ? 'active more' : '']"
                >
                  <a :href="item.URL" class="fw-500">{{ item.LABEL }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <div class="navbar-container__right" ref="profile">
        <MassSaveProgress></MassSaveProgress>
        <div class="navbar-control">
          <div class="control-search">
            <form @submit.prevent="sendSearch">
              <Input
                :field="{ name: 'search', type: 'text' }"
                size="medium"
                :model="search"
                prefixIcon="Search-left"
                @set-value="handleChange"
              />
            </form>
          </div>
          <div class="control-profile">
            <div class="profile-avatar">
              <img :src="userAvatarLink()" />
            </div>
            <div class="profile-menu">
              <div class="profile-name fw-500">{{ getProfileName() }}</div>
              <div class="profile-dropdown">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 10.5L12 15.5L17 10.5L7 10.5Z" fill="#21272C" />
                </svg>
              </div>
            </div>
            <ul class="control-menu shadow-lvl-2">
              <li><a :href="getProfileUrl()" class="fw-500">Профиль</a></li>
              <li v-for="item in data.profile_menu" :key="item.LABEL">
                <a :href="item.URL" class="fw-500" :target="item.TARGET">{{
                  item.LABEL
                }}</a>
              </li>
              <li>
                <a :href="data.logout_link" class="fw-500">{{
                  data.logout_label
                }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
import 'Root/assets/scss/menu.scss';
import Input from 'Elements/Input/Input';
import MassSaveProgress from './MassSaveProgress';

export default {
  props: { mod: Object, data: Object },
  data() {
    return {
      search: '',
      moreItem: [],
      activeMoreItem: false,
      cumulativeWidth: 0,
      menuWidth: 660,
      module: '',
      loading: true
    };
  },
  mounted() {
    if (window.location.search)
      this.module = window.location.href.split('=')[1].split('&')[0];

    this.getMenu();
    this.setActiveMoreMenu();
  },
  methods: {
    handleChange(name, val) {
      if (name) {
        this.search = val;
      }
    },
    sendSearch() {
      let fieldsData = {};
      // fieldsData
      //   ? (fieldsData['search_text'] = this.search)
      //   : (fieldsData = {});
      fieldsData['search_text'] = this.search;
      fieldsData['search_area'] = 'full_name_and_means_of_communications';
      fieldsData['search_type'] = 'all_words';
      fieldsData['where_to_search'] = 'HRPAC_CANDIDATES';
      localStorage.setItem('search_data', JSON.stringify(fieldsData));
      window.location.search = `&module=HRPAC_SEARCH`;
      this.search = '';
    },
    setActiveMoreMenu() {
      this.moreItem.map(item => {
        if (item.MODULE === this.module) this.activeMoreItem = true;
      });
    },
    userAvatarLink() {
      return `/index.php?entryPoint=download&id=${this.data.userId}_photo&type=Users`;
    },
    getProfileUrl() {
      return `index.php?module=Users&action=EditView&record=${this.data.userId}`;
    },
    getProfileName() {
      // Если есть что разделить (имя состоит из двух частей то возвращаем разделенное, нет так просто имя)
      if (this.data.userName.split(' ').length - 1) {
        return `${this.data.userName.split(' ')[0]} ${this.data.userName
          .split(' ')[1]
          .slice(0, 1)}.`;
      }
      return this.data.userName;
    },

    currentLastVisibleItemIndex() {
      return this.data.menu.length - 1;
    },
    getMenu() {
      this.cumulativeWidth = 0;

      this.data.menu.forEach((el, index) => {
        this.cumulativeWidth += this.$refs.menu[index].offsetWidth + 40;

        if (this.cumulativeWidth > this.menuWidth) {
          this.$refs.menu[index].classList.add('is-hidden');
          el.isHidden = true;
          this.moreItem.push(el);
        }
      });
    }
  },
  components: {
    Input,
    MassSaveProgress
  }
};
</script>
<style lang="scss" scoped>
.is-hidden {
  display: none !important;
}

.navbar {
  padding: 0 16px;
  min-height: 56px;
}

.navbar-fixed-top {
  box-sizing: border-box;
  height: 56px;
  min-height: 56px;
}

.navbar-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-container__left,
.navbar-container__right {
  display: flex;
  align-items: center;
  height: 100%;
}

.navbar-container a {
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: $black-100;
}

/* Logo */

.navbar-logo img {
  width: 48px;
  height: 40px;
  object-fit: contain;
}

/* Menu */

.navbar-menu {
  display: flex;
  margin-left: 60px;
  height: 100%;
}

.main-menu {
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-menu a {
  cursor: pointer;
}

.main-menu li a:hover {
  color: $black-200 !important;
}

.main-menu .active a {
  color: $black-200;
}

.main-menu > li {
  display: inline-flex;
  align-items: center;
}
.main-menu > li + li {
  margin-left: 40px;
}
.main-menu > li > a {
  position: relative;
  text-decoration: none;
}
.main-menu > li > a:hover {
  text-decoration: none;
}
.main-menu > li > a:after {
  width: 0;
  height: 4px;
  background-color: $blue-120;
  border-radius: 4px 4px 0px 0px;
  content: '';
  left: 0;
  bottom: -18px;
  position: absolute;
}

.main-menu > .menu-children > a:after {
  width: 0;
  height: 4px;
  background-color: $blue-120;
  border-radius: 4px 4px 0px 0px;
  content: '';
  left: 0;
  bottom: -16px;
  position: absolute;
}

.main-menu > .menu-children > ul > li > a {
  color: $black-100;
}

.main-menu > .menu-children > ul > .active a {
  position: relative;
  color: $black-200;
}

.main-menu > .menu-children > ul > .active a::after {
  width: 4px;
  height: 20px;
  background-color: $blue-120;
  border-radius: 0px 4px 4px 0;
  content: '';
  left: -18px;
  bottom: 0px;
  position: absolute;
}

.main-menu > li.active a:after {
  width: 100%;
}
.main-menu li {
  margin: 0;
  white-space: nowrap;
}
.main-menu li.menu-children {
  position: relative;
}
.main-menu li.menu-children[class='active'] > a,
svg {
  color: red;
}
.main-menu li li.menu-children:after {
  position: absolute;
  content: '\2039';
  color: $white;
  font-size: 20px;
  font-weight: bold;
  right: 10px;
  top: 12px;
  transform: rotate(180deg);
}
.main-menu li.menu-children:hover > ul {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.main-menu ul {
  padding: 9px 17px;
  margin: 0;
  list-style: none;
  background-color: $white;
  position: absolute;
  z-index: 20;
  min-width: 145px;
  top: 100%;
  left: -2px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(5px);
  transition: all 200ms cubic-bezier(0.43, 0.59, 0.16, 1.25);
  border: 1px solid $black-20;
  box-sizing: border-box;
  border-radius: 4px;
}
.main-menu ul li {
  display: block;
  line-height: 1.1;
  margin-bottom: 16px;
}
.main-menu ul li:last-child {
  margin-bottom: 0;
}
.main-menu ul li a {
  display: block;
  transition: all 0.3s;
  text-decoration: none;
}
.navbar .navbar-menu .main-menu ul li a:hover {
  color: $black-200 !important;
  background: $white;
  text-decoration: none;
}
.main-menu ul ul {
  top: 0;
  left: 100%;
}

/* Control */
.navbar-control {
  display: flex;
  align-items: center;
}

.control-search {
  width: 220px;
  display: flex;
  ::v-deep .el-input {
    &__prefix {
      width: 24px;
      height: 24px;
      left: 12px !important;
      top: 4px;
      bottom: 4px;
    }
    &__icon {
      width: 24px;
    }
  }
}

.control-search .search:focus {
  outline: none;
}

.control-profile {
  display: flex;
  position: relative;
  align-items: center;
  margin-left: 48px;
  cursor: pointer !important;
}

.control-profile ul {
  padding: 9px 17px;
  margin: 0;
  list-style: none;
  background-color: $white;
  position: absolute;
  z-index: 20;
  min-width: 182px;
  top: 100%;
  left: -30px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(5px);
  transition: all 200ms cubic-bezier(0.43, 0.59, 0.16, 1.25);
  border: 1px solid $black-20;
  box-sizing: border-box;
  border-radius: 4px;
}

.control-profile:hover ul {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.control-profile .control-menu {
  padding: 9px 17px;
}

.control-profile .control-menu li {
  margin-bottom: 16px;
}

.control-profile .control-menu li:last-child {
  margin-bottom: 0px;
}

.control-profile .control-menu li a:hover {
  color: $black-200 !important;
}

.control-profile .profile-avatar {
  margin-right: 12px;
}

.control-profile .profile-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.control-profile .profile-menu {
  display: flex;
  align-items: center;
  font-family: 'Roboto Regular';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: $black-200;
  cursor: pointer !important;
}
</style>
