
# Tribe Take-Home Exercise

## Aim
To create a cross-platform React Native single room chat app.

## Instructions
- Use Expo to set up a new project.
- Use Zustand along with async-storage for persistent data storage.
- **Do not use react-native-gifted-chat or any similar package to render the chat view.**
- You may use any other package as per your preference/convenience.

## Must haves (Required)
- The app should consist of a screen with the list of all the messages.
- Each message should have a header with the avatar and name of the participant and the time at which the message was sent.
- Edited messages should indicate that they were edited.
- Each message having reactions should show a row of reactions below it.
- Consecutive messages of the same participant should be grouped together.
- There should be an input bar at the bottom of the screen for sending new messages.
- Show image for the messages which have an image attachment.

## Good to have (Optional)
- Show a separator (date) in between messages sent on different days.
- A message sent as reply to another message should show the quoted original message (message.replyToMessage).
- Efficiently use the API endpoints to initially hydrate the app and keep it up to date with the latest data throughout the app session.
- Lazy loading of messages / infinite scroll upwards.
- Storing the fetched data locally for offline app access.
- Reduce the re-rendering of the components as much as possible.
- Clicking on a message’s reactions should show a bottom sheet with the list of reactions along with the name of the participant who added it.
- Clicking on the name of a participant should open up a bottom sheet with the details of the participant.
- Clicking on a message’s image should open up an image preview overlay / modal.
- @mentions to mention participants.

## Mock chat server API
This server mocks a single room chat with messages and participants being added and updated all the time.

Latest API Version: 1

Type definitions:
https://github.com/ryushar/dummy-chat-server/blob/main/src/global.d.ts

Endpoint base:
https://dummy-chat-server.tribechat.com/api

### Endpoints
- `GET  /info` → `{ sessionUuid: string; apiVersion: number }`
  - Returns the server’s session uuid and the api version
  - session uuid: reset/clear the local data stored in the frontend (e.g., messages, participants) whenever this changes.
  - api version: the current server API version.

- `GET  /messages/all` → `TMessageJSON[]`
  - Returns all of the messages

- `GET  /messages/latest` → `TMessageJSON[]`
  - Returns the latest 25 messages

- `GET  /messages/older/<ref-message-uuid>` → `TMessageJSON[]`
  - ref-message-uuid: uuid of the reference message
  - Returns the latest 25 messages sent before the reference message

- `GET  /messages/updates/<time>` → `TMessageJSON[]`
  - time: milliseconds elapsed since epoch (as returned by Date.now())
  - Returns all the messages which were updated after the provided time

- `POST /messages/new` → `TMessageJSON`
  - Request body JSON format: `{ text: string }`
  - Adds a new message and returns it

- `GET /participants/all` → `TParticipant[]`
  - Returns all of the chat participants

- `GET /participants/updates/<time>` → `TParticipant[]`
  - time: milliseconds elapsed since epoch (as returned by Date.now())
  - Returns all the chat participants which were updated after the provided time

### Misc info
- Your own participant’s uuid is “you”.

## Submission
- Complete this assignment within 5 days of receiving it.
- Leveraging AI tools is fine, but explain in detail what parts relied on which AI tools. Our expectations for you are just higher the more you rely on AI to accomplish the tasks required. Conversely, if you’re able to not rely on AI tools, we will be more impressed.
- Send the link to the private GitHub repository to raj@tribechat.com, kahseng@tribechat.com and tushar@tribechat.com (Please do not forget to provide the aforementioned emails with the access to the repository)

## Evaluation Criteria
- Functionality and robustness
- Code quality (Clarity, Readability, Best practices, Efficiency, etc.)
- Code maintenance through the course of development on Version Control System (commits etc.)
- Quality of UI

Write back to us on dev-hiring@tribechat.com in case of any questions/clarifications.
