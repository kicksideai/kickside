import{s as f}from"../../assets/index-9LTxh96p.js";import{s as b}from"../../assets/index-BRIBt8_1.js";import y from"/app/app/main/vendor/primevue@4.5.5/button.js";import{R as v}from"../../assets/index-DfuZ80BP.js";import{s as B}from"../../assets/index-BdubFIrx.js";import{B as w}from"../../assets/index-baoEhc9I.js";import{resolveComponent as k,openBlock as p,createElementBlock as s,mergeProps as t,createElementVNode as d,renderSlot as r,normalizeClass as P,toDisplayString as C,createCommentVNode as c,createVNode as g,withCtx as h,createBlock as $,resolveDynamicComponent as D,Transition as A,withDirectives as S,vShow as E}from"/app/app/main/vendor/vue@3.5.42/index.js";import{f as I}from"../../assets/index-ZhWAdK_X.js";import"../../assets/index-DDXdxOiJ.js";import"../../assets/index-DUH9qg1f.js";import"../../assets/index-C9Ot20_D.js";var K=`
    .p-panel {
        display: block;
        border: 1px solid dt('panel.border.color');
        border-radius: dt('panel.border.radius');
        background: dt('panel.background');
        color: dt('panel.color');
    }

    .p-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: dt('panel.header.padding');
        background: dt('panel.header.background');
        color: dt('panel.header.color');
        border-style: solid;
        border-width: dt('panel.header.border.width');
        border-color: dt('panel.header.border.color');
        border-radius: dt('panel.header.border.radius');
    }

    .p-panel-toggleable .p-panel-header {
        padding: dt('panel.toggleable.header.padding');
    }

    .p-panel-title {
        line-height: 1;
        font-weight: dt('panel.title.font.weight');
    }

    .p-panel-content-container {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-panel-content-wrapper {
        min-height: 0;
    }

    .p-panel-content {
        padding: dt('panel.content.padding');
    }

    .p-panel-footer {
        padding: dt('panel.footer.padding');
    }
`,L={root:function(n){var u=n.props;return["p-panel p-component",{"p-panel-toggleable":u.toggleable}]},header:"p-panel-header",title:"p-panel-title",headerActions:"p-panel-header-actions",pcToggleButton:"p-panel-toggle-button",contentContainer:"p-panel-content-container",contentWrapper:"p-panel-content-wrapper",content:"p-panel-content",footer:"p-panel-footer"},T=w.extend({name:"panel",style:K,classes:L}),N={name:"BasePanel",extends:B,props:{header:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}}},style:T,provide:function(){return{$pcPanel:this,$parentInstance:this}}},V={name:"Panel",extends:N,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{d_collapsed:this.collapsed}},watch:{collapsed:function(n){this.d_collapsed=n}},methods:{toggle:function(n){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:n,value:this.d_collapsed})},onKeyDown:function(n){(n.code==="Enter"||n.code==="NumpadEnter"||n.code==="Space")&&(this.toggle(n),n.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.header},dataP:function(){return I({toggleable:this.toggleable})}},components:{PlusIcon:b,MinusIcon:f,Button:y},directives:{ripple:v}},W=["data-p"],j=["data-p"],M=["id"],R=["id","aria-labelledby"];function z(e,n,u,O,l,o){var m=k("Button");return p(),s("div",t({class:e.cx("root"),"data-p":o.dataP},e.ptmi("root")),[d("div",t({class:e.cx("header"),"data-p":o.dataP},e.ptm("header")),[r(e.$slots,"header",{id:e.$id+"_header",class:P(e.cx("title")),collapsed:l.d_collapsed},function(){return[e.header?(p(),s("span",t({key:0,id:e.$id+"_header",class:e.cx("title")},e.ptm("title")),C(e.header),17,M)):c("",!0)]}),d("div",t({class:e.cx("headerActions")},e.ptm("headerActions")),[r(e.$slots,"icons"),e.toggleable?r(e.$slots,"togglebutton",{key:0,collapsed:l.d_collapsed,toggleCallback:function(i){return o.toggle(i)},keydownCallback:function(i){return o.onKeyDown(i)}},function(){return[g(m,t({id:e.$id+"_header",class:e.cx("pcToggleButton"),"aria-label":o.buttonAriaLabel,"aria-controls":e.$id+"_content","aria-expanded":!l.d_collapsed,unstyled:e.unstyled,onClick:n[0]||(n[0]=function(a){return o.toggle(a)}),onKeydown:n[1]||(n[1]=function(a){return o.onKeyDown(a)})},e.toggleButtonProps,{pt:e.ptm("pcToggleButton")}),{icon:h(function(a){return[r(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:l.d_collapsed},function(){return[(p(),$(D(l.d_collapsed?"PlusIcon":"MinusIcon"),t({class:a.class},e.ptm("pcToggleButton").icon),null,16,["class"]))]})]}),_:3},16,["id","class","aria-label","aria-controls","aria-expanded","unstyled","pt"])]}):c("",!0)],16)],16,j),g(A,t({name:"p-collapsible"},e.ptm("transition")),{default:h(function(){return[S(d("div",t({id:e.$id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":e.$id+"_header"},e.ptm("contentContainer")),[d("div",t({class:e.cx("contentWrapper")},e.ptm("contentWrapper")),[d("div",t({class:e.cx("content")},e.ptm("content")),[r(e.$slots,"default")],16),e.$slots.footer?(p(),s("div",t({key:0,class:e.cx("footer")},e.ptm("footer")),[r(e.$slots,"footer")],16)):c("",!0)],16)],16,R),[[E,!l.d_collapsed]])]}),_:3},16)],16,W)}V.render=z;export{V as default};
