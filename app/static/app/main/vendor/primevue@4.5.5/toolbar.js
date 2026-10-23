import{s as a}from"../../assets/index-BdubFIrx.js";import{B as n}from"../../assets/index-baoEhc9I.js";import{openBlock as l,createElementBlock as s,mergeProps as e,createElementVNode as o,renderSlot as t}from"/app/app/main/vendor/vue@3.5.42/index.js";import"../../assets/index-DUH9qg1f.js";var d=`
    .p-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        padding: dt('toolbar.padding');
        background: dt('toolbar.background');
        border: 1px solid dt('toolbar.border.color');
        color: dt('toolbar.color');
        border-radius: dt('toolbar.border.radius');
        gap: dt('toolbar.gap');
    }

    .p-toolbar-start,
    .p-toolbar-center,
    .p-toolbar-end {
        display: flex;
        align-items: center;
    }
`,p={root:"p-toolbar p-component",start:"p-toolbar-start",center:"p-toolbar-center",end:"p-toolbar-end"},i=n.extend({name:"toolbar",style:d,classes:p}),b={name:"BaseToolbar",extends:a,props:{ariaLabelledby:{type:String,default:null}},style:i,provide:function(){return{$pcToolbar:this,$parentInstance:this}}},c={name:"Toolbar",extends:b,inheritAttrs:!1},m=["aria-labelledby"];function u(r,y,f,v,$,g){return l(),s("div",e({class:r.cx("root"),role:"toolbar","aria-labelledby":r.ariaLabelledby},r.ptmi("root")),[o("div",e({class:r.cx("start")},r.ptm("start")),[t(r.$slots,"start")],16),o("div",e({class:r.cx("center")},r.ptm("center")),[t(r.$slots,"center")],16),o("div",e({class:r.cx("end")},r.ptm("end")),[t(r.$slots,"end")],16)],16,m)}c.render=u;export{c as default};
