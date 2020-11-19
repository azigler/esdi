/**
 * Discord User
 *
 * @class
 */
class User {
  /**
   * Initializes a new User
   *
   * @param {Esdi} server Esdi server instance
   * @param {GuildMember} guildMember Discord GuildMember object
   * @constructor
   */
  constructor (server, guildMember) {
    this.username = guildMember.user.username
    this.id = guildMember.user.id
    this.guilds = []
    this.server = server
    this.discordUser = guildMember.user
    this.discordGuildMember = guildMember
    this.botLabel = `${this.isBot ? ' [BOT]' : ''}`

    this.addGuild(guildMember.guild)
  }

  /**
   * Whether this User is a bot
   *
   * @readonly
   * @memberof User
   */
  get isBot () {
    return this.discordUser.bot
  }

  /**
   * Returns whether this User is in the provided Guild
   *
   * @param {Guild} guild Guild to check for this User
   * @memberof User
   * @returns {Boolean} whether this User is in this Guild
   */
  isInGuild (guild) {
    let is = false
    this.guilds.forEach(g => {
      if (g.id === guild.id) {
        is = true
      }
    })
    return is
  }

  /**
   * Adds a Guild to this User
   *
   * @param {Guild} guild Discord Guild object
   * @memberof User
   */
  addGuild (guild) {
    if (this.isInGuild(guild)) return
    this.guilds.push(guild)
    this.__changed = true

    if (this.guilds.length === 1) {
      console.log(`[++] Now seeing ${this.username} in ${guild.name} (1 now mutual)${this.botLabel}`)
    } else {
      console.log(`[+++] Also seeing ${this.username} now in ${guild.name} (${this.guilds.length} now mutual)${this.botLabel}`)
    }
  }

  /**
   * Removes a Guild from this User (and deletes self if last Guild removed)
   *
   * @param {Guild} guild Discord Guild object
   * @memberof User
   */
  removeGuild (guild) {
    this.guilds = this.guilds.filter(g => g.id !== guild.id)
    this.__changed = true

    if (this.guilds.length > 0) {
      console.log(`[--] No longer seeing ${this.username} in ${guild.name} (${this.guilds.length} now mutual)${this.botLabel}`)
    } else {
      console.log(`[---] No longer seeing ${this.username} anywhere${this.botLabel}`)
      this.server.controllers.get('UserController').delete(this.id)
    }
  }
}

module.exports = User
