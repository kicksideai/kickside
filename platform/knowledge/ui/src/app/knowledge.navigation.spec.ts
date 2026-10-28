// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import {it,expect,vi} from 'vitest'
import {computed,ref,effectScope} from 'vue'
vi.mock('@wippy-fe/proxy',()=>({api:{},loadByTagName:vi.fn()}))
vi.mock('@widgets/app/componentRealtime',()=>({subscribeComponentMeta:vi.fn()}))
import {useKnowledgeDetail} from './useKnowledgeDetail'
it('uses native Back within a knowledge base and returns direct links to their base',()=>{
 const navigate=vi.fn(),scope=effectScope()
 const detail=ref({id:'library',kb_type:'files'})
 const controller=scope.run(()=>useKnowledgeDetail({detail,detailUnsub:ref(null),kbs:ref([]),engines:ref([]),engineFor:()=>undefined,applyComponentMetaEvent:vi.fn(),route:computed(()=> 'library/files/document'),navigate,loadEngines:vi.fn()}))!
 controller.innerRoute.value='files/document'
 history.replaceState({back:'/knowledge/library/review'},'')
 const back=vi.spyOn(history,'back').mockImplementation(()=>{})
 controller.backDetail()
 expect(back).toHaveBeenCalledOnce()
 expect(navigate).not.toHaveBeenCalled()
 history.replaceState({back:'/uploads'},'')
 controller.backDetail()
 expect(navigate).toHaveBeenLastCalledWith('library')
 controller.innerRoute.value=''
 controller.backDetail()
 expect(navigate).toHaveBeenLastCalledWith('')
 back.mockRestore();scope.stop()
})
