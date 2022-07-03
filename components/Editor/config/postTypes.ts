import icons, { textEditorIcons } from "~/config/themes/icons";

const postTypes = [{
  label: "Discuss",
  value: "discuss_paper",
  isDefault: true,
  group: "contribute",
  icon: icons.commentRegular,
  placeholder: "What are your thoughts about this paper?"
},{
  label: "Peer review",
  value: "submit_review",  
  group: "contribute",
  icon: icons.starFilled,
},{
  label: "Summarize",
  value: "submit_summary",
  group: "contribute",
  icon: textEditorIcons.bulletedList,
},{
  label: "Peer review",
  value: "request_review",
  group: "request",
  icon: icons.starFilled,
}, {
  label: "Summarize",
  value: "request_summary",  
  group: "request",
  icon: textEditorIcons.bulletedList,
}];

export default postTypes;
