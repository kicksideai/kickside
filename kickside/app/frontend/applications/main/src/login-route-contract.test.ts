import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

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
		const webRouter = parse(appManifest).entries.find(
			(entry: { name: string }) => entry.name === "web",
		);
		const endpoint = parse(loginManifest).entries.find(
			(entry: { name: string }) => entry.name === "endpoint",
		);

		expect(webRouter).toMatchObject({ kind: "http.router", meta: { server: "gateway" } });
		expect(webRouter).not.toHaveProperty("prefix");
		expect(endpoint).toMatchObject({
			kind: "http.endpoint",
			meta: { router: "app:web" },
			method: "GET",
			path: "/login",
		});
		expect(parse(loginManifest).entries).not.toEqual(expect.arrayContaining([
			expect.objectContaining({ meta: expect.objectContaining({ router: "app:api.public" }) }),
		]));
	});

	it("uses the root login URL for redirects and links", () => {
		const facade = parse(dependencies).entries.find(
			(entry: { component?: string }) => entry.component === "wippy/facade",
		);
		expect(facade.parameters).toContainEqual({ name: "login_path", value: "/login" });
		expect(loginPage).toContain('encodeURIComponent("/login")');
		expect(seoHandler).toContain("[Sign in](/login)");

		expect(`${dependencies}\n${loginPage}\n${seoHandler}`).not.toContain(
			"/api/public/login",
		);
	});
});
