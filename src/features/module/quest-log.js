registerFeature({
  id: 'quest-log',
  label: 'Quest Log',
  description: 'Shows a floating sidebar with module questions and answer inputs',
  scope: 'module',
  default: false,
  cleanup() {
    var el = document.getElementById('apt-quest-log');
    if (el) el.parentNode.removeChild(el);
    el = document.getElementById('apt-quest-log-style');
    if (el) el.parentNode.removeChild(el);
  },
  run() {
    if (document.getElementById('apt-quest-log')) return;

    function getQuestionsList() {
      return document.getElementById('questions-list');
    }

    function expandAllQuestions() {
      var list = getQuestionsList();
      if (!list) return;
      
      var collapses = list.querySelectorAll('.collapse');
      for (var i = 0; i < collapses.length; i++) {
        var collapse = collapses[i];
        if (!collapse.classList.contains('collapse-open')) {
          var checkbox = collapse.querySelector('input[type="checkbox"]');
          if (checkbox && !checkbox.checked) {
            checkbox.click();
          } else {
            var title = collapse.querySelector('.collapse-title');
            if (title) title.click();
          }
        }
      }
    }

    function isQuestionCompleted(li, index) {
      if (li.classList.contains('solved')) {
        return true;
      }
      
      var isCompleted = li.getAttribute('is_completed');
      if (isCompleted === '1' || isCompleted === 'true') {
        return true;
      }
      
      var dataSolved = li.getAttribute('data-solved');
      if (dataSolved === '1' || dataSolved === 'true') {
        return true;
      }
      
      var inputEl = li.querySelector('input[type="text"], input[type="password"], textarea');
      if (inputEl && inputEl.disabled && inputEl.value && inputEl.value.length > 0) {
        return true;
      }
      
      return false;
    }

    function createStyles() {
      if (document.getElementById('apt-quest-log-style')) return;
      var style = document.createElement('style');
      style.id = 'apt-quest-log-style';
      style.textContent = '' +
        '#apt-quest-log {' +
        '  position: fixed;' +
        '  top: 80px;' +
        '  right: 20px;' +
        '  width: 340px;' +
        '  max-height: calc(100vh - 180px);' +
        '  background: #1a1a2e;' +
        '  border: 1px solid #2a2a4a;' +
        '  border-radius: 8px;' +
        '  z-index: 99990;' +
        '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        '  box-shadow: 0 4px 20px rgba(0,0,0,0.4);' +
        '}' +
        '#apt-quest-log.apt-collapsed {' +
        '  display: none;' +
        '}' +
        '#apt-quest-log-btn {' +
        '  position: fixed;' +
        '  top: 80px;' +
        '  right: 20px;' +
        '  width: 48px;' +
        '  height: 48px;' +
        '  background: #1a1a2e;' +
        '  border: 1px solid #2a2a4a;' +
        '  border-radius: 50%;' +
        '  color: #9fef00;' +
        '  font-size: 20px;' +
        '  cursor: pointer;' +
        '  z-index: 99989;' +
        '  display: flex;' +
        '  align-items: center;' +
        '  justify-content: center;' +
        '  box-shadow: 0 2px 10px rgba(0,0,0,0.3);' +
        '}' +
        '#apt-quest-log-btn:hover {' +
        '  background: #252540;' +
        '}' +
        '#apt-quest-log-header {' +
        '  padding: 12px 16px;' +
        '  background: #16162a;' +
        '  border-bottom: 1px solid #2a2a4a;' +
        '  display: flex;' +
        '  align-items: center;' +
        '  justify-content: space-between;' +
        '}' +
        '#apt-quest-log-title {' +
        '  font-size: 14px;' +
        '  font-weight: 600;' +
        '  color: #9fef00;' +
        '  margin: 0;' +
        '}' +
        '#apt-quest-log-toggle {' +
        '  background: none;' +
        '  border: none;' +
        '  color: #9fef00;' +
        '  cursor: pointer;' +
        '  font-size: 16px;' +
        '}' +
        '#apt-quest-log-content {' +
        '  max-height: calc(100vh - 250px);' +
        '  overflow-y: auto;' +
        '}' +
        '.apt-quest-item {' +
        '  padding: 12px 16px;' +
        '  border-bottom: 1px solid #252540;' +
        '}' +
        '.apt-quest-item.apt-completed {' +
        '  background: rgba(159, 239, 0, 0.1);' +
        '}' +
        '.apt-quest-title {' +
        '  font-size: 13px;' +
        '  color: #e0e0e0;' +
        '  line-height: 1.4;' +
        '  margin-bottom: 8px;' +
        '  cursor: pointer;' +
        '}' +
        '.apt-quest-title:hover {' +
        '  color: #9fef00;' +
        '}' +
        '.apt-quest-input {' +
        '  width: calc(100% - 60px);' +
        '  padding: 8px 12px;' +
        '  background: #0f0f1e;' +
        '  border: 1px solid #3a3a5a;' +
        '  border-radius: 4px 0 0 4px;' +
        '  color: #e0e0e0;' +
        '  font-size: 13px;' +
        '  font-family: inherit;' +
        '  box-sizing: border-box;' +
        '}' +
        '.apt-quest-input:focus {' +
        '  outline: none;' +
        '  border-color: #9fef00;' +
        '}' +
        '.apt-quest-input::placeholder {' +
        '  color: #666;' +
        '}' +
        '.apt-quest-submit {' +
        '  width: 56px;' +
        '  padding: 8px;' +
        '  background: #9fef00;' +
        '  border: 1px solid #9fef00;' +
        '  border-radius: 0 4px 4px 0;' +
        '  color: #1a1a2e;' +
        '  font-size: 13px;' +
        '  font-weight: 600;' +
        '  cursor: pointer;' +
        '}' +
        '.apt-quest-submit:hover {' +
        '  background: #7fc700;' +
        '}' +
        '#apt-quest-log-empty {' +
        '  padding: 16px;' +
        '  color: #888;' +
        '  font-size: 13px;' +
        '}';
      document.head.appendChild(style);
    }

    function build() {
      var list = getQuestionsList();
      if (!list) return;
      
      var ul = list.querySelector('ul');
      if (!ul) return;
      
      expandAllQuestions();
      
      setTimeout(function() {
        buildQuestions(ul);
      }, 1000);
    }
    
    function buildQuestions(ul) {
      var lis = ul.querySelectorAll('li');
      if (lis.length === 0) return;
      
      createStyles();

      var sidebar = document.createElement('div');
      sidebar.id = 'apt-quest-log';
      sidebar.innerHTML = '' +
        '<div id="apt-quest-log-header">' +
        '  <h3 id="apt-quest-log-title">Quest Log</h3>' +
        '  <button id="apt-quest-log-toggle" title="Hide">×</button>' +
        '</div>' +
        '<div id="apt-quest-log-content"></div>';

      var floatBtn = document.createElement('button');
      floatBtn.id = 'apt-quest-log-btn';
      floatBtn.title = 'Show Quest Log';
      floatBtn.innerHTML = '?';
      floatBtn.addEventListener('click', function() {
        sidebar.classList.remove('apt-collapsed');
        floatBtn.style.display = 'none';
      });
      document.body.appendChild(floatBtn);

      var content = sidebar.querySelector('#apt-quest-log-content');
      var toggle = sidebar.querySelector('#apt-quest-log-toggle');

      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.add('apt-collapsed');
        floatBtn.style.display = 'flex';
      });

      sidebar.querySelector('#apt-quest-log-header').addEventListener('click', function(e) {
        if (e.target.id === 'apt-quest-log-toggle') return;
        sidebar.classList.add('apt-collapsed');
        floatBtn.style.display = 'flex';
      });

      for (var i = 0; i < lis.length; i++) {
        var li = lis[i];
        
        var text = li.textContent || '';
        text = text.replace(/\s+/g, ' ').trim();
        text = text.replace(/^Question\s*[\d\+]*\s*/, '');
        if (!text || text.length < 5) text = 'Question ' + (i + 1);
        
        var link = li.querySelector('a');
        var id = '';
        if (link && link.id) {
          id = link.id;
        } else {
          id = 'apt-q-' + i;
        }
        
        var input = null;
        var submitBtn = null;
        var inputEl = li.querySelector('input[type="text"], input[type="password"], textarea');
        if (inputEl) {
          input = inputEl;
          var btn = li.querySelector('button[type="submit"], button.btn-primary, button[class*="submit"]');
          if (btn) submitBtn = btn;
        }
        
        var completed = isQuestionCompleted(li, i + 1);
        
        var item = document.createElement('div');
        item.className = 'apt-quest-item';
        if (completed) item.classList.add('apt-completed');
        
        var title = document.createElement('div');
        title.className = 'apt-quest-title';
        if (completed) {
          title.innerHTML = '<span style="color: #9fef00;">✓ </span>' + text;
        } else {
          title.textContent = text;
        }
        title.addEventListener('click', (function(qid) {
          return function() {
            var el = document.getElementById(qid);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          };
        })(id));
        item.appendChild(title);
        
        if (input) {
          var wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          
          var inp = document.createElement('input');
          inp.type = 'text';
          inp.className = 'apt-quest-input';
          inp.placeholder = 'Type answer...';
          
          inp.addEventListener('input', function(realInput) {
            return function(e) {
              realInput.value = e.target.value;
              realInput.dispatchEvent(new Event('input', { bubbles: true }));
              realInput.dispatchEvent(new Event('change', { bubbles: true }));
            };
          }(input));
          
          input.addEventListener('input', function(sidebarInput) {
            return function(e) {
              if (sidebarInput.value !== e.target.value) {
                sidebarInput.value = e.target.value;
              }
            };
          }(inp));
          
          inp.addEventListener('keydown', function(realInput, btn) {
            return function(e) {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (btn) {
                  btn.click();
                } else {
                  var b = realInput.closest('form')?.querySelector('button[type="submit"], button.btn-primary');
                  if (b) b.click();
                }
              }
            };
          }(input, submitBtn));
          
          if (input.value) {
            inp.value = input.value;
          }
          
          wrapper.appendChild(inp);
          
          var submitBtnEl = document.createElement('button');
          submitBtnEl.type = 'button';
          submitBtnEl.className = 'apt-quest-submit';
          submitBtnEl.textContent = 'Submit';
          submitBtnEl.addEventListener('click', function(realInput) {
            return function(e) {
              realInput.value = inp.value;
              realInput.dispatchEvent(new Event('input', { bubbles: true }));
              realInput.dispatchEvent(new Event('change', { bubbles: true }));
              
              var btn = realInput.closest('form')?.querySelector('button[type="submit"], button.btn-primary');
              if (btn) btn.click();
            };
          }(input));
          
          wrapper.appendChild(submitBtnEl);
          item.appendChild(wrapper);
        }
        
        content.appendChild(item);
      }

      document.body.appendChild(sidebar);
    }

    function init() {
      setTimeout(build, 2000);
      
      var questionObserver = new MutationObserver(function() {
        var list = getQuestionsList();
        if (list) {
          var oldSidebar = document.getElementById('apt-quest-log');
          if (oldSidebar) {
            var newQuestions = list.querySelectorAll('li');
            if (newQuestions.length > 0) {
              var oldContent = oldSidebar.querySelector('#apt-quest-log-content');
              if (oldContent && oldContent.children.length !== newQuestions.length) {
                oldSidebar.remove();
                var oldBtn = document.getElementById('apt-quest-log-btn');
                if (oldBtn) oldBtn.remove();
                setTimeout(build, 500);
              }
            }
          }
        }
      });
      questionObserver.observe(document.body, { childList: true, subtree: true });
    }

    init();
  },
});
