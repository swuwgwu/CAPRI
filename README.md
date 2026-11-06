# CAPRI — Discord Voice Companion (V1 scaffold)

This is a fresh, single-server project. The current scaffold:
- Registers `/join` and `/leave` for one Discord server.
- Joins the voice channel of the person invoking `/join`.
- Subscribes to member voice streams and decodes Opus to 48 kHz stereo PCM.
- Stores member IDs, display names, and first/last seen timestamps in SQLite.

## Important status

**This is the initial scaffold, not a finished talking bot yet.**
The audio pipeline from Discord PCM into OpenAI Realtime, audio format conversion,
turn-taking, and playback back into Discord are the next implementation step.
Do not expect spoken replies until that step is added.

Discord voice receive is not officially documented by Discord and may be less stable
than sending audio. Test with a small private server first.

## Requirements

- Node.js 22.12+ for the pinned `@discordjs/voice` 0.19 line.
- A Discord application/bot with `Guilds` and `GuildVoiceStates` intents.
- OpenAI API key with access to the Realtime API.

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, and `OPENAI_API_KEY`.
3. Install dependencies: `npm install`
4. Start: `npm start`

Never share `.env` or bot/API tokens.

## Railway

Create a new Node service from this project/repository, set the variables from
`.env.example`, and use `npm start` as the start command. Attach persistent storage
for the `data` directory if you want SQLite data to survive redeploys. A managed
PostgreSQL database is a better next step if you later want more robust persistence.

## Next build step

Implement safe audio conversion and the complete Realtime audio session:
- Discord 48 kHz stereo PCM -> 24 kHz mono PCM
- Realtime speech-to-speech session with Capri's instructions and chosen voice
- Realtime 24 kHz mono PCM -> Discord playback format
- Per-member conversation context and memory retrieval
- Prevent Capri from responding to her own audio
