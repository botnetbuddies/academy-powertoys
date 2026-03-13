  registerFeature({
    id: 'hide-job-role-paths',
    label: 'Hide Get a New Job',
    description: 'Block the job role paths API call and hide the Get a New Job section. Can improve page load times.',
    scope: 'dashboard',
    default: false,
    early: true,
  });
