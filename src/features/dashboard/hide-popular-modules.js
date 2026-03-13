  registerFeature({
    id: 'hide-popular-modules',
    label: 'Hide Popular Modules',
    description: 'Block the popularity-sorted modules API call and hide the carousel. Can improve page load times.',
    scope: 'dashboard',
    default: false,
    early: true,
  });
