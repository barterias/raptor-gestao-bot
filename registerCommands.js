const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('registrar-entrega')
    .setDescription('Registrar entrega de um editor')
    .addStringOption(opt =>
      opt.setName('editor')
        .setDescription('Nome do editor')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('link')
        .setDescription('Link do trabalho')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('registrar-nao-entrega')
    .setDescription('Registrar não entrega de um editor')
    .addStringOption(opt =>
      opt.setName('editor')
        .setDescription('Nome do editor')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('motivo')
        .setDescription('Motivo da não entrega')
        .setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 Registrando comandos...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados com sucesso!');
  } catch (err) {
    console.error(err);
  }
})();
