    (function () {
      /* --- Highlight today's hours (café time, America/New_York) --- */
      var hoursByDay = {
        0: '7:00 AM – 4:00 PM', 1: '7:00 AM – 4:00 PM', 2: '7:00 AM – 4:00 PM',
        3: '7:00 AM – 4:00 PM', 4: '7:00 AM – 4:00 PM',
        5: '7:00 AM – 5:00 PM', 6: '7:00 AM – 5:00 PM'
      };
      try {
        var dayName = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'long' }).format(new Date());
        var dow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })).getDay();
        var row = document.querySelector('.hours tr[data-day="' + dow + '"]');
        if (row) {
          row.classList.add('today');
          var th = row.querySelector('th');
          var tag = document.createElement('span');
          tag.className = 'today-tag';
          tag.textContent = 'Today';
          th.appendChild(tag);
        }
        var line = document.getElementById('todayLine');
        if (line && hoursByDay[dow]) {
          line.textContent = 'Today (' + dayName + '): ' + hoursByDay[dow];
        }
      } catch (e) { /* hours table stands on its own */ }

      /* --- Interactive map, with address-card fallback --- */
      var mapEl = document.getElementById('cafeMap');
      var fallback = document.getElementById('mapFallback');
      function showFallback() {
        if (mapEl) mapEl.style.display = 'none';
        if (fallback) fallback.style.display = 'block';
      }
      try {
        if (window.MapHelpers && mapEl) {
          var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          var handle = MapHelpers.mountMap(mapEl, {
            places: [{
              label: 'The Brick and Mortar Cafe',
              address: '3500 Massee Ln Ste C',
              locality: 'Columbus',
              region: 'GA',
              lat: 32.567659,
              lng: -84.938868
            }],
            baseStyle: dark ? 'dark' : 'light'
          }, showFallback);
          if (!handle) showFallback();
        } else {
          showFallback();
        }
      } catch (e) { showFallback(); }

      /* --- Inquiry form: composes the visitor's note --- */
      var form = document.getElementById('inquiryForm');
      var output = document.getElementById('noteOutput');
      var noteText = document.getElementById('noteText');
      var noteName = document.getElementById('noteName');
      var toast = document.getElementById('toast');
      function showToast() {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';
        window.setTimeout(function () {
          toast.style.opacity = '0';
          toast.style.transform = 'translate(-50%, 20px)';
        }, 1600);
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var name = document.getElementById('fName').value.trim();
        var reach = document.getElementById('fReach').value.trim();
        var topic = document.getElementById('fTopic').value;
        var message = document.getElementById('fMessage').value.trim();
        if (!name || !reach || !message) {
          output.classList.remove('show');
          var missing = !name ? 'fName' : (!reach ? 'fReach' : 'fMessage');
          document.getElementById(missing).focus();
          return;
        }
        noteName.textContent = name.split(' ')[0];
        noteText.textContent =
          'Hi! This is ' + name + '.\n' +
          'Topic: ' + topic + '\n\n' +
          message + '\n\n' +
          'You can reach me at ' + reach + '.';
        output.classList.add('show');
        output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      document.getElementById('copyNote').addEventListener('click', function () {
        var text = noteText.textContent;
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(showToast);
        } else {
          var area = document.createElement('textarea');
          area.value = text;
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
          showToast();
        }
      });
    })();
  
