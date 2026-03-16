// commitlint.config.js
//
// Rules:
//  - Type must be one of the standard semantic types
//  - Subject may start with uppercase, contain numbers and punctuation
//  - No hard length limit on subject beyond a practical max
//  - Scope is optional
//  - Body / footer are unrestricted

module.exports = {
  // Extend the conventional-commits base but override what we need
  extends: ['@commitlint/config-conventional'],

  parserPreset: {
    parserOpts: {
      // Keep the default angular parser but allow a wider subject
      headerPattern:
        /^(\w+)(?:\(([^)]*)\))?!?: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },

  rules: {
    // ── Type ──────────────────────────────────────────────────────────────
    'type-enum': [
      2,
      'always',
      [
        'feat',     // new feature
        'fix',      // bug fix
        'docs',     // documentation only
        'style',    // formatting, no logic change
        'refactor', // code change that is neither feat nor fix
        'perf',     // performance improvement
        'test',     // adding / fixing tests
        'build',    // build system / dependencies
        'ci',       // CI/CD configuration
        'chore',    // other housekeeping
        'revert',   // revert a previous commit
        'release',  // version bump commit (used by version-bump job)
      ],
    ],
    'type-case':  [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // ── Scope (optional) ──────────────────────────────────────────────────
    'scope-case': [0], // no case restriction on scope

    // ── Subject ───────────────────────────────────────────────────────────
    // Allow: uppercase first letter, numbers anywhere, punctuation anywhere
    // Disallow: empty subject, trailing period
    'subject-empty':     [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    // Override the conventional rule that forces lower-case
    'subject-case': [
      1, // warn only, not error – allows any case
      'never',
      // These cases are disallowed – we disallow nothing, so empty array
      [],
    ],
    'subject-max-length': [2, 'always', 150],
    'subject-min-length': [2, 'always', 3],

    // ── Header ────────────────────────────────────────────────────────────
    'header-max-length': [2, 'always', 200],

    // ── Body / Footer ─────────────────────────────────────────────────────
    'body-leading-blank':  [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
};
