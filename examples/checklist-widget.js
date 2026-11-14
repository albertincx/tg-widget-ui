import {
  buildWidget,
  twHeader,
  twList,
  twCheckbox,
  twProgress,
  twButton,
  twButtonRow,
  twSaveButton
} from "../src/index.js";

const result = buildWidget({
  title: "Sprint Checklist",
  body: [
    twHeader({ title: "Release Checklist", subtitle: "Tap items to toggle, then save." }),
    twProgress({ value: 2, max: 3, label: "Release progress" }),
    twList({
      label: "Tasks",
      items: [
        twCheckbox({ name: "tests", label: "Run unit tests", description: "All suites green", checked: true }),
        twCheckbox({ name: "size", label: "Verify 4 KB zlib budget", checked: true }),
        twCheckbox({ name: "deploy", label: "Publish Bot API 10.4 widget", checked: false })
      ]
    }),
    twButtonRow([
      twButton({ label: "Refresh", variant: "secondary", request: '{"action":"refresh"}' }),
      twSaveButton({ action: "save_checklist", label: "Save Changes", savingLabel: "Saving...", savedLabel: "Saved" })
    ])
  ].join("")
});

console.log(
  `checklist-widget: raw=${result.rawBytes} B, zlib9=${result.compressedBytes} B, withinLimits=${result.withinLimits}`
);
if (!result.withinLimits) {
  console.error(result.errors);
  process.exit(1);
}
