export type CommonTagOptions = {
  tag: string;
  attrs: Record<string, null | string[]>;
};

const commonAttrs = {
  id: null,
  class: null,
  title: null,
};

const commonAlign = ['left', 'center', 'right'];

// 选择true则为 key='key', false则不设属性
const commonTrueOfFalse = ['true', 'false'];

const commonInputAttrs = {
  name: null,
  autofocus: commonTrueOfFalse,
  disabled: commonTrueOfFalse,
  readonly: commonTrueOfFalse,
  required: commonTrueOfFalse,
  autocomplete: ['on', 'off'],
  maxlength: null,
  placeholder: null,
  minlength: null,
};

/**常用的HTML标签及其属性 */
export const commonTagOptions: CommonTagOptions[] = [
  {
    tag: 'a',
    attrs: {
      href: null,
      target: ['_blank', '_self', '_top', '_parent'],
      ...commonAttrs,
    },
  },
  {
    tag: 'h1',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'h2',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'h3',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'h4',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'h5',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'h6',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'i',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'b',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 's',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'u',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'sup',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'sub',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'p',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'br',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'hr',
    attrs: {
      size: null,
      width: null,
      color: null,
      align: commonAlign,
      ...commonAttrs,
    },
  },
  {
    tag: 'div',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'span',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'img',
    attrs: {
      src: null,
      alt: null,
      width: null,
      height: null,
      ...commonAttrs,
    },
  },
  {
    tag: 'table',
    attrs: {
      width: null,
      height: null,
      boder: null,
      bgcolor: null,
      align: commonAlign,
      cellpadding: null,
      cellspacing: null,
      ...commonAttrs,
    },
  },
  {
    tag: 'tr',
    attrs: {
      bgcolor: null,
      align: commonAlign,
      valign: ['top', 'middle', 'bottom'],
      ...commonAttrs,
    },
  },
  {
    tag: 'td',
    attrs: {
      width: null,
      height: null,
      rowspan: null,
      align: commonAlign,
      valign: ['top', 'middle', 'bottom'],
      ...commonAttrs,
    },
  },
  {
    tag: 'th',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'thead',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'tbody',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'tfoot',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'ol',
    attrs: {
      type: ['1', 'a', 'A', 'i', 'I'],
      start: null,
      ...commonAttrs,
    },
  },
  {
    tag: 'ul',
    attrs: {
      type: ['disc', 'circle', 'square', 'none'],
      ...commonAttrs,
    },
  },
  {
    tag: 'li',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'dl',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'dt',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'dd',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'form',
    attrs: {
      name: null,
      action: null,
      method: ['GET', 'POST'],
      autocomplete: ['on', 'off'],
      ...commonAttrs,
    },
  },
  {
    tag: 'input',
    attrs: {
      type: [
        'text',
        'button',
        'email',
        'file',
        'hidden',
        'number',
        'password',
        'radio',
        'checkbox',
        'search',
        'submit',
        'tel',
        'color',
      ],
      checked: commonTrueOfFalse,
      ...commonInputAttrs,
      pattern: null,
      attrs: null,
      multiple: commonTrueOfFalse,
      ...commonAttrs,
    },
  },
  {
    tag: 'button',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'select',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'option',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'header',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'nav',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'aside',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'article',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'section',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'footer',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'textarea',
    attrs: {
      rows: null,
      cols: null,
      wrap: ['hard', 'soft'],
      ...commonInputAttrs,
      ...commonAttrs,
    },
  },
  {
    tag: 'tag',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'video',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'audio',
    attrs: {
      ...commonAttrs,
    },
  },
  {
    tag: 'canvas',
    attrs: {
      width: null,
      height: null,
      ...commonAttrs,
    },
  },
];
