  registerFeature({
    id: 'hide-modules-in-progress',
    label: 'Hide Modules In Progress',
    description: 'Block the in-progress modules API call and hide the carousel. Can improve page load times. Has side effect of removing the "Modules in Progress" tab at the top of the page.',
    scope: 'dashboard',
    default: false,
    early: true,
  });
