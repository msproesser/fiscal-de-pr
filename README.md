# Usage
---
To run the **fiscal-de-pr** you have to login into azure and share your azure folder using `-v ~/.azure:/root/.azure`.
Then you have to set your script configuration, for this step you have to create a file like this example:
```js
module.exports = [ 
    {
        team: 'my team name',
        queryOn: {
            target: '[vsts|bitbucket]', 
            config: {

            }
        },
        notifyOn: {
            target: '[slack|google-chat]',
            config: {

            }
        }
    } 
]
```

An execution example: 
`docker run --rm -e USER=$azure_user -e PASS=$azure_pass -v $(pwd)/config.js:/app/config.js matsproesser/fiscal-de-pr`

## Understanding the fields: 
The default configuration object contains three fields:
1. **team**: A simple identifier to simplify logs and tracking
2. **queryOn**: An object containing a ***target*** and ***config***
    - **target**: The identifier of query processor (see Query Processors)
    - ***config***: Custom configuration based on selected target
3. **notifyOn**: An object containing a ***target*** and ***config***
    - **target**: The identifier of notifier processor (see Notifiers)
    - ***config***: Custom configuration based on selected target

## Query processors
### [ **vsts** ]
This query processor uses Azure client to query for open Pull Requests based on member list.

*OBS*: To use this target the container must receive environment variable `AZURE_DEVOPS_EXT_PAT` containing a valid PAT for organization

Configurations:
```js
{
    target: 'vsts',
    config: {
        azHost: 'http://azure', // the host of your azure DevOps. 
        azProject: 'MY_PROJECT', // the identifier of project inside azure DevOps where target repositories are.
        listDraft: true, // toogle to list or ignore pull requests in draft
        members: [
            "user@email.com" // list of users with pull requests to be watched
        ]
    }
}
```

### [ **vsts-repo** ]
This query processor uses Azure client to query open Pull Requests based on repository name

*OBS*: To use this target the container must receive environment variable `AZURE_DEVOPS_EXT_PAT` containing a valid PAT for organization

```js
{
    target: 'vsts-repo',
    config: {
        azHost: 'http://azure', // the host of your azure DevOps. 
        azProject: 'MY_PROJECT', // the identifier of project inside azure DevOps where target repositories are.
        listDraft: true, // toogle to list or ignore pull requests in draft
        repository: "target repository" // tha name of repository to be watched
    }
}
```

### [ **bitbucket** ]
This query processor uses bitbucket API v2 to query Pull Requests by user, filtering by OPEN state.

Configurations:
```js
{
    target: 'bitbucket',
    config: {
        authToken: "Basic base64(username:apiToken)", // requires a token api token with pull request read access only.
        members: [
            "matsproesser" // list of user ids to be watched 
        ]
    }
}
```


## Notifiers
### [ **slack** ]
This notifier uses slack webhook to notify about open pull requests found

Cofigurations:
```js
{
    target: 'slack',
    config: {
        botUrl: 'http://slack', //The webhook url to post messages
        botName: 'fiscal de pr', // OPTIONAL The name of bot, overrides the original name
        botIcon: ':smile_face:', // OPTIONAL The slack emoji to replace original icon
        channel: '#team-channel', // OPTIONAL The slack channel to replace the originally configured
        headerMessage: '@here', // A custom header message to send before pull request list
        notifyEmpty = true, // Toogle to ignore notification if there is no open pull request
    }
}
```

### [ **google-chat** ]
This notifier uses google-chat webhook to notify channels about open pull requests

Configurations:
```js
{
    target: 'google-chat',
    config: {
        headerMessage: '<users/all>', // A custom header message to send before pull request list
        botUrl: 'https://chat.google.com/....' // The webhook url to post messages
    }
}
```