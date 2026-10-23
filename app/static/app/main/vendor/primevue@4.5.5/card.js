import{s}from"../../assets/index-BdubFIrx.js";import{B as l}from"../../assets/index-baoEhc9I.js";import{openBlock as r,createElementBlock as o,mergeProps as t,renderSlot as d,createCommentVNode as a,createElementVNode as n}from"/app/app/main/vendor/vue@3.5.42/index.js";import"../../assets/index-DUH9qg1f.js";var i=`
    .p-card {
        background: dt('card.background');
        color: dt('card.color');
        box-shadow: dt('card.shadow');
        border-radius: dt('card.border.radius');
        display: flex;
        flex-direction: column;
    }

    .p-card-caption {
        display: flex;
        flex-direction: column;
        gap: dt('card.caption.gap');
    }

    .p-card-body {
        padding: dt('card.body.padding');
        display: flex;
        flex-direction: column;
        gap: dt('card.body.gap');
    }

    .p-card-title {
        font-size: dt('card.title.font.size');
        font-weight: dt('card.title.font.weight');
    }

    .p-card-subtitle {
        color: dt('card.subtitle.color');
    }
`,p={root:"p-card p-component",header:"p-card-header",body:"p-card-body",caption:"p-card-caption",title:"p-card-title",subtitle:"p-card-subtitle",content:"p-card-content",footer:"p-card-footer"},c=l.extend({name:"card",style:i,classes:p}),m={name:"BaseCard",extends:s,style:c,provide:function(){return{$pcCard:this,$parentInstance:this}}},u={name:"Card",extends:m,inheritAttrs:!1};function f(e,b,y,$,v,h){return r(),o("div",t({class:e.cx("root")},e.ptmi("root")),[e.$slots.header?(r(),o("div",t({key:0,class:e.cx("header")},e.ptm("header")),[d(e.$slots,"header")],16)):a("",!0),n("div",t({class:e.cx("body")},e.ptm("body")),[e.$slots.title||e.$slots.subtitle?(r(),o("div",t({key:0,class:e.cx("caption")},e.ptm("caption")),[e.$slots.title?(r(),o("div",t({key:0,class:e.cx("title")},e.ptm("title")),[d(e.$slots,"title")],16)):a("",!0),e.$slots.subtitle?(r(),o("div",t({key:1,class:e.cx("subtitle")},e.ptm("subtitle")),[d(e.$slots,"subtitle")],16)):a("",!0)],16)):a("",!0),n("div",t({class:e.cx("content")},e.ptm("content")),[d(e.$slots,"content")],16),e.$slots.footer?(r(),o("div",t({key:1,class:e.cx("footer")},e.ptm("footer")),[d(e.$slots,"footer")],16)):a("",!0)],16)],16)}u.render=f;export{u as default};
