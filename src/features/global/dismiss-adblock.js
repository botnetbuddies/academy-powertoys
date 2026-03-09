  registerFeature({
    id: 'dismiss-adblock',
    label: 'Dismiss Ad-Blocker Modal',
    description: 'Auto-dismiss the "Ad Blocker Detected" popup',
    scope: 'global',
    default: true,
    run() {
      const modal = document.querySelector('#adblockModal');
      if (modal) {
        if (modal.open) modal.close();
        modal.remove();
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    },
  });
