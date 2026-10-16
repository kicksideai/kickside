local test = require('test')
local security = require('security')
local sql = require('sql')
local registry = require('registry')

return {run = test.run_cases(function()
    test.describe('saved unsigned credentials when signing activates', function()
        test.it('RUNTIME-UNSIGNED-TOKEN-SIGNING-CONTINUITY rejects an unsigned credential and preserves its stored payload', function()
            local db = assert(sql.get('app:db'))
            local _, create_err = db:execute([[CREATE TABLE auth_tokens (
                token_key TEXT PRIMARY KEY, token_value BYTEA NOT NULL, expires_at TIMESTAMP
            )]])
            test.is_nil(create_err)
            local signed_entry = assert(registry.get('app:auth'))
            local unsigned_entry = assert(registry.get('app:auth'))
            unsigned_entry.data.token_key = ''
            unsigned_entry.data.token_key_env = nil
            local changes = assert(registry.snapshot()):changes()
            changes:update(unsigned_entry)
            local _, configure_err = changes:apply()
            test.is_nil(configure_err)
            local actor = assert(security.new_actor('member', {}))
            local scope = assert(security.new_scope({}))
            local store = assert(security.token_store('app:auth'))
            local saved, mint_err = store:create(actor, scope, {})
            test.is_nil(mint_err)
            test.is_true(type(saved) == 'string' and saved:find('.', 1, true) == nil,
                'The initial configuration issues an unsigned credential')
            test.not_nil((store:validate(saved)))
            store:close()
            local before = assert(db:query('SELECT token_value FROM auth_tokens'))
            test.eq(#before, 1)
            changes = assert(registry.snapshot()):changes()
            changes:update(signed_entry)
            local _, signing_err = changes:apply()
            test.is_nil(signing_err)
            store = assert(security.token_store('app:auth'))
            local after = assert(db:query('SELECT token_value FROM auth_tokens'))
            test.eq(#after, 1)
            test.eq(after[1].token_value, before[1].token_value)
            local restored, _, validate_err = store:validate(saved)
            test.is_nil(restored, 'Signing accepts a previously unsigned credential')
            test.not_nil(validate_err, 'Unsigned credential rejection has no reason')
            local signed, signed_err = store:create(actor, scope, {})
            test.is_nil(signed_err)
            test.is_true(type(signed) == 'string' and signed:find('.', 1, true) ~= nil,
                'Re-login issues a signed credential')
            test.not_nil((store:validate(signed)))
            store:close()
            changes = assert(registry.snapshot()):changes()
            signed_entry.data.token_length = 40
            changes:update(signed_entry)
            test.is_nil(select(2, changes:apply()))
            store = assert(security.token_store('app:auth'))
            test.not_nil((store:validate(signed)))
            local retained = assert(db:query('SELECT token_value FROM auth_tokens'))
            test.eq(#retained, 2)
            local old_payload = false
            for _, row in ipairs(retained) do
                old_payload = old_payload or row.token_value == before[1].token_value
            end
            test.is_true(old_payload, 'Signing removes or rewrites the original stored credential')
            store:close()
            db:release()
        end)
    end)
end)}
