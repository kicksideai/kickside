"""Declared postconditions for Jira regressions, independent of model wording."""
from harness import require


def assert_capability_action(state):
    label, disabled, active = state['label'], state['disabled'], state['active']
    if active:
        require(label == 'Capability added' and disabled, 'Selected capability is offered for addition again')
    elif label == 'Add capability':
        require(not disabled, 'Selectable capability cannot be added')
    else:
        require(label == 'Managed in agent settings' and disabled, 'Managed capability exposes an invalid selection action')


def assert_tool_turn(state, invocation_ids, badges, failed):
    require(state['enabled'] and not state['busy'], 'Tool failure leaves the chat busy or disabled')
    require(bool(state['text'].strip()), 'Tool failure produces no visible assistant response')
    require(1 <= badges <= 4 and 1 <= len(invocation_ids) <= 4, 'Tool failure has no bounded observable invocations')
    require(failed >= 1, 'The requested tool call does not visibly fail')


def assert_documents(result, upload_ids):
    require(result.get('success') is True, 'Knowledge browse fails')
    nodes = result.get('nodes', [])
    require(result.get('total') == len(upload_ids) and len(nodes) == len(upload_ids), 'Knowledge document count differs from selected uploads')
    found = set()
    def visit(value):
        if isinstance(value, dict):
            for key, child in value.items():
                if key == 'upload_id' and isinstance(child, str):
                    found.add(child)
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)
    visit(nodes)
    require(found == upload_ids, 'Knowledge documents lose exact upload provenance')


def assert_paused_drive(status):
    require(status.get('success') is True, 'Automation status fails')
    main = next((drive for drive in status.get('drives', []) if drive.get('drive_key') == 'main'), None)
    require(main and main.get('enabled') is False and main.get('phase') == 'paused', 'Main automation drive is not paused and disabled')


def assert_discord_reply(records, channel):
    return next((record for record in records if record.get('method') == 'POST'
                 and record.get('path') == '/api/v10/channels/' + channel + '/messages'
                 and record.get('status') == 200 and str(record.get('body', {}).get('content', '')).strip()), None)


def assert_sync_config(config, status, kid):
    require(config.get('success') is True, 'Sync configuration read fails')
    live = config.get('config', {})
    declaration = live.get('_portable_input', {})
    require(live.get('enabled') is True and declaration.get('enabled') is True, 'Sync enabled choice does not persist')
    require(declaration.get('sink_port') == 'kickside.knowledge.sink:kb_embed', 'Sync stores another destination port')
    require(declaration.get('sink_config') == {'kb_ids': [kid]}, 'Sync stores another selected knowledge base')
    require(status.get('success') is True, 'Sync drive status read fails')
    main = next((drive for drive in status.get('drives', []) if drive.get('drive_key') == 'main'), None)
    require(main and main.get('enabled') is True, 'Sync canonical main drive is disabled')


def assert_responder_failure(result):
    require(result.get('success') is False and result.get('accepted') is False and result.get('status') == 'error',
            'Responder misconfiguration does not reject delivery: ' + str(result))
    require(isinstance(result.get('reason'), str) and result['reason'].strip(), 'Responder reports no typed failure reason')
    require(result.get('health_reported') is True, 'Responder failure is not persisted as health')
    message = result.get('error')
    require(isinstance(message, str) and message.strip(), 'Responder failure supplies no visible message')
    return message


def assert_responder_tool_failure(result):
    require(result.get('isError') is True, 'Responder domain failure is not marked as a tool error: ' + str(result))
    failure = result.get('structuredContent')
    require(isinstance(failure, dict), 'Responder tool error has no structured domain result: ' + str(result))
    return assert_responder_failure(failure)
