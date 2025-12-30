require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const REGISTROS_FILE = './registros.json';

function salvarRegistro(registro) {
  const dados = fs.existsSync(REGISTROS_FILE)
    ? JSON.parse(fs.readFileSync(REGISTROS_FILE))
    : [];

  dados.push(registro);
  fs.writeFileSync(REGISTROS_FILE, JSON.stringify(dados, null, 2));
}

client.once('ready', () => {
  console.log(`🦅 Raptor Bot online: ${client.user.tag}`);
});

/* =========================
   COMANDOS DE REGISTRO
========================= */

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const canalRegistro = await client.channels.fetch(process.env.CANAL_REGISTRO);

  // REGISTRAR ENTREGA
  if (interaction.commandName === 'registrar-entrega') {
    const editor = interaction.options.getString('editor');
    const link = interaction.options.getString('link');

    const embed = new EmbedBuilder()
      .setTitle('📁 REGISTRO DE ENTREGA — RAPTOR')
      .setColor(0x00ff99)
      .addFields(
        { name: '👤 Editor', value: editor },
        { name: '🔗 Link', value: link },
        { name: '🕒 Data', value: new Date().toLocaleString('pt-BR') },
        { name: '🧑‍💼 Registrado por', value: interaction.user.tag }
      );

    await canalRegistro.send({ embeds: [embed] });

    salvarRegistro({
      tipo: 'entrega',
      editor,
      link,
      data: Date.now()
    });

    return interaction.reply({ content: '✅ Entrega registrada.', ephemeral: true });
  }

  // REGISTRAR NÃO ENTREGA
  if (interaction.commandName === 'registrar-nao-entrega') {
    const editor = interaction.options.getString('editor');
    const motivo = interaction.options.getString('motivo');

    const embed = new EmbedBuilder()
      .setTitle('📁 REGISTRO DE NÃO ENTREGA — RAPTOR')
      .setColor(0xff5555)
      .addFields(
        { name: '👤 Editor', value: editor },
        { name: '❌ Motivo', value: motivo },
        { name: '🕒 Data', value: new Date().toLocaleString('pt-BR') },
        { name: '🧑‍💼 Registrado por', value: interaction.user.tag }
      );

    await canalRegistro.send({ embeds: [embed] });

    salvarRegistro({
      tipo: 'nao-entrega',
      editor,
      motivo,
      data: Date.now()
    });

    return interaction.reply({ content: '⚠️ Não-entrega registrada.', ephemeral: true });
  }
});

/* =========================
   ALERTA AUTOMÁTICO 20H
========================= */

cron.schedule('0 20 * * *', async () => {
  if (!fs.existsSync(REGISTROS_FILE)) {
    const canal = await client.channels.fetch(process.env.CANAL_ALERTA);
    canal.send('🚨 **ALERTA RAPTOR**\nNenhum registro foi feito hoje até 20h.');
    return;
  }

  const registros = JSON.parse(fs.readFileSync(REGISTROS_FILE));
  const hoje = new Date().toDateString();

  const teveRegistroHoje = registros.some(r =>
    new Date(r.data).toDateString() === hoje
  );

  if (!teveRegistroHoje) {
    const canal = await client.channels.fetch(process.env.CANAL_ALERTA);
    canal.send('🚨 **ALERTA RAPTOR**\nNenhuma entrega ou justificativa foi registrada hoje até 20h.');
  }
});

client.login(process.env.TOKEN);
