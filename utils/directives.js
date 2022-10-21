import Vue from 'vue';

Vue.directive('scroll', {
  inserted: function (el, binding) {
    let f = function (evt) {
      if (binding.value(evt, el)) {
        window.removeEventListener('scroll', f);
      }
    };
    window.addEventListener('scroll', f);
  }
});

Vue.directive('click-outside', {
  bind(el, binding) {
    el.addEventListener('click', e => e.stopPropagation());
    document.body.addEventListener('click', binding.value);
  },
  unbind(el, binding) {
    document.body.removeEventListener('click', binding.value);
  }
});

Vue.directive('infinite-scroll', {
  bind(el, binding) {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.25
    };

    const observer = new IntersectionObserver(entries => {
      const lastEl = Boolean(el.getAttribute('infinite-scroll-last'));

      if (lastEl)
        entries.forEach(entry => {
          if (entry.isIntersecting && binding.value) {
            binding.value();
          }
        });
    }, options);

    observer.observe(el);
  }
});

Vue.directive('tooltip', {
  // показ подсказки в случае, если текст не умещается в блоке
  bind(el) {
    el.addEventListener('mouseover', function (evt) {
      let targetEl = evt.target;
      if (targetEl.offsetWidth < targetEl.scrollWidth) {
        targetEl.setAttribute('title', evt.target.textContent);
      } else {
        targetEl.hasAttribute('title') && targetEl.removeAttribute('title');
      }
    });
  }
});

Vue.directive('custom-click', {
  // отслеживание клика на текущем и вложенных элементах
  bind(el, binding) {
    const argument = el.getAttribute('custom-click-argument');

    el.addEventListener('click', () => {
      binding.value(argument);
    });
  },
  unbind(el, binding) {
    document.body.removeEventListener('click', binding.value);
  }
});
