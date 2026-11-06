const { createRealtimeSession } = require("./session");

async function handleMemberAudio({ guildId, userId, displayName, pcm48kStereo }) {
  // Step 2 will add the complete Discord PCM conversion, Realtime session,
  // turn-taking, and playback pipeline. This placeholder deliberately avoids
  // sending incorrectly formatted audio to the model.
  console.log(`Queued voice turn from ${displayName} (${userId}) in ${guildId}`);
}

module.exports = { handleMemberAudio };
