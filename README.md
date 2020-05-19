# Usage

To run the **fiscal-de-pr** you have to login into azure and share your azure folder using `-v ~/.azure:/root/.azure`.
Then you have to set your script configuration, for this step you have to create a file like this example:
```
module.exports = [ 
    {
        team: 'my team name',
        queryOn: {
            target: 'the enum query target', 
            config: {

            }
        },
        notifyOn: {
            target: 'the enum point to notification',
            config: {

            }
        }
    } 
]
```

An execution example: 
`docker run --rm -v ~/.azure:/root/.azure -v $(pwd)/config.js:/app/config.js matsproesser/fiscal-de-pr`

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
### [ vsts ]
This query processor uses Azure client to query for open Pull Requests.

Required configurations:
```
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

## Notifiers
### [ slack ]
This notifier uses slack webhook to notify about open pull requests found

Required cofigurations:
```
{
    target: 'slack'
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