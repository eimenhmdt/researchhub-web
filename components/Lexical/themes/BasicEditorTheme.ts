import type { EditorThemeClasses } from "lexical";

const theme: EditorThemeClasses = {
  blockCursor: "BasicEditorTheme__blockCursor",
  characterLimit: "BasicEditorTheme__characterLimit",
  code: "BasicEditorTheme__code",
  codeHighlight: {
    atrule: "BasicEditorTheme__tokenAttr",
    attr: "BasicEditorTheme__tokenAttr",
    boolean: "BasicEditorTheme__tokenProperty",
    builtin: "BasicEditorTheme__tokenSelector",
    cdata: "BasicEditorTheme__tokenComment",
    char: "BasicEditorTheme__tokenSelector",
    class: "BasicEditorTheme__tokenFunction",
    "class-name": "BasicEditorTheme__tokenFunction",
    comment: "BasicEditorTheme__tokenComment",
    constant: "BasicEditorTheme__tokenProperty",
    deleted: "BasicEditorTheme__tokenProperty",
    doctype: "BasicEditorTheme__tokenComment",
    entity: "BasicEditorTheme__tokenOperator",
    function: "BasicEditorTheme__tokenFunction",
    important: "BasicEditorTheme__tokenVariable",
    inserted: "BasicEditorTheme__tokenSelector",
    keyword: "BasicEditorTheme__tokenAttr",
    namespace: "BasicEditorTheme__tokenVariable",
    number: "BasicEditorTheme__tokenProperty",
    operator: "BasicEditorTheme__tokenOperator",
    prolog: "BasicEditorTheme__tokenComment",
    property: "BasicEditorTheme__tokenProperty",
    punctuation: "BasicEditorTheme__tokenPunctuation",
    regex: "BasicEditorTheme__tokenVariable",
    selector: "BasicEditorTheme__tokenSelector",
    string: "BasicEditorTheme__tokenSelector",
    symbol: "BasicEditorTheme__tokenProperty",
    tag: "BasicEditorTheme__tokenProperty",
    url: "BasicEditorTheme__tokenOperator",
    variable: "BasicEditorTheme__tokenVariable",
  },
  embedBlock: {
    base: "BasicEditorTheme__embedBlock",
    focus: "BasicEditorTheme__embedBlockFocus",
  },
  hashtag: "BasicEditorTheme__hashtag",
  heading: {
    h1: "BasicEditorTheme__h1",
    h2: "BasicEditorTheme__h2",
    h3: "BasicEditorTheme__h3",
    h4: "BasicEditorTheme__h4",
    h5: "BasicEditorTheme__h5",
    h6: "BasicEditorTheme__h6",
  },
  image: "editor-image",
  indent: "BasicEditorTheme__indent",
  inlineImage: "inline-editor-image",
  layoutContainer: "BasicEditorTheme__layoutContaner",
  layoutItem: "BasicEditorTheme__layoutItem",
  link: "BasicEditorTheme__link",
  list: {
    listitem: "BasicEditorTheme__listItem",
    listitemChecked: "BasicEditorTheme__listItemChecked",
    listitemUnchecked: "BasicEditorTheme__listItemUnchecked",
    nested: {
      listitem: "BasicEditorTheme__nestedListItem",
    },
    olDepth: [
      "BasicEditorTheme__ol1",
      "BasicEditorTheme__ol2",
      "BasicEditorTheme__ol3",
      "BasicEditorTheme__ol4",
      "BasicEditorTheme__ol5",
    ],
    ul: "BasicEditorTheme__ul",
  },
  ltr: "BasicEditorTheme__ltr",
  mark: "BasicEditorTheme__mark",
  markOverlap: "BasicEditorTheme__markOverlap",
  paragraph: "BasicEditorTheme__paragraph",
  quote: "BasicEditorTheme__quote",
  rtl: "BasicEditorTheme__rtl",
  table: "BasicEditorTheme__table",
  tableAddColumns: "BasicEditorTheme__tableAddColumns",
  tableAddRows: "BasicEditorTheme__tableAddRows",
  tableCell: "BasicEditorTheme__tableCell",
  tableCellActionButton: "BasicEditorTheme__tableCellActionButton",
  tableCellActionButtonContainer:
    "BasicEditorTheme__tableCellActionButtonContainer",
  tableCellEditing: "BasicEditorTheme__tableCellEditing",
  tableCellHeader: "BasicEditorTheme__tableCellHeader",
  tableCellPrimarySelected: "BasicEditorTheme__tableCellPrimarySelected",
  tableCellResizer: "BasicEditorTheme__tableCellResizer",
  tableCellSelected: "BasicEditorTheme__tableCellSelected",
  tableCellSortedIndicator: "BasicEditorTheme__tableCellSortedIndicator",
  tableResizeRuler: "BasicEditorTheme__tableCellResizeRuler",
  tableSelected: "BasicEditorTheme__tableSelected",
  tableSelection: "BasicEditorTheme__tableSelection",
  text: {
    bold: "BasicEditorTheme__textBold",
    code: "BasicEditorTheme__textCode",
    italic: "BasicEditorTheme__textItalic",
    strikethrough: "BasicEditorTheme__textStrikethrough",
    subscript: "BasicEditorTheme__textSubscript",
    superscript: "BasicEditorTheme__textSuperscript",
    underline: "BasicEditorTheme__textUnderline",
    underlineStrikethrough: "BasicEditorTheme__textUnderlineStrikethrough",
  },
};

export default theme;
