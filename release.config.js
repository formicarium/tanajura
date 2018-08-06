module.exports = {
  "branch": "master",
  "publishConfig": {
    "access": "public"
  },
  "repositoryUrl": "https://github.com/formicarium/tanajura",
  "prepare": [
    {
      "path": "@semantic-release/changelog",
      "changelogFile": "CHANGELOG.md"
    },
    "@semantic-release/npm",
    {
      "path": "@semantic-release/git",
      "assets": [
        "package.json",
        "CHANGELOG.md"
      ],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }
  ],
  "verifyConditions": [
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    // "@semantic-release/github"
  ],
  "publish": [
    "@semantic-release/npm",
    // "@semantic-release/github"
  ],
  "success": [
    // "@semantic-release/github"
  ],
  "fail": [
    // "@semantic-release/github"
  ]
}