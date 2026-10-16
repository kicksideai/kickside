import { vi } from 'vitest'
;(globalThis as any).__props__={config:{}};(globalThis as any).__events__=[];(globalThis as any).__api__={}
function response(url:string){const map=(globalThis as any).__api__;for(const key of Object.keys(map))if(url.includes(key))return map[key];return {success:true}}
export const api={get:vi.fn((url:string)=>Promise.resolve({data:response(url)})),post:vi.fn((url:string)=>Promise.resolve({data:response(url)})),put:vi.fn((url:string)=>Promise.resolve({data:response(url)})),delete:vi.fn((url:string)=>Promise.resolve({data:response(url)}))}
vi.mock('@wippy-fe/proxy',()=>({api,host:{toast:vi.fn()},loadByTagName:vi.fn()}))
vi.mock('@wippy-fe/webcomponent-vue',()=>({useProps:()=>({value:(globalThis as any).__props__}),useEvents:()=>vi.fn((name,detail)=>(globalThis as any).__events__.push({name,detail})),WippyVueElement:class{},define:vi.fn()}))
