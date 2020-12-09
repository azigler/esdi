/**
 * Wrapper class for {@link external:User|discord.js User} and {@link external:GuildMember|discord.js GuildMember}
 *
 * @class
 */
class User {
  /**
   * Initializes a new User
   *
   * @param {Esdi} server Esdi server instance
   * @param {external:GuildMember} guildMember discord.js GuildMember
   * @constructor
   */
  constructor (server, guildMember) {
    this.username = guildMember.user.username
    this.id = guildMember.user.id
    this.guilds = []
    this.server = server
    this.botLabel = `${guildMember.user.bot ? ' [BOT]' : ''}`

    this.addGuild(guildMember.guild)

    /**
     * @external User
     * @see https://discord.js.org/#/docs/main/stable/class/User
     */
    /**
     * @external GuildMember
     * @see https://discord.js.org/#/docs/main/stable/class/GuildMember
     */
    this.discordUser = guildMember.user
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
   * @param {external:Guild} guild discord.js Guild
   * @memberof User
   */
  addGuild (guild) {
    if (this.isInGuild(guild)) return
    this.guilds.push(guild)
    this.__changed = true

    if (this.guilds.length === 1) {
      console.log(`[++] Now seeing ${this.username} in ${guild.name} (1 server now mutual)${this.botLabel}`)
    } else {
      console.log(`[+++] Now also seeing ${this.username} in ${guild.name} (${this.guilds.length} servers now mutual)${this.botLabel}`)
    }
  }

  /**
   * Removes a Guild from this User (and deletes self if last Guild removed)
   *
   * @param {external:Guild} guild discord.js Guild
   * @memberof User
   */
  removeGuild (guild) {
    this.guilds = this.guilds.filter(g => g.id !== guild.id)
    this.__changed = true

    if (this.guilds.length === 1) {
      console.log(`[--] No longer seeing ${this.username} in ${guild.name} (1 server now mutual)${this.botLabel}`)
    } if (this.guilds.length > 1) {
      console.log(`[--] No longer seeing ${this.username} in ${guild.name} (${this.guilds.length} servers now mutual)${this.botLabel}`)
    } else {
      console.log(`[---] No longer seeing ${this.username} anywhere${this.botLabel}`)
      this.server.controllers.get('UserController').delete(this.id)
    }
  }
}

module.exports = User
