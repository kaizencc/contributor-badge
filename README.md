# <span style="font-size:8em;">🦡</span>

# GitHub Merit Badger

Welcome to the GitHub Merit Badger! This is a GitHub Action that can add well-known
merit badges to pull requests that come in to your repository. It will gamify
contributions and galvanize the open-source community to contribute more and more
to your project!

## Getting Started

This Action is meant to be run on pull requests only. The below example calls this
GitHub Action with the following rules:

- Contributors with no merged PRs in the repository are labeled `first-time-contributor`.
- Contributors with 1 - 4 merged PRs are labeled `repeat-contributor`.
- Contributors with 5+ merged PRs are labeled `allstar-contributor`.


```yaml
name: add-merit-badger
on:
  pull_request_target:
    types:
      - opened

jobs:
  merit-badges:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: kaizencc/github-merit-badger@main
        id: github-merit-badger
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          badges: '[first-time-contributor,repeat-contributor,allstar-contributor]'
          thresholds: '[0,1,5]'
```

When pull requests are opened in a repository with this action, the `github-merit-badger`
action will run and a label with the correct badge name will be added to the pull request.

## Different Kinds of Badgers

The way this action works is that it exposes different classes of Badgers via the `badge-type`
property. Right now, there are 2 classes of Badgers available: `AchievementBadger` and `LeaderboardBadger`.

### Achievement Badger

`AchievementBadger` is the default, so examples without a `badge-type` property will utilize the
`AchievementBadger`. This Badger calculates a rating based on how many pull requests a user
has successfully merged to the repository. This rating is then compared to the values inside `threshold`,
resulting in the corresponding badge being labeled on the incoming pull request.

### Leaderboard Badger

`LeaderboardBadger` can be used by setting `badge-type: 'leaderboard'` in the GitHub Workflow. This Badger
will calculate a value based on how a user compares to other contributors in the repository. For example,
if a user has successfully merged 5 pull requests prior to opening the newest one, `LeaderboardBadger` will
see how that ranks against other contributors and return a value based on that. If 5 pull requests is good
for 8th place, then the value of 8 is returned and compared to the values inside `threshold`.

Consider the following example usage:

```yaml
steps:
  - uses: kaizencc/github-merit-badger@main
    id: github-merit-badger
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      badges: '[1st! :trophy:,top 3 :fire:,top 5 :sunglasses:]'
      thresholds: '[1,3,5]'
      badge-type: 'leaderboard'
```

When kaizencc@ submits a PR, the Action will find that he has submitted 25 lifetime PRs to the repository, which is good for 2nd place. kaizencc@ will thus receive the `top 3 :fire:` badge on their PR.

## Badge Descriptions

In addition to adding labels on pull requests, this GitHub Action can also write custom
comments on each PR explaining what the badges mean. To include this functionality,
add the `badge-descriptions` paramater to the action, where each description matches 1
to 1 with the `badges` parameter:

```yaml
steps:
  - uses: kaizencc/github-merit-badger@main
    id: github-merit-badger
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      badges: '[first-time-contributor,repeat-contributor,allstar-contributor]'
      thresholds: '[0,1,5]'
      badge-descriptions: '[this is your first contribution!,you've been here before, welcome back!,you've made so many contributions that we think you rock!]'
```

If a user, kaizencc, opens a PR to a repository they frequent, this will produce a
comment saying:

```
Welcome kaizencc@! You are an allstar contributor, which means that you've made so many contributions that we think you rock! Keep up the good work!
```

## Additional Filters

In the basic use case, the Action scoures the full history of pull requests in your 
repository and filters for a specific username. You can specify additional filters on
the basic use case to customize for the specific use case you want.

### Days

Specify a number of days you want the Action to look at. For example, if you specify
30 days, then the Action will only look at the pull request history from the past 30 days.

```yaml
steps:
  - uses: kaizencc/github-merit-badger@main
    id: github-merit-badger
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      badges: '[first-time-contributor,repeat-contributor,allstar-contributor]'
      thresholds: '[0,1,5]'
      days: 365
```

In the above example, your badge is only valid on contributions from the past year, which
is similar to airline frequent flyer programs. If you don't continue to contribute, your
badge may be removed!

### Ignore Usernames

Specify a list of usernames that the Action should ignore. This is useful if you want to
create badges for the community, but you don't want to add labels to the core maintainers.

```yaml
steps:
  - uses: kaizencc/github-merit-badger@main
    id: github-merit-badger
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      badges: '[first-time-contributor,repeat-contributor,allstar-contributor]'
      thresholds: '[0,1,5]'
      ignore-usernames: '[kaizencc]'
```

### Title Prefixes

Specify a list of title prefixes that the Action should accept. For example, the below code
will only count PRs with titles that begin with `feat` or `fix`. It will ignore PRs with other
titles like `chore` or `refactor`.

```yaml
steps: 
  - uses: kaizencc/github-merit-badger@main
    id: github-merit-badger
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      badges: '[first-time-contributor,repeat-contributor,allstar-contributor]'
      thresholds: '[0,1,5]'
      title-prefixes: '[feat,fix]'
```