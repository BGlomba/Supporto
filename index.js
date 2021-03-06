const discord = require("discord.js");
const client = new discord.Client(process.env.client)
const token = (process.env.token)
const ServerID = (process.env.ServerID)
const prefix = "<"

client.on("ready", () => {
console.log("Il BOT è stato avviato correttamente.")


client.user.setActivity("contattare i moderatori!")
})

client.on("channelDelete", (channel) => {
    if(channel.parentID == channel.guild.channels.cache.find((x) => x.name == "TICKET").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if(!person) return;

        let yembed = new discord.MessageEmbed()
        .setAuthor("PRENOTAZIONE CHIUSA", client.user.displayAvatarURL())
        .setColor('RED')
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription("La tua prenotazione è stata chiusa da un moderatore. Se hai ancora un problema, puoi avviare una nuova prenotazione scrivendo qui un messaggio.")
    return person.send(yembed)
    
    }


})


client.on("message", async message => {
  if(message.author.bot) return;

  let args = message.content.slice(prefix.length).split(' ');
  let command = args.shift().toLowerCase();


  if(message.guild) {
      if(command == "setup") {
          if(!message.member.hasPermission("ADMINISTRATOR")) {
              return message.channel.send("Devi essere un amministratore per modificare le impostazioni di questo BOT.")
          }

          let role = message.guild.roles.cache.find((x) => x.name == "Moderatore")
          let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

          if(!role) {
              role = await message.guild.roles.create({
                  data: {
                      name: "Moderatore",
                      color: "GREEN"
                  },
                  reason: "Ruolo richiesto per il BOT" + client.user.tag
              })
          }

          await message.guild.channels.create("TICKET", {  
              type: "category",
              topic: "Tutte le prenotazioni arriveranno qui!",
              permissionOverwrites: [
                  {
                      id: role.id,
                      allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                  }, 
                  {
                      id: everyone.id,
                      deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                  }
              ]
          })


          return message.channel.send("Il setup è stato ultimato con successo!")

      } else if(command == "close") {


        if(message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "TICKET").id) {
            
            const person = message.guild.members.cache.get(message.channel.name)

            if(!person) {
                return message.channel.send("Non sono autorizzato a chiudere il canale e questo errore è arrivato perché probabilmente il nome del canale è cambiato.")
            }

            await message.channel.delete()

            let yembed = new discord.MessageEmbed()
            .setAuthor("PRENOTAZIONE CHIUSA", client.user.displayAvatarURL())
            .setColor("RED")
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter("La prenotazione è stata chiusa\nda " + message.author.username)
            if(args[0]) yembed.setDescription(args.join(" "))

            return person.send(yembed)

        }
      } else if(command == "open") {
          const category = message.guild.channels.cache.find((x) => x.name == "TICKET")

          if(!category) {
              return message.channel.send("Il sistema di moderazione non è stato configurato in questo server, utilizza " + prefix + "setup")
          }

          if(!message.member.roles.cache.find((x) => x.name == "Moderatore")) {
              return message.channel.send("Devi avere il ruolo di moderatore per utilizzare questo comando")
          }

          if(isNaN(args[0]) || !args.length) {
              return message.channel.send("Per favore inserisci l'ID della persona")
          }

          const target = message.guild.members.cache.find((x) => x.id === args[0])

          if(!target) {
              return message.channel.send("Non autorizzato a trovare questa persona.")
          }


          const channel = await message.guild.channels.create(target.id, {
              type: "text",
            parent: category.id,
            topic: "La prenotazione è stata aperta da **" + message.author.username + "** per mettersi in contatto con " + message.author.tag
          })

          let nembed = new discord.MessageEmbed()
          .setAuthor("MESSAGGIO:", target.user.displayAvatarURL({dynamic: true}))
          .setColor("BLUE")
          .setThumbnail(target.user.displayAvatarURL({dynamic: true}))
          .setDescription(message.content)
          .addField("Nome", target.user.username)
          .addField("Data di creazione dell'account", target.user.createdAt)
          .addField("Prenotazione avviata da un moderatore", "Sì");

          channel.send(nembed)

          let uembed = new discord.MessageEmbed()
          .setAuthor("MESSAGGIO DIRETTO APERTO")
          .setColor("GREEN")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription("Sei stato contattato da uno dei moderatori di **" + message.guild.name + "**, per favore attendi fino a quando non ti invierà un messaggio!");
          
          
          target.send(uembed);

          let newEmbed = new discord.MessageEmbed()
          .setDescription("È stata aperta la prenotazione n°: <#" + channel + ">")
          .setColor("GREEN");

          return message.channel.send(newEmbed);
      } else if(command == "help") {
          let embed = new discord.MessageEmbed()
          .setAuthor('BOT DI SUPPORTO', client.user.displayAvatarURL())
          .setColor("GREEN")
          
        .setDescription("Questo BOT è stato creato da Andrea Lombardi per le vostre prenotazioni!")
        .addField(prefix + "setup", "Avvia la procedura di configurazione.\nQuesto crea un nuovo ruolo (Moderatore) e una categoria dove saranno presenti tutte le prenotazioni.", true)
  
        .addField(prefix + "open + ```userID```", 'Apre una prenotazione con un utente specifico.\nPer ```userID```, digitare il nome della persona (es. ' + message.author.username + ') inserendo "\\" prima della menzione.', true)
        .setThumbnail(client.user.displayAvatarURL())
                    .addField(prefix + "close", "Cancella una prenotazione da una già aperta.\nQuesto comando deve essere eseguito all'interno del canale testuale in cui si desidera chiudere la prenotazione.", true);

                    return message.channel.send(embed)
          
      }
  } 
  
  
  
  
  
  
  
  if(message.channel.parentID) {

    const category = message.guild.channels.cache.find((x) => x.name == "TICKET")
    
    if(message.channel.parentID == category.id) {
        let member = message.guild.members.cache.get(message.channel.name)
    
        if(!member) return message.channel.send('Non abilitato per inviare messaggi.')
    
        let lembed = new discord.MessageEmbed()
        .setColor("GREEN")
        .setFooter(message.author.username, message.author.displayAvatarURL({dynamic: true}))
        .setDescription(message.content)
    
        return member.send(lembed)
    }
    
    
      } 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if(!message.guild) {
      const guild = await client.guilds.cache.get(ServerID);
      if(!guild) return;

      const main = guild.channels.cache.find((x) => x.name == message.author.id)
      const category = guild.channels.cache.find((x) => x.name == "TICKET")


      if(!main) {
          let mx = await guild.channels.create(message.author.id, {
              type: "text",
              parent: category.id,
              topic: "Questa prenotazione è stata creata per aiutare  **" + message.author.tag + " **"
          })

          let sembed = new discord.MessageEmbed()
          .setAuthor("PRENOTAZIONE ACCETTATA")
          .setColor("GREEN")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription("La conversazione è stata accettata, presto sarai contattato da un moderatore.")

          message.author.send(sembed)


          let eembed = new discord.MessageEmbed()
          .setAuthor("MESSAGGIO:", message.author.displayAvatarURL({dynamic: true}))
          .setColor("BLUE")
          .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
          .setDescription(message.content)
          .addField("Nome", message.author.username)
          .addField("Data di creazione dell'account", message.author.createdAt)
          .addField("Prenotazione avviata da un moderatore", "No")


        return mx.send(eembed)
      }

      let xembed = new discord.MessageEmbed()
      .setColor("YELLOW")
      .setFooter(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
      .setDescription(message.content)


      main.send(xembed)

  } 
  
  
  
 
})


client.login(token)