  registerFeature({
    id: 'hide-popular-paths',
    label: 'Hide Popular Paths',
    description: 'Block the popularity-sorted paths API call and hide the carousel. Can improve page load times.',
    scope: 'dashboard',
    default: false,
    early: true,
  });
