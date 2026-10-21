# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Settings validate parsed structured drafts and display stored-value errors."""
from harness import Scenario
from scenarios_automation_task_forms import frontend_specs


def settings_form(ctx):
    frontend_specs(ctx, 'settings', (
        'src/app/settings.schema.spec.ts', 'src/app/settings.row-errors.spec.ts',
    ), 'settings-form')


REGISTRY = [Scenario('settings_form_schema_and_row_errors', 'regression', settings_form,
                     issues=('SETTINGS-STRUCTURED-SCHEMA-VALIDATION', 'SETTINGS-STORED-ROW-ERROR'))]
