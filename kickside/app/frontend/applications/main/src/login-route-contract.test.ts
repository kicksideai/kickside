import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appRoot = new URL("../../../../", import.meta.url);

const appManifest = readFileSync(
	new URL("src/app/_index.yaml", appRoot),
	"utf8",
);
const loginManifest = readFileSync(
	new URL("src/app/login/_index.yaml", appRoot),
	"utf8",
);
const dependencies = readFileSync(
	new URL("src/app/deps/_index.yaml", appRoot),
	"utf8",
);
const loginPage = readFileSync(
	new URL("src/app/login/login.jet", appRoot),
	"utf8",
);
const seoHandler = readFileSync(
	new URL("src/app/seo/serve.lua", appRoot),
	"utf8",
);

describe("login route contract", () => {
	it("serves the login page through a dedicated non-API router", () => {
		const webRouter = appManifest.match(
			/^ {2}- name:[ \t]+web[ \t]*$[\s\S]*?(?=^ {2}- name:)/m,
		)?.[0];

		expect(webRouter).toBeDefined();
		expect(webRouter).toContain("kind: http.router");
		expect(webRouter).toContain("server: gateway");
		expect(webRouter).not.toContain("prefix:");
		expect(loginManifest).toMatch(/^[ \t]+router:[ \t]+app:web[ \t]*$/m);
		expect(loginManifest).toMatch(/^[ \t]+path:[ \t]+\/login[ \t]*$/m);
		expect(loginManifest).not.toContain("router: app:api.public");
	});

	it("uses the root login URL for redirects and links", () => {
		expect(dependencies).toContain(`      - name: login_path
        value: /login
`);
		expect(loginPage).toContain('encodeURIComponent("/login")');
		expect(seoHandler).toContain("[Sign in](/login)");

		expect(`${dependencies}\n${loginPage}\n${seoHandler}`).not.toContain(
			"/api/public/login",
		);
	});
});
