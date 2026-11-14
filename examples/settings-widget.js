import {
  buildWidget,
  twHeader,
  twList,
  twListItem,
  twSwitch,
  twRadioGroup,
  twBadge,
  twSaveButton
} from "../src/index.js";

const result = buildWidget({
  title: "Bot Preferences",
  body: [
    twHeader({ title: "Notification Settings", subtitle: "Synced with your bot chat" }),
    twList({
      label: "Alerts",
      items: [
        twSwitch({ name: "digest", label: "Daily digest", description: "Summary at 09:00", checked: true }),
        twSwitch({ name: "mentions", label: "Direct mentions", checked: false }),
        twListItem({
          title: "Connected Wallet",
          subtitle: "TON Mainnet",
          trailing: twBadge({ text: "Active", variant: "success" }),
          request: '{"action":"wallet_info"}'
        })
      ]
    }),
    twRadioGroup({
      name: "frequency",
      label: "Delivery Mode",
      value: "instant",
      options: [
        { value: "instant", label: "Instant", description: "Push immediately" },
        { value: "batched", label: "Hourly batch", description: "Reduced noise" }
      ]
    }),
    twSaveButton({
      action: "save_prefs",
      label: "Save",
      statusText: "Changes sync to bot",
      autoDisable: true
    })
  ].join("")
});

console.log(
  `settings-widget: raw=${result.rawBytes} B, zlib9=${result.compressedBytes} B, withinLimits=${result.withinLimits}`
);
if (!result.withinLimits) {
  console.error(result.errors);
  process.exit(1);
}
