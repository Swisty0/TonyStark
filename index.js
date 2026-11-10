const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionsBitField 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// BURAYA KENDİ BOT TOKEN'INI YAZ
const TOKEN = 'BURAYA_BOT_TOKENINI_YAZ';

client.once('ready', () => {
    console.log(`🤖 ${client.user.tag} başarıyla aktif ve çalışıyor!`);
    client.user.setPresence({
        activities: [{ name: 'Project Swisty — Destek Sistemi', type: 3 }],
        status: 'online',
    });
});

// !ticketmesaj yazarak görseldeki paneli kanala gönderirsin
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content === '!ticketmesaj') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: '❌ Bu komutu sadece yöneticiler kullanabilir.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#113ccf')
            .setTitle('🌙 DESTEK & YARDIM MERKEZİ')
            .setDescription(
                'Bir sorun mu yaşadın veya yardıma mı ihtiyacın var? Aşağıdaki butona basarak kendine özel gizli bir destek odası açabilirsin.\n\n' +
                '🎩 **Ticket Kuralları**\n' +
                '• Her ticket tek bir konu için açılmalıdır.\n' +
                '• Gereksiz mention, flood veya tekrar ticket açımı işlem süresini uzatır.\n' +
                '• Kurallara aykırı veya kötüye kullanım içeren talepler sınırlandırılabilir.\n\n' +
                '💙 **Hızlı Başlangıç**\n' +
                'Aşağıdaki Ticket Oluştur butonuna tıkladıktan sonra açılan menüden kategori seçin.'
            )
            .setImage('https://cdn.discordapp.com/attachments/1566444685004640256/1569705609291505804/Gemini_Generated_Image_2b12qw2b12qw2b12.jpg?ex=6af46dc4&is=6af31c44&hm=239883462813439408ad691df02191901ff68715bfc4d2fd2bbd3ac36b0a3e0f&') // İstersen kendi görsel linkini koyabilirsin
            .setFooter({ text: 'Project Swisty • Destek Sistemi', iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('swisty_ticket_ac')
                .setLabel('Destek Talebi Aç')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎟️')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }
});

// Ticket Buton ve Oda Yönetimi
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // A) Destek Talebi Açma Butonu
    if (interaction.customId === 'swisty_ticket_ac') {
        try {
            await interaction.reply({ content: '🎟️ Destek odan hazırlanıyor...', ephemeral: true });

            const guild = interaction.guild;
            const user = interaction.user;
            const channelName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

            let ticketChannel = guild.channels.cache.find(c => c.name === channelName);

            if (!ticketChannel) {
                ticketChannel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ],
                        },
                    ],
                });

                const ticketEmbed = new EmbedBuilder()
                    .setColor('#113ccf')
                    .setTitle('🎟️ Destek Talebi')
                    .setDescription(`Hoş geldin ${user}! Yetkililer en kısa sürede seninle ilgilenecektir.`);

                const closeButton = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('swisty_ticket_kapat')
                        .setLabel('Talebi Kapat')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

                await ticketChannel.send({ content: `${user}`, embeds: [ticketEmbed], components: [closeButton] });
            }

            await interaction.editReply({ content: `✅ Destek odan açıldı: ${ticketChannel}` });

        } catch (err) {
            console.error('Ticket Açma Hatası:', err);
            await interaction.editReply({ content: '❌ Oda açılamadı! Botun **Kanalları Yönet** yetkisi olduğundan emin ol.' });
        }
    }

    // B) Destek Talebini Kapatma Butonu
    if (interaction.customId === 'swisty_ticket_kapat') {
        await interaction.reply({ content: '🔒 Oda 3 saniye içinde siliniyor...' });
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (e) {
                console.log('Kanal silinemedi');
            }
        }, 3000);
    }
});

client.login(TOKEN);
