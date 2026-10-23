import{mergeProps as u,resolveDirective as rt,withDirectives as j,openBlock as o,createBlock as h,resolveDynamicComponent as E,withCtx as I,renderSlot as K,normalizeClass as yt,createElementBlock as v,createCommentVNode as z,createElementVNode as b,defineComponent as kt,shallowRef as W,computed as T,watch as H,onMounted as wt,onUnmounted as Tt,createVNode as B,unref as p,Fragment as tt,renderList as et,createTextVNode as nt,toDisplayString as U,KeepAlive as Bt,defineAsyncComponent as xt}from"/app/app/main/vendor/vue@3.5.42/index.js";import{useRoute as $t,useRouter as Lt}from"/app/app/main/vendor/vue-router@4.6.4/index.js";import{Icon as N}from"/app/app/main/vendor/@iconify/vue@5.0.1/index.js";import{b as _t,Q as A,z as R,R as M,T as Ct,C as St,K as O,v as Pt,V as at}from"./index-DUH9qg1f.js";import{B as G,k as Nt}from"./index-baoEhc9I.js";import{R as it}from"./index-DfuZ80BP.js";import{s as Q}from"./index-BdubFIrx.js";import{f as ot}from"./index-ZhWAdK_X.js";import{s as At}from"./index-DN-tYhB1.js";import{s as Ot}from"./index-BspojqFd.js";import{u as It,a as Et,b as Kt,c as zt,n as Rt,W as Vt,h as Dt,l as Ft,d as Wt,_ as Ht}from"../app.js";import"./index-C9Ot20_D.js";import"./index-DDXdxOiJ.js";import"/app/app/main/vendor/pinia@2.3.1/index.js";import"/app/app/main/vendor/primevue@4.5.5/config.js";import"./index-Diis60gH.js";import"/app/app/main/vendor/@wippy-fe/proxy@0.0.60/index.js";import"/app/app/main/vendor/nanoevents@9.1.0/index.js";import"/app/app/main/vendor/primevue@4.5.5/avatar.js";var Ut={root:function(t){var s=t.instance,a=t.props;return["p-tab",{"p-tab-active":s.active,"p-disabled":a.disabled}]}},Mt=G.extend({name:"tab",classes:Ut}),jt={name:"BaseTab",extends:Q,props:{value:{type:[String,Number],default:void 0},disabled:{type:Boolean,default:!1},as:{type:[String,Object],default:"BUTTON"},asChild:{type:Boolean,default:!1}},style:Mt,provide:function(){return{$pcTab:this,$parentInstance:this}}},lt={name:"Tab",extends:jt,inheritAttrs:!1,inject:["$pcTabs","$pcTabList"],methods:{onFocus:function(){this.$pcTabs.selectOnFocus&&this.changeActiveValue()},onClick:function(){this.changeActiveValue()},onKeydown:function(t){switch(t.code){case"ArrowRight":this.onArrowRightKey(t);break;case"ArrowLeft":this.onArrowLeftKey(t);break;case"Home":this.onHomeKey(t);break;case"End":this.onEndKey(t);break;case"PageDown":this.onPageDownKey(t);break;case"PageUp":this.onPageUpKey(t);break;case"Enter":case"NumpadEnter":case"Space":this.onEnterKey(t);break}},onArrowRightKey:function(t){var s=this.findNextTab(t.currentTarget);s?this.changeFocusedTab(t,s):this.onHomeKey(t),t.preventDefault()},onArrowLeftKey:function(t){var s=this.findPrevTab(t.currentTarget);s?this.changeFocusedTab(t,s):this.onEndKey(t),t.preventDefault()},onHomeKey:function(t){var s=this.findFirstTab();this.changeFocusedTab(t,s),t.preventDefault()},onEndKey:function(t){var s=this.findLastTab();this.changeFocusedTab(t,s),t.preventDefault()},onPageDownKey:function(t){this.scrollInView(this.findLastTab()),t.preventDefault()},onPageUpKey:function(t){this.scrollInView(this.findFirstTab()),t.preventDefault()},onEnterKey:function(t){this.changeActiveValue()},findNextTab:function(t){var s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,a=s?t:t.nextElementSibling;return a?A(a,"data-p-disabled")||A(a,"data-pc-section")==="activebar"?this.findNextTab(a):R(a,'[data-pc-name="tab"]'):null},findPrevTab:function(t){var s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,a=s?t:t.previousElementSibling;return a?A(a,"data-p-disabled")||A(a,"data-pc-section")==="activebar"?this.findPrevTab(a):R(a,'[data-pc-name="tab"]'):null},findFirstTab:function(){return this.findNextTab(this.$pcTabList.$refs.tabs.firstElementChild,!0)},findLastTab:function(){return this.findPrevTab(this.$pcTabList.$refs.tabs.lastElementChild,!0)},changeActiveValue:function(){this.$pcTabs.updateValue(this.value)},changeFocusedTab:function(t,s){_t(s),this.scrollInView(s)},scrollInView:function(t){var s;t==null||(s=t.scrollIntoView)===null||s===void 0||s.call(t,{block:"nearest"})}},computed:{active:function(){var t;return Nt((t=this.$pcTabs)===null||t===void 0?void 0:t.d_value,this.value)},id:function(){var t;return"".concat((t=this.$pcTabs)===null||t===void 0?void 0:t.$id,"_tab_").concat(this.value)},ariaControls:function(){var t;return"".concat((t=this.$pcTabs)===null||t===void 0?void 0:t.$id,"_tabpanel_").concat(this.value)},attrs:function(){return u(this.asAttrs,this.a11yAttrs,this.ptmi("root",this.ptParams))},asAttrs:function(){return this.as==="BUTTON"?{type:"button",disabled:this.disabled}:void 0},a11yAttrs:function(){return{id:this.id,tabindex:this.active?this.$pcTabs.tabindex:-1,role:"tab","aria-selected":this.active,"aria-controls":this.ariaControls,"data-pc-name":"tab","data-p-disabled":this.disabled,"data-p-active":this.active,onFocus:this.onFocus,onKeydown:this.onKeydown}},ptParams:function(){return{context:{active:this.active}}},dataP:function(){return ot({active:this.active})}},directives:{ripple:it}};function Gt(e,t,s,a,i,r){var c=rt("ripple");return e.asChild?K(e.$slots,"default",{key:1,dataP:r.dataP,class:yt(e.cx("root")),active:r.active,a11yAttrs:r.a11yAttrs,onClick:r.onClick}):j((o(),h(E(e.as),u({key:0,class:e.cx("root"),"data-p":r.dataP,onClick:r.onClick},r.attrs),{default:I(function(){return[K(e.$slots,"default")]}),_:3},16,["class","data-p","onClick"])),[[c]])}lt.render=Gt;var Qt={root:"p-tablist",content:"p-tablist-content p-tablist-viewport",tabList:"p-tablist-tab-list",activeBar:"p-tablist-active-bar",prevButton:"p-tablist-prev-button p-tablist-nav-button",nextButton:"p-tablist-next-button p-tablist-nav-button"},Yt=G.extend({name:"tablist",classes:Qt}),qt={name:"BaseTabList",extends:Q,props:{},style:Yt,provide:function(){return{$pcTabList:this,$parentInstance:this}}},ct={name:"TabList",extends:qt,inheritAttrs:!1,inject:["$pcTabs"],data:function(){return{isPrevButtonEnabled:!1,isNextButtonEnabled:!0}},resizeObserver:void 0,inkBarObserver:void 0,watch:{showNavigators:function(t){t?this.bindResizeObserver():this.unbindResizeObserver()},activeValue:{flush:"post",handler:function(){this.updateInkBar(),this.bindInkBarObserver()}}},mounted:function(){var t=this;setTimeout(function(){t.updateInkBar(),t.bindInkBarObserver()},150),this.showNavigators&&(this.updateButtonState(),this.bindResizeObserver())},updated:function(){this.showNavigators&&this.updateButtonState()},beforeUnmount:function(){this.unbindResizeObserver(),this.unbindInkBarObserver()},methods:{onScroll:function(t){this.showNavigators&&this.updateButtonState(),t.preventDefault()},onPrevButtonClick:function(){var t=this.$refs.content,s=this.getVisibleButtonWidths(),a=M(t)-s,i=Math.abs(t.scrollLeft),r=a*.8,c=i-r,f=Math.max(c,0);t.scrollLeft=at(t)?-1*f:f},onNextButtonClick:function(){var t=this.$refs.content,s=this.getVisibleButtonWidths(),a=M(t)-s,i=Math.abs(t.scrollLeft),r=a*.8,c=i+r,f=t.scrollWidth-a,m=Math.min(c,f);t.scrollLeft=at(t)?-1*m:m},bindResizeObserver:function(){var t=this;this.resizeObserver=new ResizeObserver(function(){return t.updateButtonState()}),this.resizeObserver.observe(this.$refs.list)},unbindResizeObserver:function(){var t;(t=this.resizeObserver)===null||t===void 0||t.unobserve(this.$refs.list),this.resizeObserver=void 0},bindInkBarObserver:function(){var t=this;this.unbindInkBarObserver();var s=this.$refs.content,a=R(s,'[data-pc-name="tab"][data-p-active="true"]');a&&(this.inkBarObserver=new ResizeObserver(function(){return t.updateInkBar()}),this.inkBarObserver.observe(a))},unbindInkBarObserver:function(){var t;(t=this.inkBarObserver)===null||t===void 0||t.disconnect(),this.inkBarObserver=void 0},updateInkBar:function(){var t=this.$refs,s=t.content,a=t.inkbar,i=t.tabs;if(a){var r=R(s,'[data-pc-name="tab"][data-p-active="true"]');this.$pcTabs.isVertical()?(a.style.height=St(r)+"px",a.style.top=O(r).top-O(i).top+"px"):(a.style.width=Pt(r)+"px",a.style.left=O(r).left-O(i).left+"px")}},updateButtonState:function(){var t=this.$refs,s=t.list,a=t.content,i=a.scrollTop,r=a.scrollWidth,c=a.scrollHeight,f=a.offsetWidth,m=a.offsetHeight,x=Math.abs(a.scrollLeft),$=[M(a),Ct(a)],L=$[0],V=$[1];this.$pcTabs.isVertical()?(this.isPrevButtonEnabled=i!==0,this.isNextButtonEnabled=s.offsetHeight>=m&&parseInt(i)!==c-V):(this.isPrevButtonEnabled=x!==0,this.isNextButtonEnabled=s.offsetWidth>=f&&parseInt(x)!==r-L)},getVisibleButtonWidths:function(){var t=this.$refs,s=t.prevButton,a=t.nextButton,i=0;return this.showNavigators&&(i=(s?.offsetWidth||0)+(a?.offsetWidth||0)),i}},computed:{templates:function(){return this.$pcTabs.$slots},activeValue:function(){return this.$pcTabs.d_value},showNavigators:function(){return this.$pcTabs.showNavigators},prevButtonAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.previous:void 0},nextButtonAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.next:void 0},dataP:function(){return ot({scrollable:this.$pcTabs.scrollable})}},components:{ChevronLeftIcon:At,ChevronRightIcon:Ot},directives:{ripple:it}},Jt=["data-p"],Xt=["aria-label","tabindex"],Zt=["data-p"],te=["aria-orientation"],ee=["aria-label","tabindex"];function ne(e,t,s,a,i,r){var c=rt("ripple");return o(),v("div",u({ref:"list",class:e.cx("root"),"data-p":r.dataP},e.ptmi("root")),[r.showNavigators&&i.isPrevButtonEnabled?j((o(),v("button",u({key:0,ref:"prevButton",type:"button",class:e.cx("prevButton"),"aria-label":r.prevButtonAriaLabel,tabindex:r.$pcTabs.tabindex,onClick:t[0]||(t[0]=function(){return r.onPrevButtonClick&&r.onPrevButtonClick.apply(r,arguments)})},e.ptm("prevButton"),{"data-pc-group-section":"navigator"}),[(o(),h(E(r.templates.previcon||"ChevronLeftIcon"),u({"aria-hidden":"true"},e.ptm("prevIcon")),null,16))],16,Xt)),[[c]]):z("",!0),b("div",u({ref:"content",class:e.cx("content"),onScroll:t[1]||(t[1]=function(){return r.onScroll&&r.onScroll.apply(r,arguments)}),"data-p":r.dataP},e.ptm("content")),[b("div",u({ref:"tabs",class:e.cx("tabList"),role:"tablist","aria-orientation":r.$pcTabs.orientation||"horizontal"},e.ptm("tabList")),[K(e.$slots,"default"),b("span",u({ref:"inkbar",class:e.cx("activeBar"),role:"presentation","aria-hidden":"true"},e.ptm("activeBar")),null,16)],16,te)],16,Zt),r.showNavigators&&i.isNextButtonEnabled?j((o(),v("button",u({key:1,ref:"nextButton",type:"button",class:e.cx("nextButton"),"aria-label":r.nextButtonAriaLabel,tabindex:r.$pcTabs.tabindex,onClick:t[2]||(t[2]=function(){return r.onNextButtonClick&&r.onNextButtonClick.apply(r,arguments)})},e.ptm("nextButton"),{"data-pc-group-section":"navigator"}),[(o(),h(E(r.templates.nexticon||"ChevronRightIcon"),u({"aria-hidden":"true"},e.ptm("nextIcon")),null,16))],16,ee)),[[c]]):z("",!0)],16,Jt)}ct.render=ne;var ae=`
    .p-tabs {
        display: flex;
        flex-direction: column;
    }

    .p-tablist {
        display: flex;
        position: relative;
        overflow: hidden;
        background: dt('tabs.tablist.background');
    }

    .p-tablist-viewport {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        scrollbar-width: none;
        overscroll-behavior: contain auto;
    }

    .p-tablist-viewport::-webkit-scrollbar {
        display: none;
    }

    .p-tablist-tab-list {
        position: relative;
        display: flex;
        border-style: solid;
        border-color: dt('tabs.tablist.border.color');
        border-width: dt('tabs.tablist.border.width');
    }

    .p-tablist-content {
        flex-grow: 1;
    }

    .p-tablist-nav-button {
        all: unset;
        position: absolute !important;
        flex-shrink: 0;
        inset-block-start: 0;
        z-index: 2;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: dt('tabs.nav.button.background');
        color: dt('tabs.nav.button.color');
        width: dt('tabs.nav.button.width');
        transition:
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        box-shadow: dt('tabs.nav.button.shadow');
        outline-color: transparent;
        cursor: pointer;
    }

    .p-tablist-nav-button:focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.nav.button.focus.ring.shadow');
        outline: dt('tabs.nav.button.focus.ring.width') dt('tabs.nav.button.focus.ring.style') dt('tabs.nav.button.focus.ring.color');
        outline-offset: dt('tabs.nav.button.focus.ring.offset');
    }

    .p-tablist-nav-button:hover {
        color: dt('tabs.nav.button.hover.color');
    }

    .p-tablist-prev-button {
        inset-inline-start: 0;
    }

    .p-tablist-next-button {
        inset-inline-end: 0;
    }

    .p-tablist-prev-button:dir(rtl),
    .p-tablist-next-button:dir(rtl) {
        transform: rotate(180deg);
    }

    .p-tab {
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        position: relative;
        border-style: solid;
        white-space: nowrap;
        gap: dt('tabs.tab.gap');
        background: dt('tabs.tab.background');
        border-width: dt('tabs.tab.border.width');
        border-color: dt('tabs.tab.border.color');
        color: dt('tabs.tab.color');
        padding: dt('tabs.tab.padding');
        font-weight: dt('tabs.tab.font.weight');
        transition:
            background dt('tabs.transition.duration'),
            border-color dt('tabs.transition.duration'),
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        margin: dt('tabs.tab.margin');
        outline-color: transparent;
    }

    .p-tab:not(.p-disabled):focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.tab.focus.ring.shadow');
        outline: dt('tabs.tab.focus.ring.width') dt('tabs.tab.focus.ring.style') dt('tabs.tab.focus.ring.color');
        outline-offset: dt('tabs.tab.focus.ring.offset');
    }

    .p-tab:not(.p-tab-active):not(.p-disabled):hover {
        background: dt('tabs.tab.hover.background');
        border-color: dt('tabs.tab.hover.border.color');
        color: dt('tabs.tab.hover.color');
    }

    .p-tab-active {
        background: dt('tabs.tab.active.background');
        border-color: dt('tabs.tab.active.border.color');
        color: dt('tabs.tab.active.color');
    }

    .p-tabpanels {
        background: dt('tabs.tabpanel.background');
        color: dt('tabs.tabpanel.color');
        padding: dt('tabs.tabpanel.padding');
        outline: 0 none;
    }

    .p-tabpanel:focus-visible {
        box-shadow: dt('tabs.tabpanel.focus.ring.shadow');
        outline: dt('tabs.tabpanel.focus.ring.width') dt('tabs.tabpanel.focus.ring.style') dt('tabs.tabpanel.focus.ring.color');
        outline-offset: dt('tabs.tabpanel.focus.ring.offset');
    }

    .p-tablist-active-bar {
        z-index: 1;
        display: block;
        position: absolute;
        inset-block-end: dt('tabs.active.bar.bottom');
        height: dt('tabs.active.bar.height');
        background: dt('tabs.active.bar.background');
        transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
    }
`,se={root:function(t){var s=t.props;return["p-tabs p-component",{"p-tabs-scrollable":s.scrollable}]}},re=G.extend({name:"tabs",style:ae,classes:se}),ie={name:"BaseTabs",extends:Q,props:{value:{type:[String,Number],default:void 0},lazy:{type:Boolean,default:!1},scrollable:{type:Boolean,default:!1},showNavigators:{type:Boolean,default:!0},tabindex:{type:Number,default:0},selectOnFocus:{type:Boolean,default:!1}},style:re,provide:function(){return{$pcTabs:this,$parentInstance:this}}},dt={name:"Tabs",extends:ie,inheritAttrs:!1,emits:["update:value"],data:function(){return{d_value:this.value}},watch:{value:function(t){this.d_value=t}},methods:{updateValue:function(t){this.d_value!==t&&(this.d_value=t,this.$emit("update:value",t))},isVertical:function(){return this.orientation==="vertical"}}};function oe(e,t,s,a,i,r){return o(),v("div",u({class:e.cx("root")},e.ptmi("root")),[K(e.$slots,"default")],16)}dt.render=oe;const le={class:"system-page"},ce={class:"system-chrome"},de={class:"system-chrome-inner"},ue={class:"page-head system-head"},be={class:"page-head-icon"},ve={key:0,class:"system-head-links"},pe=["href","onClick"],fe={class:"system-viewport"},he={key:0,class:"p-6 text-sm",style:{color:"var(--p-danger-500)"}},st="kickside:registry-changed",me=kt({__name:"system",setup(e){const t=/^(\/[\w/.:~-]*|https?:\/\/[\w/.:~?&=#%-]+)$/;function s(n){return typeof n=="string"&&n.length<=200&&t.test(n)}const a={},i=/^[a-z][a-z0-9]*-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;function r(n){return typeof n=="string"&&n.length<=80&&i.test(n)}function c(n){return n.render==="surface"?n.surface&&Dt(n.surface)?xt(()=>Ft(n.surface)):null:a[n.render]??null}function f(n){return n.render==="link"?s(n.url):n.render==="component"?r(n.component_tag):!!c(n)}const m=It(),x=Et(),$=Kt(),L=$t(),V=Lt(),g=W([]),y=W(""),_=W(""),{schedule:k,clear:ut}=Wt(()=>{P()}),Y=T(()=>g.value.filter(n=>n.render==="link")),S=T(()=>g.value.filter(n=>n.render!=="link"));function bt(n,d){if(n.defaultPrevented||n.button!==0||n.metaKey||n.ctrlKey||n.shiftKey||n.altKey)return;const l=x.classifyLink(d);l.kind==="host-nav"&&(n.preventDefault(),x.navigate(l.normalizedPath??l.href))}const w=T(()=>S.value.find(n=>n.key===y.value)||null),D=T(()=>w.value?.render==="component"&&r(w.value.component_tag)?w.value.component_tag:""),q=T(()=>w.value&&w.value.render!=="component"?c(w.value):null);function vt(n){n!==y.value&&(y.value=n,V.replace(`/system/${n}`))}function J(){const n=String(L.params.tab||"");y.value=S.value.some(d=>d.key===n)?n:S.value[0]?.key??""}function pt(n){const d=n?.response?.status;return d===401||d===403?"System is not available for this account.":"System sections could not be loaded."}H(()=>L.params.tab,()=>{g.value.length&&J()}),H($,(n,d)=>{n&&d===!1&&P()});let C=null,F=!1;const{navItems:ft,loaded:X,loadNav:ht}=zt(),Z=T(()=>ft.value.some(n=>Rt(n.path||"/")==="/system"));async function mt(){if(X.value){if(!Z.value){_.value="System is not available for this account.",g.value=[];return}try{const{data:n}=await m.get("/api/v1/settings/tabs");n?.success&&(g.value=n.tabs.filter(f),_.value="",J())}catch(n){_.value=pt(n),g.value=[]}}}function P(){return C?(F=!0,C):(C=(async()=>{do F=!1,await mt();while(F)})().finally(()=>{C=null}),C)}return H([X,Z],()=>{P()}),wt(()=>{ht(),P(),window.addEventListener("kickside:nav-changed",k),window.addEventListener("kickside:modules-changed",k),window.addEventListener(st,k)}),Tt(()=>{ut(),window.removeEventListener("kickside:nav-changed",k),window.removeEventListener("kickside:modules-changed",k),window.removeEventListener(st,k)}),(n,d)=>(o(),v("div",le,[b("div",ce,[b("div",de,[b("div",ue,[b("div",be,[B(p(N),{icon:"tabler:settings","aria-hidden":"true"})]),d[1]||(d[1]=b("div",{class:"page-head-text"},[b("h1",{class:"page-title"},"System"),b("p",{class:"page-sub"},"Users, modules, and configuration.")],-1)),Y.value.length?(o(),v("div",ve,[(o(!0),v(tt,null,et(Y.value,l=>(o(),v("a",{key:l.key,href:l.url,onClick:gt=>bt(gt,l.url),class:"system-head-link"},[B(p(N),{icon:l.icon,class:"w-4 h-4","aria-hidden":"true"},null,8,["icon"]),nt(" "+U(l.label)+" ",1),B(p(N),{icon:"tabler:external-link",class:"w-3.5 h-3.5 opacity-60","aria-hidden":"true"})],8,pe))),128))])):z("",!0)]),B(p(dt),{class:"system-tabs","data-kx-separator":"surface",value:y.value,"onUpdate:value":d[0]||(d[0]=l=>vt(String(l)))},{default:I(()=>[B(p(ct),{"aria-label":"System sections"},{default:I(()=>[(o(!0),v(tt,null,et(S.value,l=>(o(),h(p(lt),{key:l.key,value:l.key},{default:I(()=>[B(p(N),{icon:l.icon,"aria-hidden":"true"},null,8,["icon"]),nt(" "+U(l.label),1)]),_:2},1032,["value"]))),128))]),_:1})]),_:1},8,["value"])])]),b("div",fe,[_.value?(o(),v("div",he,U(_.value),1)):D.value?(o(),h(Vt,{tag:D.value,path:p(L).path,visible:p($),key:D.value},null,8,["tag","path","visible"])):(o(),h(Bt,{key:2},[q.value?(o(),h(E(q.value),{key:y.value,embedded:""})):z("",!0)],1024))])]))}}),ze=Ht(me,[["__scopeId","data-v-fc755a07"]]);export{ze as default};
