# junctionapp-mailchimp-extension

Small connector between the JunctionApp and a given MailChimp Audience

## Setup

Create a `.env` file with the following configuration:

```
MAILCHIMP_AUDIENCE_ID=<Audience/List ID here>
MAILCHIMP_API_KEY=<API key here>
MAILCHIMP_TAG=<The tag you want to add, ideally the event name>
API_KEY=<A custom key for securing your API>
PORT=<Server port, eg.: 8000>

STATUS_MERGE_FIELD=<The merge field for Junction registration status in Mailchimp, like: JUNC_STAT>
CUSTOM_ANSWERS_TO_SYNC=This is an array like string like this: <MERGE_FIELD>:<CUSTOM_QUESTION_ID>,<MERGE_FIELD2>:<CUSTOM_QUESTION_ID2>, eg.: JUNC_PREF:some-question
```

## Connect

Go to your event in the JunctionApp and under `Miscellaneous/Webhooks` set up a webhook for `Registrations - Save`. Set the URL to your deployed instance with the path `/registration/`
