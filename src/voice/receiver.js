const { EndBehaviorType } = require("@discordjs/voice");
const prism = require("prism-media");
const { handleMemberAudio } = require("../ai/realtime");
const { rememberMember } = require("../memory/database");

async function startReceiver(connection, guild) {
  const receiver = connection.receiver;

  receiver.speaking.on("start", userId => {
    if (userId === guild.members.me?.id) return;

    const member = guild.members.cache.get(userId);
    if (!member || member.user.bot) return;

    const opusStream = receiver.subscribe(userId, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 900 }
    });

    const decoder = new prism.opus.Decoder({
      rate: 48000,
      channels: 2,
      frameSize: 960
    });

    const chunks = [];
    opusStream.pipe(decoder);

    decoder.on("data", chunk => chunks.push(chunk));
    decoder.on("error", err => console.error("Opus decoder:", err));
    decoder.on("end", async () => {
      const pcm48kStereo = Buffer.concat(chunks);
      if (pcm48kStereo.length < 48000) return;

      rememberMember(guild.id, userId, member.displayName);
      console.log(`Captured voice from ${member.displayName} (${pcm48kStereo.length} bytes)`);

      // Audio conversion + Realtime handoff is implemented in the next build step.
      await handleMemberAudio({
        guildId: guild.id,
        userId,
        displayName: member.displayName,
        pcm48kStereo
      }).catch(err => console.error("Capri audio handling:", err));
    });
  });
}

module.exports = { startReceiver };
