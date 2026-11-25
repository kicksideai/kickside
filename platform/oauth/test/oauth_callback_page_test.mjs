import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const template = readFileSync(new URL('../src/views/oauth_callback.jet', import.meta.url), 'utf8');
const scripts = [...template.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
const script = scripts[0][1];

async function runCallback(fetch) {
    const elements = new Map();
    for (const id of ['loading-state', 'success-state', 'error-state', 'error-message', 'dot1', 'dot2', 'dot3']) {
        const classes = new Set();
        elements.set(id, {
            textContent: '',
            classList: {
                add: (...names) => names.forEach(name => classes.add(name)),
                remove: (...names) => names.forEach(name => classes.delete(name)),
                contains: name => classes.has(name)
            }
        });
    }
    const messages = [];
    const storage = new Map();
    await runInNewContext(`${script}\nprocessCallback();`, {
        URLSearchParams,
        fetch,
        setTimeout: callback => callback(),
        window: {
            location: { search: '?code=code&state=state-token-123' },
            opener: { postMessage: (message, target) => messages.push({ message: JSON.parse(JSON.stringify(message)), target }) },
            addEventListener() {}
        },
        document: {
            getElementById: id => elements.get(id),
            querySelectorAll: selector => (selector === '.state'
                ? ['loading-state', 'success-state', 'error-state']
                : ['dot1', 'dot2', 'dot3']).map(id => elements.get(id))
        },
        localStorage: { setItem: (key, value) => storage.set(key, JSON.parse(value)) }
    });
    return { elements, messages, storage };
}

function jsonResponse(status, body) {
    return async () => ({ ok: status >= 200 && status < 300, json: async () => body });
}

for (const [status, error, restartRequired] of [
    [404, 'OAuth session not found or expired', true],
    [500, 'OAuth session timeout', true],
    [400, 'Failed to exchange authorization code for token: invalid_grant', false],
    [200, 'OAuth authentication failed', false]
]) {
    test(`shows the JSON error for status ${status} and preserves error messages`, async () => {
        const { elements, messages, storage } = await runCallback(jsonResponse(status, { success: false, error }));
        assert.equal(elements.get('error-message').textContent,
            restartRequired ? `${error}. Start the connection again from the app.` : error);
        assert.equal(elements.get('error-state').classList.contains('active'), true);
        assert.deepEqual(messages, [{
            message: { type: 'oauth_result', success: false, error, state_token: 'state-token-123' },
            target: '*'
        }]);
        assert.deepEqual(storage.get('oauth_result_state-token-123'), { success: false, error });
    });
}

test('shows Network error when the request fails', async () => {
    const { elements } = await runCallback(async () => { throw new TypeError('fetch failed'); });
    assert.equal(elements.get('error-message').textContent, 'Network error');
});

test('shows Network error when the body is not JSON', async () => {
    const { elements } = await runCallback(async () => ({
        ok: false,
        json: async () => { throw new SyntaxError('Unexpected token'); }
    }));
    assert.equal(elements.get('error-message').textContent, 'Network error');
});

test('shows Authorization failed for JSON without an error on a failed response', async () => {
    const { elements } = await runCallback(jsonResponse(500, { success: true }));
    assert.equal(elements.get('error-message').textContent, 'Authorization failed');
    assert.equal(elements.get('success-state').classList.contains('active'), false);
});

test('preserves the success state and messages', async () => {
    const { elements, messages, storage } = await runCallback(jsonResponse(200, { success: true }));
    assert.equal(elements.get('success-state').classList.contains('active'), true);
    assert.deepEqual(messages, [{
        message: { type: 'oauth_result', success: true, state_token: 'state-token-123' },
        target: '*'
    }]);
    assert.deepEqual(storage.get('oauth_result_state-token-123'), { success: true });
});
