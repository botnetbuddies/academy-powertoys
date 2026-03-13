  // Shared fetch/Response interceptor for dashboard section hiding features.
  // Runs early (document-start) and checks each feature's enabled state.
  // The individual registerFeature() calls above define the settings toggles;
  // this block does the actual blocking.
  (function() {
    if (window._aptDashBlockInstalled) return;

    const TARGETS = [
      {
        id: 'hide-popular-modules',
        pathname: '/api/v2/modules',
        param: 'sort[by]', paramValue: 'popularity',
        title: 'Popular Modules',
      },
      {
        id: 'hide-popular-paths',
        pathname: '/api/v2/paths',
        param: 'sort[by]', paramValue: 'popularity',
        title: 'Popular Paths',
      },
      {
        id: 'hide-favourite-modules',
        pathname: '/api/v2/modules',
        param: 'is_favourite', paramValue: 'true',
        title: 'Favourite Modules',
      },
      {
        id: 'hide-job-role-paths',
        pathname: '/api/v2/paths',
        param: 'type', paramValue: 'job_role',
        title: 'Get a new Job',
      },
      {
        id: 'hide-modules-in-progress',
        pathname: '/api/v2/modules',
        param: 'state', paramValue: 'in_progress',
        title: 'Modules In Progress',
      },
    ];

    // Check which features are enabled and build the block list.
    // We resolve this NOW so the injected page script doesn't need
    // access to the userscript's settings functions.
    const activeTargets = TARGETS.filter(t => getFeatureEnabled(t.id));

    if (activeTargets.length > 0) {
      // Inject interception code directly into the PAGE context.
      // This bypasses Tampermonkey's sandbox so our patches apply to
      // the page's actual Response.prototype, not the userscript's copy.
      const script = document.createElement('script');
      script.textContent = `(function(){
        if(window._aptDashBlockPageInstalled)return;
        var EMPTY='{"data":[]}';
        var targets=${JSON.stringify(activeTargets.map(t => ({
          pathname: t.pathname, param: t.param, paramValue: t.paramValue,
        })))};
        function m(url){
          try{
            var p=new URL(String(url),location.origin);
            if(p.origin!==location.origin)return false;
            for(var i=0;i<targets.length;i++){
              var t=targets[i];
              if(p.pathname!==t.pathname)continue;
              if(t.param&&p.searchParams.get(t.param)!==t.paramValue)continue;
              return true;
            }
          }catch(e){}
          return false;
        }
        function fake(){
          return new Response(EMPTY,{status:200,headers:{'Content-Type':'application/json'}});
        }
        // Trap fetch
        var nf=window.fetch;
        var fp=function(input){
          var url=(input instanceof Request)?input.url:String(input);
          if(m(url))return Promise.resolve(fake());
          return nf.apply(this,arguments);
        };
        try{
          var cf=fp;
          Object.defineProperty(window,'fetch',{
            configurable:true,enumerable:true,
            get:function(){return cf;},
            set:function(v){if(v!==fp&&v!==nf)cf=v;}
          });
        }catch(e){window.fetch=fp;}
        // Patch Response body methods
        ['json','text','arrayBuffer','blob'].forEach(function(method){
          var orig=Response.prototype[method];
          if(typeof orig!=='function')return;
          Response.prototype[method]=function(){
            if(this.url&&m(this.url)){
              if(method==='json')return Promise.resolve({data:[]});
              if(method==='text')return Promise.resolve(EMPTY);
              if(method==='arrayBuffer')return Promise.resolve(new TextEncoder().encode(EMPTY).buffer);
              if(method==='blob')return Promise.resolve(new Blob([EMPTY],{type:'application/json'}));
            }
            return orig.call(this);
          };
        });
        // Patch clone
        var oc=Response.prototype.clone;
        Response.prototype.clone=function(){
          if(this.url&&m(this.url))return fake();
          return oc.call(this);
        };
        window._aptDashBlockPageInstalled='1';
      })();`;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    }

    // Hide carousel sections via CSS + MutationObserver
    // (this runs in userscript context — DOM manipulation works fine here)
    const style = document.createElement('style');
    style.id = 'apt-hide-dash-sections';
    style.textContent = `[data-apt-hidden-section] { display: none !important; }`;
    (document.head || document.documentElement).appendChild(style);

    function hideSections() {
      let allFound = true;
      for (const t of activeTargets) {
        const heading = [...document.querySelectorAll('h2.carousel-title')].find(
          h => h.textContent.trim() === t.title
        );
        if (!heading) { allFound = false; continue; }
        const section = heading.closest('section[data-v-09c02e11]');
        if (section && !section.hasAttribute('data-apt-hidden-section')) {
          section.setAttribute('data-apt-hidden-section', '');
        }
      }
      return allFound;
    }

    if (!hideSections()) {
      const obs = new MutationObserver(() => { if (hideSections()) obs.disconnect(); });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => obs.disconnect(), 8000);
    }

    window._aptDashBlockInstalled = '1';
  })();
