import Vue from 'vue';
import { plural, salaryFormat } from '@/utils/helpers';
import { FIELD, ACTION } from '@/utils/constants';

Vue.filter('toupper', str => {
  if (!str) return '';
  str = str.toString();
  return str.toUpperCase();
});

Vue.filter('tolower', str => {
  if (!str) return '';
  str = str.toString();
  return str.toLowerCase();
});

Vue.filter('capitalize', str => {
  if (!str) return '';
  str = str.toString();
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Vue.filter('truncate', (str, length, clamp = '...') => {
  return str.length > length ? str.slice(0, length) + clamp : str;
});

Vue.filter('salaryFormat', salaryFormat);

Vue.filter('tableCol', (str, key) => {
  return str && key === FIELD.ID.GRADE
    ? str.replace(/\^/g, '').split(',')
    : str;
});

Vue.filter('grade', str => {
  let grades = str.match(/\^[\w]+\^/g);
  if (grades !== null && grades.length > 0) {
    let mapped = grades.map(grade => {
      if (!grade) return;
      return grade.replace(/\^/g, '');
    });
    return mapped.join(', ');
  }
  return str;
});

Vue.filter('plural', plural);

Vue.filter('route', (module, action, id) => {
  let types = {
    view: ACTION.DETAIL_VIEW,
    edit: ACTION.EDIT_VIEW
  };
  let searchParams = new URLSearchParams();
  let params = {
    module: module,
    action: types[action]
  };
  if (id) {
    params['record'] = id;
  }

  for (let [key, value] of Object.entries(params)) {
    searchParams.append(key, value);
  }
  return `/index.php?${searchParams}`;
});

Vue.filter('format', text => {
  if (typeof text === 'string' && text) {
    const replacement = [
      [/&quot;/g, '"'],
      [/&gt;/g, '>'],
      [/&lt;/g, '<'],
      [/&#039;/g, "'"],
      [/%3A/g, ':']
    ];
    return text
      .replace(...replacement[0])
      .replace(...replacement[1])
      .replace(...replacement[2])
      .replace(...replacement[3])
      .replace(...replacement[4]);
  }
  return text;
});
