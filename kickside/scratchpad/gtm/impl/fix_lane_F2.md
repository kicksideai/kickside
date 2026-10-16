# Lane F2 visual-canon fixes

| Row | Files touched | Change |
|---:|---|---|
| 13 | `platform/widgets/ui/src/multiselect/styles.css` | Set MultiSelect result rows to 8px vertical padding. |
| 14 | `platform/widgets/ui/src/picker/cp-base.css`, `platform/widgets/ui/src/{channel-picker,connection-picker,component-picker}/styles.css`, `platform/widgets/ui/src/model-picker/styles.css` | Moved shared picker rows into the base and set picker/model result rows and component create actions to 8px control spacing. |
| 15 | `platform/widgets/ui/src/app/pickerselect.css`, `platform/automation/ui/src/styles.css` | Made PickerSelect options 8px-radius/8px-padding controls; automation imports the shared stylesheet. |
| 16 | `platform/widgets/ui/src/app/{FieldMapper.vue,field-mapper.css}` | Set target-row padding to 8px and gave row headers an 8px-radius, 8px hit area. |
| 17 | `platform/widgets/ui/src/app/field-mapper.css` | Kept the assist error as a 10px alert with 8px vertical padding. |
| 18 | `platform/automation/ui/src/trigger-config/styles.css` | Set the load-error retry action to 8px radius and vertical padding. |
| 19 | `platform/automation/ui/src/trigger-config/styles.css` | Set source-option chips to the 6px chip radius. |
| 20 | `platform/automation/ui/src/styles.css` | Set catalog-card buttons to 8px; icon tiles remain 11px. |
| 21 | `platform/widgets/ui/src/multiselect/styles.css`, `platform/automation/ui/src/{styles.css,trigger-config/styles.css}`, `platform/recipes/ui/src/styles.css` | Added explicit 8px checkbox radii for all shared checkbox patterns. |
| 22 | `platform/widgets/ui/src/{styles.css,multiselect/styles.css}` | Added 8px radii, padding, and focus treatment for Reset and the Advanced summary. |
| 24 | `platform/recipes/ui/src/styles.css` | Set recipe errors to the 10px alert radius with 8px vertical padding. |
| 25 | `platform/widgets/ui/src/app/pickerselect.css`, `platform/automation/ui/src/styles.css` | Set the shared picker panel to 14px and removed automation's local panel override. |
| 29 | `platform/widgets/ui/src/styles.css` | Set IconPicker Reset to an 8px-radius control with an 8px vertical hit area. |
| 30 | `platform/widgets/ui/src/{picker-base.css,picker/cp-base.css,styles.css,multiselect/styles.css,model-picker/styles.css,app/pickerselect.css,app/field-mapper.css}`, `platform/automation/ui/src/styles.css` | Replaced raw colors/shadows with `--p-*`-derived values and centralized picker elevation. |
| 33 | `platform/automation/ui/src/{styles.css,trigger-config/styles.css}` | Replaced hardcoded SVG chevrons with token-colored CSS chevrons. |
| 35 | `platform/widgets/ui/src/channel-picker/{app/ChannelPicker.vue,styles.css}` | Passed tree depth through `--cp-depth`; the stylesheet owns the padding calculation. |
| 36 | `platform/widgets/ui/src/app/{FieldMapper.vue,field-mapper.css}` | Passed source-tree depth through `--fm-depth`; the stylesheet owns the padding. |
| 38 | `platform/widgets/ui/src/picker/cp-base.css`, `platform/widgets/ui/src/{channel-picker,connection-picker,component-picker}/styles.css`, `platform/widgets/ui/src/component-picker/app/ComponentPicker.vue` | Consolidated the channel/connection/component picker family into one shadow-safe base stylesheet. |
| 39 | `platform/widgets/ui/src/app/pickerselect.css`, `platform/automation/ui/src/styles.css` | Made the widget PickerSelect panel/option stylesheet the only source; removed the automation copy. |

## Verification

`npx vitest run` tails:

- `platform/widgets/ui`: 15 files passed, 106 tests passed.
- `platform/automation/ui`: 10 files passed, 97 tests passed.
- `platform/recipes/ui`: 3 files passed, 32 tests passed.

`npm run build` results:

- `platform/widgets/ui`: Vite build succeeded in 519ms.
- `platform/automation/ui`: Vite build succeeded in 567ms.
- `platform/recipes/ui`: Vite build succeeded in 470ms.

Scoped `git diff --check` passed. The assigned source trees contain no raw hex/rgb colors or inline `paddingLeft` declarations.
