/* global listViewSearchIcon */
import { Message } from 'element-ui';

export const rand = function (min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
};

export const lower = text => text.toLowerCase();

export const formatHtml = text => {
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
};

export const randomNumber = (rate = 8) => {
  return Math.floor(Math.random() * 10 ** rate + 1);
};

export const getTableData = (data, columns, mod) => {
  let result = [];

  data.forEach(item => {
    let row = {};
    Object.keys({ ...columns, ...item }).forEach(col => {
      let column = (row[col.toLowerCase()] = {});
      if (columns[col]) {
        Object.keys(columns[col]).forEach(colParam => {
          column[colParam] = columns[col][colParam];
          if (colParam == 'label') {
            column['label_text'] = mod[columns[col][colParam]];
          }
        });
      }

      if (columns[col] && columns[col].type == 'multienum') {
        const val = item[col].split(',');
        const options = columns[col].options_array;

        column['value'] = val.some(v => options && options[v])
          ? val.map(v => options[v]).join(', ')
          : item[col];
      } else if (Array.isArray(item[col])) {
        column['value'] = item[col].map(val => {
          if (typeof val != 'string') {
            const obj = {};
            for (let key in val) {
              obj[key] = formatHtml(val[key]);
            }
            return obj;
          } else {
            return val;
          }
        });
      } else {
        column['value'] = formatHtml(item[col]);
      }
    });
    result.push(row);
  });

  return result;
};

export const hexToRgba = function (hex, a) {
  return `rgba(${hex
    .substr(1)
    .match(/../g)
    .map(x => +`0x${x}`)},${a})`;
};

export const hexToRGBA = (color, opacity = '1') => {
  // Returns the color as an array of [r, g, b, a] -- all range from 0 - 255
  let cvs, ctx;
  cvs = document.createElement('canvas');
  cvs.height = 1;
  cvs.width = 1;
  ctx = cvs.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const arr = ctx.getImageData(0, 0, 1, 1).data;

  if ('slice' in arr) {
    return `rgba(${arr.slice(0, 3).join(', ')}, ${opacity})`;
  } else {
    // ie support
    const rgb = [];
    for (let i = 0; i < arr.length; i++) {
      rgb.push(arr[i]);
    }

    return `rgba(${rgb.slice(0, 3).join(', ')}, ${opacity})`;
  }
};

