import {resolve} from "node:path"
import {initSync, parse} from "es-module-lexer"
import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const {api,loadByTagName,events}=vi.hoisted(()=>({api:{get:vi.fn(),post:vi.fn()},loadByTagName:vi.fn(),events:vi.fn()}))
vi.mock('@wippy-fe/proxy',()=>({api,loadByTagName}))
vi.mock('@wippy-fe/webcomponent-vue',()=>({useEvents:()=>events}))
import Onboarding from './Onboarding.vue'
import styles from '../styles.css?inline'
import { readFileSync } from 'node:fs'
beforeEach(()=>{vi.clearAllMocks(); loadByTagName.mockResolvedValue(undefined); api.get.mockImplementation(async (url:string)=>url.includes('/models/list')?{data:{success:true,models:[{name:'fixture-model'}]}}:url.includes('/models/classes')?{data:{success:true,classes:[{name:'fast',models:[{name:'fixture-model'}]},{name:'balanced',models:[{name:'fixture-model'}]}]}}:({data:{success:true,agents:[{name:'user_agent:agent-1',start_token:'packed-token'}]}})); api.post.mockResolvedValue({data:{success:true,component_id:'agent-1'}})})
describe('First agent onboarding',()=>{
 it('blocks creation until a configured model is available',async()=>{
  api.get.mockResolvedValue({data:{success:true,models:[],classes:[]}})
  const w=mount(Onboarding); await flushPromises()
  expect(w.text()).toContain('Configure a model')
  expect(w.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  await w.get('form').trigger('submit'); await flushPromises()
  expect(api.post).not.toHaveBeenCalled()
  const setup=w.findAll('button').find(b=>b.text()==='Configure a model')!
  await setup.trigger('click'); await flushPromises()
  expect(loadByTagName).toHaveBeenCalledWith('kickside-onboard-models',{timeoutMs:8000})
  w.get('kickside-onboard-models').element.dispatchEvent(new CustomEvent('done',{detail:{model_configured:true}}))
  await flushPromises()
  expect(w.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  api.get.mockImplementation(async (url:string)=>url.includes('/models/list')?{data:{success:true,models:[{name:'fixture-model'}]}}:{data:{success:true,classes:[{name:'fast',models:[{name:'fixture-model'}]},{name:'balanced',models:[{name:'fixture-model'}]}]}})
  await w.findAll('button').find(b=>b.text()==='Check model configuration')!.trigger('click'); await flushPromises()
  expect(w.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
  w.unmount()
 })
 it('preserves model discovery failures and keeps creation blocked',async()=>{
  api.get.mockRejectedValue(new Error('Model discovery unavailable'))
  const w=mount(Onboarding); await flushPromises()
  expect(w.get('[role="alert"]').text()).toContain('Model discovery unavailable')
  expect(w.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  w.unmount()
 })
 it('declares a dialog and uses content-sized layout inside its host',()=>{
  const declaration=readFileSync('../src/_index.yaml','utf8')
  expect(declaration.split('- name: splash.first_agent\n')[1].split('- name: splash.first_agent.step.create')[0]).toContain('presentation: dialog')
  expect(styles).not.toMatch(/height:\s*100%|margin:\s*auto|padding:\s*24px/)
 })

 it('accepts a configured model class when the default class is empty',async()=>{
  api.get.mockImplementation(async (url:string)=>url.includes('/models/list')?{data:{success:true,models:[{name:'fixture-model'}]}}:{data:{success:true,classes:[{name:'balanced',models:[{name:'fixture-model'}]}]}})
  const w=mount(Onboarding);await flushPromises()
  expect(w.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  w.get('wc-model-picker').element.dispatchEvent(new CustomEvent('select',{detail:'class:balanced'}))
  await flushPromises()
  expect(w.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
  w.unmount()
 })
 it('blocks an unavailable explicit selection even when a default model exists',async()=>{
  const w=mount(Onboarding);await flushPromises()
  w.get('wc-model-picker').element.dispatchEvent(new CustomEvent('select',{detail:'unavailable-model'}))
  await flushPromises()
  expect(w.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  await w.get('form').trigger('submit');await flushPromises()
  expect(api.post).not.toHaveBeenCalled()
  w.unmount()
 })
 it('explains the general-purpose default once' ,async()=>{
  const w=mount(Onboarding); await flushPromises()
  expect((w.text().match(/general-purpose/gi)||[]).length).toBe(1)
  w.unmount()
 })
 it('places the agent name before capabilities',async()=>{
  const w=mount(Onboarding); await flushPromises()
  const html=w.get('form').html()
  expect(html.indexOf('name="title"')).toBeLessThan(html.indexOf('wc-agent-trait-picker'))
  w.unmount()
 })
 it('starts as My Assistant with All Capabilities, Artifacts and File Manager and creates it in one click',async()=>{
  const w=mount(Onboarding); await flushPromises()
  expect(loadByTagName).toHaveBeenCalledWith('wc-model-picker',{timeoutMs:8000})
  expect(loadByTagName).toHaveBeenCalledWith('wc-agent-trait-picker',{timeoutMs:8000})
  expect((w.get('input[name="title"]').element as HTMLInputElement).value).toBe('My Assistant')
  expect(JSON.parse(w.get('wc-agent-trait-picker').attributes('value')!)).toEqual({traits:['kickside.agents.traits:trait_master','kickside.agents.traits:artifacts','kickside.uploads.traits:file_manager'],trait_contexts:{'kickside.agents.traits:trait_master':{inject_trait_catalog:true}}})
  await w.get('form').trigger('submit');await flushPromises()
  expect(api.post).toHaveBeenCalledWith('/api/v1/user-agents',{title:'My Assistant',traits:['kickside.agents.traits:trait_master','kickside.agents.traits:artifacts','kickside.uploads.traits:file_manager'],trait_contexts:{'kickside.agents.traits:trait_master':{inject_trait_catalog:true}}})
  expect(api.get).not.toHaveBeenCalledWith('/api/v1/agent-onboarding/presets')
  expect(w.find('select[name="preset"]').exists()).toBe(false)
  expect(events).toHaveBeenCalledWith('navigate',{path:'/sessions',startToken:'packed-token'})
  w.unmount()
 })
 it('applies an optional model override alongside the default capabilities',async()=>{
  const w=mount(Onboarding);await flushPromises()
  w.get('wc-model-picker').element.dispatchEvent(new CustomEvent('select',{detail:'class:balanced'}))
  await w.get('input[name="title"]').setValue('Researcher');await w.get('form').trigger('submit');await flushPromises()
  expect(api.post).toHaveBeenCalledWith('/api/v1/user-agents',{title:'Researcher',model:'class:balanced',traits:['kickside.agents.traits:trait_master','kickside.agents.traits:artifacts','kickside.uploads.traits:file_manager'],trait_contexts:{'kickside.agents.traits:trait_master':{inject_trait_catalog:true}}});w.unmount()
 })
 it('preserves an explicit capability catalog disable from the picker',async()=>{
  const w=mount(Onboarding);await flushPromises()
  w.get('wc-agent-trait-picker').element.dispatchEvent(new CustomEvent('change',{detail:{traits:['kickside.agents.traits:trait_master'],trait_contexts:{'kickside.agents.traits:trait_master':{inject_trait_catalog:false}}}}))
  await w.get('form').trigger('submit');await flushPromises()
  expect(api.post).toHaveBeenCalledWith('/api/v1/user-agents',{title:'My Assistant',traits:['kickside.agents.traits:trait_master'],trait_contexts:{'kickside.agents.traits:trait_master':{inject_trait_catalog:false}}});w.unmount()
 })
 it('accepts custom capabilities and contexts from the canonical picker',async()=>{
  const w=mount(Onboarding);await flushPromises()
  w.get('wc-agent-trait-picker').element.dispatchEvent(new CustomEvent('change',{detail:{traits:['fixture.capabilities:installed'],trait_contexts:{'fixture.capabilities:installed':{scope:['one']}}}}))
  await w.get('input[name="title"]').setValue('Custom');await w.get('form').trigger('submit');await flushPromises()
  expect(api.post).toHaveBeenCalledWith('/api/v1/user-agents',{title:'Custom',traits:['fixture.capabilities:installed'],trait_contexts:{'fixture.capabilities:installed':{scope:['one']}}});w.unmount()
 })
 it('returns to agents defaults when all selected capabilities are removed',async()=>{
  const w=mount(Onboarding);await flushPromises()
  const picker=w.get('wc-agent-trait-picker').element
  picker.dispatchEvent(new CustomEvent('change',{detail:{traits:['fixture.capabilities:installed'],trait_contexts:{}}}))
  picker.dispatchEvent(new CustomEvent('change',{detail:{traits:[],trait_contexts:{}}}))
  await w.get('input[name="title"]').setValue('General');await w.get('form').trigger('submit');await flushPromises()
  expect(api.post).toHaveBeenCalledWith('/api/v1/user-agents',{title:'General'});w.unmount()
 })
 it('does not create with an empty name and preserves creation errors',async()=>{
  const w=mount(Onboarding);await flushPromises();await w.get('input[name="title"]').setValue('  ');await w.get('form').trigger('submit');expect(api.post).not.toHaveBeenCalled()
  api.post.mockRejectedValueOnce({response:{data:{error:'Access denied'}}})
  await w.get('input[name="title"]').setValue('Helper');await w.get('form').trigger('submit');await flushPromises()
  expect(w.get('[role="alert"]').text()).toContain('Access denied');expect(events).not.toHaveBeenCalled();w.unmount()
 })
 it('retries chat lookup without creating a second agent',async()=>{
  const w=mount(Onboarding);await flushPromises();api.get.mockRejectedValueOnce(new Error('Agent lookup unavailable'))
  await w.get('input[name="title"]').setValue('Helper');await w.get('form').trigger('submit');await flushPromises()
  expect(w.get('[role="alert"]').text()).toContain('Agent lookup unavailable');expect(events).not.toHaveBeenCalled()
  await w.get('form').trigger('submit');await flushPromises();expect(api.post).toHaveBeenCalledTimes(1);expect(events).toHaveBeenCalledWith('navigate',{path:'/sessions',startToken:'packed-token'});w.unmount()
 })
 it('dismisses via the splash host and displays picker load errors',async()=>{
  loadByTagName.mockRejectedValueOnce(new Error('Picker unavailable'));const w=mount(Onboarding);await flushPromises()
  expect(w.get('[role="alert"]').text()).toContain('Picker unavailable');await w.get('button[data-dismiss]').trigger('click');expect(events).toHaveBeenCalledWith('done',{status:'skipped'});w.unmount()
 })
})

it('preserves the public factory in the served component bundle',()=>{
  initSync()
  const source=readFileSync(resolve(process.cwd(),'../static/index.js'),'utf8')
  const [,exports]=parse(source)
  expect(exports.map(value=>value.n)).toContain('webComponent')
})
