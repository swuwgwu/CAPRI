require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChannelType
} = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const { startReceiver } = require("./voice/receiver");
const { initDatabase } = require("./memory/database");

const required = ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID", "OPENAI_API_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName("join")
    .setDescription("اجعل كابري تدخل الروم الصوتي"),
  new SlashCommandBuilder()
    .setName("leave")
    .setDescription("اجعل كابري تخرج من الروم الصوتي")
];

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands.map(c => c.toJSON()) }
  );
}

client.once("ready", () => {
  console.log(`Capri is online as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.guildId !== process.env.GUILD_ID) {
    return interaction.reply({ content: "كابري مخصصة لسيرفر واحد فقط.", ephemeral: true });
  }

  if (interaction.commandName === "join") {
    const member = interaction.member;
    const channel = member?.voice?.channel;

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      return interaction.reply({ content: "ادخل روم صوتي أول، وبعدها نادِ كابري.", ephemeral: true });
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    startReceiver(connection, interaction.guild).catch(err => {
      console.error("Receiver error:", err);
    });

    return interaction.reply("وصلت! أنا معكم 🎧");
  }

  if (interaction.commandName === "leave") {
    const connection = getVoiceConnection(interaction.guildId);
    if (connection) connection.destroy();
    return interaction.reply("بطلع الحين، أشوفكم بعدين.");
  }
});

(async () => {
  initDatabase();
  await registerCommands();
  await client.login(process.env.DISCORD_TOKEN);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