export let toLightenOrDarkenColor = (self, p, c0, c1, l) => {
  // формат цветов: rgb, rgba, hex (6, 3, 4, 8-ричный)
  // func(context, 0.9, color, false, true) - осветление цвета по аналогии с opacity: 0.1, т.е. на 90%
  // func(context, -0.9, color, false, true) - затемнение цвета на 90%
  // func(context, 0.9, color) - осветление цвета на 90% (менее близко по гамме)
  // func(context, 0.5, color1, color2, true) - смешивание цветов. чем больше коэфф-т, тем палитра цвета ближе ко 2 цвету, и наоборот (+- не имеет значения)
  // func(context, 0.5, rgb-color1, rgb-color2) - смешивание цветов
  let r,
    g,
    b,
    P,
    f,
    t,
    h,
    i = parseInt,
    m = Math.round,
    a = typeof c1 == 'string';

  if (
    typeof p != 'number' ||
    p < -1 ||
    p > 1 ||
    typeof c0 != 'string' ||
    (c0[0] != 'r' && c0[0] != '#') ||
    (c1 && !a)
  ) {
    return null;
  }

  if (!self.toLightenOrDarkenColor) {
    self.toLightenOrDarkenColor = d => {
      let n = d.length,
        x = {};
      if (n > 9) {
        ([r, g, b, a] = d = d.split(',')), (n = d.length);
        if (n < 3 || n > 4) return null;
        (x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))),
          (x.g = i(g)),
          (x.b = i(b)),
          (x.a = a ? parseFloat(a) : -1);
      } else {
        if (n == 8 || n == 6 || n < 4) return null;
        if (n < 6) {
          d =
            '#' +
            d[1] +
            d[1] +
            d[2] +
            d[2] +
            d[3] +
            d[3] +
            (n > 4 ? d[4] + d[4] : '');
        }

        d = i(d.slice(1), 16);
        if (n == 9 || n == 5) {
          (x.r = (d >> 24) & 255),
            (x.g = (d >> 16) & 255),
            (x.b = (d >> 8) & 255),
            (x.a = m((d & 255) / 0.255) / 1000);
        } else {
          (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
        }
      }
      return x;
    };
  }

  (h = c0.length > 9),
    (h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
    (f = self.toLightenOrDarkenColor(c0)),
    (P = p < 0),
    (t =
      c1 && c1 != 'c'
        ? self.toLightenOrDarkenColor(c1)
        : P
        ? { r: 0, g: 0, b: 0, a: -1 }
        : { r: 255, g: 255, b: 255, a: -1 }),
    (p = P ? p * -1 : p),
    (P = 1 - p);
  if (!f || !t) return null;
  if (l)
    (r = m(P * f.r + p * t.r)),
      (g = m(P * f.g + p * t.g)),
      (b = m(P * f.b + p * t.b));
  else
    (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
      (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
      (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
  (a = f.a),
    (t = t.a),
    (f = a >= 0 || t >= 0),
    (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
  if (h)
    return (
      'rgb' +
      (f ? 'a(' : '(') +
      r +
      ',' +
      g +
      ',' +
      b +
      (f ? ',' + m(a * 1000) / 1000 : '') +
      ')'
    );
  else
    return (
      '#' +
      (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0))
        .toString(16)
        .slice(1, f ? undefined : -2)
    );
};

export const unmaskedPhone = function (num) {
  // +7 (80433) 344-46
  const regexp = /\+|-|\(|\)|\s/gi;
  return num.replace(regexp, '');
};

export const plural = function (str, type = 'year') {
  let text_forms =
    type === 'year' ? ['год', 'года', 'лет'] : ['минута', 'минуты', 'минут'];
  const regexp = /≈/gi; // примерный возраст в Подборе
  const formatedAge = regexp.test(str)
    ? `≈ ${str.replace(regexp, '')}`
    : str || 0;
  str = Math.abs(str.replace(regexp, '')) % 100;
  var n1 = str % 10;

  if (+str <= 0) return;

  if (str > 10 && str < 20) {
    return `${formatedAge} ${text_forms[2]}`;
  }
  if (n1 > 1 && n1 < 5) {
    return `${formatedAge} ${text_forms[1]}`;
  }
  if (n1 == 1) {
    return `${formatedAge} ${text_forms[0]}`;
  }
  return `${formatedAge} ${text_forms[2]}`;
};

export const salaryFormat = (str, type = 'decimal', precision = 2) => {
  if (type === 'decimal') {
    return parseFloat(str).toFixed(precision);
  } else {
    const salary = Number(Number(str).toFixed());
    const withoutSpace = Number(str.replace(' ', ''));
    return salary ? salary.toLocaleString() : withoutSpace;
  }
};

export const numberWithSpace = num =>
  String(Number(num)).replace(/\B(?=(?:\d{3})*$)/g, ' ');

export const uniq = array => Array.from(new Set(array));

export const fullname = (...fio) => fio.filter(i => !!i.trim()).join(' ');

export const scrollToError = (
  fields = [],
  wrapperElem = window,
  rootElem = null
) => {
  // для форм редактирования по метаданным (новый интерфейс)
  const firstErrorField = fields[0];

  if (!firstErrorField) return;

  const stickyPanel = document.querySelector('.button-panel')
    ? document.querySelector('.button-panel').offsetHeight + 15
    : 0;
  const nav = document.querySelector('nav').offsetHeight;
  const fixedTop = wrapperElem !== window ? 0 : stickyPanel + nav;
  const fieldName = firstErrorField.name || firstErrorField;
  const fieldElem =
    document.querySelector(`${rootElem || ''} [name="${fieldName}"]`) ||
    document.querySelector(`${rootElem || ''} [data-name="${fieldName}"]`);

  if (!fieldElem) return;
  const fieldTop = fieldElem.getBoundingClientRect().top;
  const formTop = fieldElem
    .closest('.el-form:not(.detached-form)')
    .getBoundingClientRect().top;
  const scrollValue = fieldTop - formTop - fixedTop;
  wrapperElem.scrollTo({
    top: scrollValue,
    behavior: 'smooth'
  });

  fieldElem.focus();
};

// для нового интерфейса:
export const scrollToErrorField = (fields, wrapperElem = window, self) => {
  const firstErrorField = Object.values(fields).find(field => field.error);
  if (!firstErrorField) return;
  wrapperElem.scroll(0, 0);

  const fieldName = firstErrorField.name;
  const fieldEl =
    document.querySelector(`[name="${fieldName}"]`) ||
    document.querySelector(`[data-name="${fieldName}"] input`);

  if (!fieldEl) return;
  const elemTop = fieldEl.getBoundingClientRect().top;

  wrapperElem.scrollTo({
    top: elemTop,
    behavior: 'smooth'
  });

  // фокус на ошибочном поле (требуется контекст вызова)
  if (!self && !self.$refs[fieldName]) return;
  const refField = self.$refs[fieldName][0].$children[0];
  const focusTheField =
    firstErrorField.type == 'number' ? refField.$el : refField;
  if (focusTheField) self.$nextTick(() => focusTheField.focus());
};

export const showFilter = () => {
  listViewSearchIcon.toggleSearchDialog('latest');
  $('#searchDialog .nav-tabs .active').removeClass('active');
  $('#searchDialog .nav-tabs li').first().addClass('active');
  $('#searchDialog').modal('toggle');
};

export const sklonenieCandidates = (num, type) => {
  const n = Number(num);
  const str = type === 'string' ? num : String(num);
  const lastDigit = str[str.length - 1];

  if (lastDigit == 1 && n !== 11) {
    return 'кандидат';
  } else if (
    (n > 1 && n < 5) ||
    (n > 21 && (lastDigit == 2 || lastDigit == 3 || lastDigit == 4))
  ) {
    return 'кандидата';
  } else {
    return 'кандидатов';
  }
};

export const setContactData = (type, value = null, lbl) => {
  let label = lbl || '';
  // let icon = '';
  let link = value || '';
  let htmlType = 'text';
  // const hasPhone = contacts.filter(
  //   (item, idx) => idx < index && item.value_type === 'phone'
  // ).length;

  switch (type) {
    case 'phone':
      // icon = ['fab', 'whatsapp-square'];
      if (!label) label = 'Телефон';
      link = value ? `https://wa.me/${value.replace(/\D/g, '')}` : '';
      htmlType = 'tel';
      break;

    case 'email':
      // icon = ['far', 'envelope'];
      link = value ? `mailto:${value}` : '';
      htmlType = 'email';
      if (!label) label = 'E-mail';
      break;

    case 'telegram':
      // icon = ['fab', 'telegram'];
      link = value ? `https://t.me/${value}` : '';
      if (!label) label = 'Telegram';
      break;

    case 'skype':
      // icon = ['fab', 'skype'];
      link = value ? `skype:${value}?chat` : '';
      if (!label) label = 'Skype';
      break;

    case 'facebook':
      // icon = ['fab', 'facebook'];
      htmlType = 'url';
      if (!label) label = 'Facebook';
      break;

    case 'freelance':
      // icon = ['fas', 'laptop'];
      htmlType = 'url';
      if (!label) label = 'Freelance';
      break;

    case 'site':
      // icon = ['fas', 'globe'];
      htmlType = 'url';
      if (!label) label = 'Сайт';
      break;

    case 'linkedin':
      // icon = ['fab', 'linkedin-in'];
      htmlType = 'url';
      if (!label) label = 'LinkedIn';
      break;

    case 'livejournal':
      // icon = ['fas', 'pencil-alt'];
      htmlType = 'url';
      if (!label) label = 'LiveJournal';
      break;

    case 'moi_krug':
    case 'habr':
      // icon = ['fas', 'users'];
      htmlType = 'url';
      if (!label) label = 'Хабр.Карьера';
      break;

    case 'icq':
      // icon = ['far', 'comment'];
      if (!label) label = 'ICQ';
      break;

    default:
      break;
  }

  return { label, /*icon,*/ link, htmlType };
};

export const stagesLength = stages => {
  if (stages.hasOwnProperty('length')) {
    return stages.length;
  } else {
    return Object.keys(stages).length;
  }
};

export const stageWidth = (amount, width) => {
  const unit = width ? 'px' : '%';
  return (width || 100) / amount + unit;
};

export const stageLabel = stage => {
  const { name, count } = stage;
  return `${count} ${sklonenieCandidates(count)} на этапе "${name}"`;
};

export const editView = (module, id) => {
  return `/index.php?module=${module}&action=EditView&record=${id}`;
};

export const detailView = (module, id) => {
  return `/index.php?module=${module}&action=DetailView&record=${id}`;
};

export const setStageIcon = stage => {
  return `/index.php?entryPoint=DownloadImage&id=${stage.id}_stage_icon&type=HRPAC_SELECTION_STAGE`;
};

export const page = module => {
  return {
    isVacancy: module === 'HRPAC_VACANCY',
    isCandidate: module === 'HRPAC_CANDIDATES',
    isPanel: module === 'panel_Selection'
  };
};

export const addStageStyles = (module, stage, stages, condition) => {
  const { isCandidate, /*isVacancy,*/ isPanel } = page(module);
  const styles = {};
  const iconStyles = {};

  if (!isCandidate || (isCandidate && condition)) {
    styles.background = hexToRGBA(stage.color, '0.3');
    styles.border = `1px solid ${stage.color}`;
    iconStyles.background = stage.color;
    styles.color = '#ffffff';
  }

  if (isPanel && condition) {
    const bgColor = '#F2F2F2';
    styles.background = bgColor;
    styles.color = stage.color;
    iconStyles.background = '#cccccc';
    styles.border = '1px solid #cccccc';
  }

  if (isCandidate) {
    styles.width = stageWidth(stagesLength(stages));
  }

  stage['styles'] = styles;
  stage['iconStyles'] = iconStyles;

  return stage;
};

export const listUrlParams = (module, relateModule, id) => {
  return {
    module,
    relate_mdule: relateModule,
    relate_id: id,
    relate_mdule_link: 'hrpac_vacancy_hrpac_candidates_1',
    action: 'Popup',
    mode: 'MultiSelect',
    only_assigned: 1,
    jsqon_return: 1,
    to_pdf: true
  };
};

export const setUrlParam = (action, module) => {
  let param = '';
  [module, action].forEach(prop => {
    switch (prop) {
      case 'index':
        param += 'List';
        break;

      case 'Popup':
        param += 'Card';
        break;

      case 'HRPAC_CANDIDATES':
        param += 'C';
        break;

      case 'HRPAC_VACANCY':
        param += 'V';
        break;

      case 'HRPAC_VACANCY_TEMPLATE':
        param += 'T';
        break;

      default:
        break;
    }
  });
  return param;
};

export const dateToMs = date => {
  if (!date) {
    const [nowDay, nowMonth, nowYear] = new Date()
      .toLocaleDateString()
      .split('.');
    return new Date(nowYear, nowMonth, nowDay, 0, 0).getTime();
  } else {
    const [day, month, year] = date.split('.');
    return new Date(year, month, day, 0, 0).getTime();
  }
};

export const setDateFormat = dateFormat => {
  if (dateFormat) {
    const separator = dateFormat.match(/[./-]/g)[0];
    const dateArray = dateFormat.replace(/%/g, '').split(separator);
    const format = dateArray.map(item => {
      item =
        item == 'Y' || item == 'YY'
          ? item.toLowerCase()
          : item == 'm' || item == 'mm'
          ? item.toUpperCase()
          : item.toLowerCase();
      if (item.length === 1) {
        return item == 'd' || item == 'M' ? item.repeat(2) : item.repeat(4);
      } else return item;
    });

    return format.join(separator);
  }
  return 'dd.MM.yyyy';
};

export const setTodayByFormat = format => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  return format
    .replace('yyyy', year)
    .replace('MM', month < 10 ? '0' + month : month)
    .replace('dd', day < 10 ? '0' + day : day);
};

export const getVal = (source1 = {}, source2 = {}, name, defaultVal) => {
  return source1[name]
    ? source1[name].value
    : source2 && source2[name]
    ? source2[name.toUpperCase()]
    : defaultVal;
};

export const uniqueOfferStageNames = (offerStages = {}) => {
  // уникальная коллекция текущих этапов с галками оффера (для информ.сообщения)
  return [
    ...new Set(Object.values(offerStages).reduce((a, b) => a.concat(b), []))
  ]
    .map(stage => stage.split('_')[1])
    .join(', ');
};

export const copyText = id => {
  // уже не используется
  let range;
  const elem = document.getElementById(id);

  if (document.selection) {
    // IE
    range = document.body.createTextRange();
    range.moveToElementText(elem);
    range.select();
  } else if (window.getSelection) {
    elem.select();
  }

  const copied = document.execCommand('copy');
  if (copied) {
    Message({
      offset: 100,
      showClose: true,
      message: 'Текст скопирован',
      type: 'success'
    });
  }
};

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
