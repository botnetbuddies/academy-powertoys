registerFeature({
  id: "theme-mode",
  label: "Theme (Might have small issues)",
  description: "Switch between Default (dark) or Light",
  scope: "global",
  default: false,
  settings: {
    mode: "default", // 'default' | 'light' | 'print'(disabled for now)
  },
  settingsUI: {
    type: "select",
    key: "mode",
    disableValue: "default",
    options: [
      { value: "default", label: "Default (Dark)" },
      { value: "light", label: "Light" },
      // { value: "print", label: "Print" },
    ],
  },
  cleanup() {
    document.getElementById("apt-theme-mode")?.remove();
  },
  run(cfg) {
    const mode = cfg.mode || "default";
    if (mode === "default") return;

    const styleId = "apt-theme-mode";
    const existing = document.getElementById(styleId);
    if (existing) existing.remove();

    const style = document.createElement("style");
    style.id = styleId;

    if (mode === "light") {
      style.textContent = `
          /* ── Light Theme (Grey-Blue) ── */

          /* Main backgrounds — grey-blue tones */
          .bg-neutral-1100 { background-color: #dce4ed !important; }
          .bg-neutral-1000 { background-color: #e4eaf1 !important; }
          .bg-neutral-900  { background-color: #d5dde8 !important; }
          .bg-neutral-800  { background-color: #cbd5e1 !important; }
          .bg-neutral-700  { background-color: #b8c4d3 !important; }
          .bg-neutral-600  { background-color: #a8b5c7 !important; }
          .bg-neutral-500  { background-color: #97a7bb !important; }
          .bg-neutral-400  { background-color: #8898ae !important; }

          /* Text colors */
          .text-primary   { color: #1a1a2e !important; }
          .text-secondary { color: #4a4a6a !important; }
          .text-accent    { color: #1f7a0a !important; }
          .text-disabled  { color: #7a8599 !important; }

          /* Accent / brand green — darken for legibility on light bg */
          .bg-accent  { background-color: #1f7a0a !important; }
          .bg-primary { background-color: #1f7a0a !important; }
          .fill-primary { fill: #1f7a0a !important; }
          .text-primary.font-bold a,
          a.text-primary { color: #1a1a2e !important; }

          /* Cards, panels */
          .base-card, .base-row { background-color: #eef2f7 !important; }
          .collapse { background-color: #e0e7ef !important; }
          [class*="htb-layer-01"] { background-color: #eef2f7 !important; }

          /* Borders */
          .border-neutral-600,
          .border-neutral-500,
          .border-b-neutral-600,
          .border-secondary-disabled { border-color: #b8c4d3 !important; }
          [class*="ring-neutral-900"] { --tw-ring-color: rgba(184,196,211,0.3) !important; }

          /* Nav bar */
          header, nav { background-color: #eef2f7 !important; border-color: #b8c4d3 !important; }

          /* Sidebar menu */
          .bg-neutral-800 .base-row,
          .bg-neutral-800 { background-color: #dce4ed !important; }
          .base-row:hover, .hover\\:bg-neutral-500:hover { background-color: #cdd7e3 !important; }
          .hover\\:bg-neutral-100\\/15:hover { background-color: rgba(26,26,46,0.08) !important; }
          .base-row.bg-neutral-600 { background-color: #c5deb8 !important; }

          /* Article / content area */
          article, article p, article li { color: #1a1a2e !important; }
          article h1, article h2, article h3, article h4 { color: #111 !important; }

          /* Code blocks */
          article code.text-blue-250 { color: #1f7a0a !important; }
          pre, .shiki { background-color: #2b2b3b !important; }

          /* Footer nav */
          main.h-full > footer { background-color: #d5dde8 !important; }

          /* Progress bars */
          progress { accent-color: #1f7a0a; }

          /* Scrollbar */
          ::-webkit-scrollbar-track { background: #dce4ed !important; }
          ::-webkit-scrollbar-thumb { background: #a8b5c7 !important; }

          /* Inputs, toggles */
          .toggle { border-color: #a8b5c7 !important; background-color: #a8b5c7 !important; }
          .toggle:checked { background-color: #1f7a0a !important; border-color: #1f7a0a !important; }

          /* Tab panels (dashboard) */
          .tab-wrapper { color: #4a4a6a !important; }
          .tab-wrapper:hover { background-color: #cdd7e3 !important; }
          .tab-indicator.bg-accent { background-color: #1f7a0a !important; }

          /* Dashboard — carousel & module cards */
          .carousel-title { color: #1a1a2e !important; }
          .module-card-footer { border-color: #b8c4d3 !important; background-color: transparent !important; }
          .module-card-footer:hover,
          .group:hover .module-card-footer { background-color: #cdd7e3 !important; }
          .card-square-container { background-color: #eef2f7 !important; }

          /* Dashboard — streak card */
          .streak-progress-bar { background-color: #cbd5e1 !important; }

          /* Dashboard — htb buttons */
          .htb-button--primary { background-color: #1f7a0a !important; color: #fff !important; }
          .htb-divider--bg { border-color: #b8c4d3 !important; }

          /* Dashboard — user profile card */
          .font-mono { color: #1a1a2e !important; }

          /* Questions area */
          .bg-neutral-100\\/10 { background-color: rgba(26,26,46,0.05) !important; }

          /* Tooltips */
          [class*="tooltip"]::before { background-color: #2b3040 !important; color: #e0e0e0 !important; }

          /* Keep settings panel dark — explicit colors to override theme */
          #apt-settings-overlay { background: rgba(0,0,0,0.6) !important; }
          #apt-settings-panel { background: #1a1a2e !important; color: #e0e0e0 !important; border-color: #2a2a4a !important; }
          #apt-settings-panel .apt-header { background: #1a1a2e !important; color: #e0e0e0 !important; }
          #apt-settings-panel .apt-footer { background: #1a1a2e !important; color: #e0e0e0 !important; }
          #apt-settings-panel .apt-feature-label { color: #e0e0e0 !important; }
          #apt-settings-panel .apt-feature-desc { color: #888 !important; }
          #apt-settings-panel .apt-scope-title { color: #9fef00 !important; }
          #apt-settings-panel .apt-feature-row:hover { background: #22223a !important; }
          #apt-settings-panel .apt-select { background: #22223a !important; color: #e0e0e0 !important; border-color: #3a3a5a !important; }


          :root{
  --color-neutral-400: #b8c4d3;
  --color-neutral-600: #d7f5d3;
  --color-neutral-700: lightgreen ;
  --color-neutral-850: #e4eaf1;

}

.htb-square-button--ghost-icon-secondary:hover{
  background-color: var(--color-neutral-400);
  color:black !important;;
  fill: black !important;
}

.htb-square-button--ghost-icon-secondary--selected{
  background-color: lightgreen;
  color: black;
}

.htb-square-button.htb-square-button--ghost-icon-secondary.htb-square-button--medium{
  color: black !important;
}

header .flex.items-center path{
  fill: black !important;
  color: black !important;
  fill: black !important;
}

.htb-square-button--disabled{
  background-color: lightgreen !important;
}

.toast-title{
  color: black !important;;
}

.base-card{
  color: #404040;
}


.tabs-pill-selected{
  background: green !important;;

}

[title='Library']{
  background: transparent !important;
}

[title='Dashboard']{
  background: transparent !important;
}

.modal-backdrop{
  background-color: #e4eaf1;
}


.p-inputtext,.p-inputtext:active{
  background-color: #e4eaf1;
  border: 1px solid black !important;;
  color: black !important;
}


[data-pc-name="inputicon"] .htb-icon-primary-fill{
  fill: black !important;;
}

#search-modal .modal-content .flex{
  color: green !important;
}

ul.base-list div{
  color: black;
}

a[href="/app/library/modules"]{
  color: green;
}

a[href="/app/library/paths"]{
  color: green;
}

a[href="/app/library/modules?state=in_progress"]{
  color: green;
}

a[href*="tab=favourites"]{
  color: green !important;
}

.htb-square-button--secondary:hover, .htb-square-button--secondary{
   background-color: lightgreen;
  color: black;
}


.bg-\[url\(\'\/streaks\/streak-card-bg\.svg\'\)\]{
  background-image: none !important;
}

.bg-\[url\(\'\/streaks\/streak-card-bg\.svg\'\)\]{
  background-image: none !important;
}


.bg-bottom-left.bg-no-repeat.pb-8.border-secondary-disabled.border.rounded-bl-lg.rounded-br-lg{
  background-image: none !important;
}

.clipped-bg::after, .clipped-bg::before{
  content:none !important;;
}

button.keep-reading{
  color: black !important;
}

.base-card.card-row.card-row-compact-container .htb-icon-button *{
  color: black !important;  
}

.base-card.card-row.card-row-compact-container .htb-icon-button:hover:enabled{
  background-color: lightgreen !important;;
}

#questions-list input{
  color: black !important;;
}

.bg-blue-1000{
  background: transparent;
}

footer .htb-button--outlined{
  color: black;
}

footer .htb-button--outlined:hover{
  color: black;
  background: lightgreen;
}

#Cheatsheet-modal h3.modal-title{
  color: black;
}

.text-success{
  color: green;
}

.htb-button--ghost-secondary:has(svg.prepend-icon):hover , .htb-button--ghost-secondary:has(svg.prepend-icon){
  background-color: transparent;
  color: black;
}
  
.htb-button--ghost-secondary{
  color: black !important;;
}

.htb-button--ghost-secondary:hover{
  background-color: lightgreen !important;;
}

textarea[name="note-textarea"]{
  color: black;
}

::selection {
  color: black;
  background-color: lightgreen; 
}

code.bg-neutral-700{
  background: transparent !important;
}

a[href="#compare-plans"]{
  background-color: green;
}

a.tab-item.selected{
  background-color: green;
}

.module-header-title{
  color: black !important;;
}

.module-active .htb-button--ghost{
  color: green !important;
}
  /* outlined buttons */
.htb-button.htb-button--outlined{
  color: black;
  border-color: black;
}

.htb-button.htb-button--outlined:hover{
  background: lightgreen;
}

/* ghost buttons */
.htb-button.htb-button--ghost{
  color: green;
}

.htb-button.htb-button--ghost:hover{
  background-color: lightgreen;
}




.module-header-tag-name{
  color: black !important;
}
.htb-text-primary{
  color: black !important;;
}



.feature-item  *{
  color: black !important;
}

.feature-icon .htb-icon-secondary-fill{
  fill: black;
}

.rating-card-description{
  color: gray;
}

.base-list li *{
  color: black !important;;
}

.dropdown *{
  color: black;
}

.path-header *{
  color: black;
}

.path-header .progress{
  color: green !important;
}

.module-header p {
  color: black !important;
}

#module-review-modal *{
  color: black !important;
}

.mockup-browser{
  background-color: transparent;
  border: 2px solid;
}

.mockup-browser .bg-base-300{
  background: transparent;
  padding: 0px;
}

.mockup-browser .input{
  background-color: lightgreen;
  color: black;
}

.tab-item.whitespace-nowrap.flex.flex-col.items-center.gap-1.p-4.tabs-bordered.tabs-inline.tabs-selected.tab-active.peer{
  color: green !important;;
}
  #hint-modal h3.modal-title{
  color: black !important;;
}

.bg-htb-layer-background.rounded-lg .base-card .base-card button[class-name="bg-secondary"]{
  color: black !important;
}
.bg-htb-layer-background.rounded-lg .base-card .base-card button[class-name="bg-secondary"]:hover{
  background-color: lightgreen !important;
}

/* Links: readable blue on light backgrounds */
a,
a:link,
a.text-green-400,
a[class*="text-green"]{
  color: #275df0 !important;
}

a:hover,
a:focus-visible{
  color: #0a37ca !important;
}

a:visited{
  color: #0a37ca !important;
}


        `;
    } else if (mode === "print") {
      style.textContent = `
          /* ── Print Theme ── */

          /* Strip all dark backgrounds to white */
          .bg-neutral-1100, .bg-neutral-1000, .bg-neutral-900, .bg-neutral-800,
          .bg-neutral-700, .bg-neutral-600, .bg-neutral-500,
          .bg-neutral-400 { background-color: #fff !important; }
          [class*="htb-layer-01"] { background-color: #fff !important; }

          /* Black text */
          .text-primary, .text-secondary { color: #000 !important; }
          .text-accent { color: #333 !important; }
          article, article p, article li,
          article h1, article h2, article h3, article h4 { color: #000 !important; }

          /* Remove all decorative borders */
          .border-neutral-600, .border-neutral-500,
          .border-b-neutral-600 { border-color: #ddd !important; }

          /* Cards and panels */
          .base-card, .base-row, .collapse { background-color: #fff !important; }

          /* Nav */
          header, nav { background-color: #fff !important; border-color: #ddd !important; }

          /* Sidebar */
          .bg-neutral-800 .base-row,
          .bg-neutral-800 { background-color: #fff !important; }
          .base-row.bg-neutral-600 { background-color: #f0f0f0 !important; }

          /* Code blocks — keep dark for readability */
          pre, .shiki { background-color: #f5f5f5 !important; }
          pre *, .shiki * { color: #333 !important; }
          article code.text-blue-250 { color: #000 !important; font-weight: 600; }

          /* Footer */
          main.h-full > footer { background-color: #fff !important; }

          /* Accent green → black for print */
          .bg-accent, .bg-primary { background-color: #333 !important; }
          .fill-primary { fill: #333 !important; }

          /* Links */
          a { color: #000 !important; text-decoration: underline !important; }

          /* Scrollbar */
          ::-webkit-scrollbar-track { background: #fff !important; }
          ::-webkit-scrollbar-thumb { background: #ccc !important; }

          /* Print media — hide non-essential UI */
          @media print {
            header, nav, footer, #apt-settings-btn,
            .tab-wrapper, .collapse-title { display: none !important; }
            main.h-full > section { max-width: 100% !important; }
            article { font-size: 12pt !important; }
          }

          /* Keep settings panel dark */
          #apt-settings-overlay { background: rgba(0,0,0,0.6) !important; }
          #apt-settings-panel { background: #1a1a2e !important; color: #e0e0e0 !important; border-color: #2a2a4a !important; }
          #apt-settings-panel .apt-header { background: #1a1a2e !important; color: #e0e0e0 !important; }
          #apt-settings-panel .apt-footer { background: #1a1a2e !important; color: #e0e0e0 !important; }
          #apt-settings-panel .apt-feature-label { color: #e0e0e0 !important; }
          #apt-settings-panel .apt-feature-desc { color: #888 !important; }
          #apt-settings-panel .apt-scope-title { color: #9fef00 !important; }
          #apt-settings-panel .apt-select { background: #22223a !important; color: #e0e0e0 !important; border-color: #3a3a5a !important; }
       
header,footer,.navbar,.base-card{
  display: none !important;
}

.transition-all{
  margin-inline: auto !important;;
}

#connection-panel{
  display: none !important;;
}

main.h-full article pre[data-apt-bg-kind="shell"]{
  --apt-terminal-bg:transparent !important;
}

          `;
    }

    document.head.appendChild(style);
  },
});
