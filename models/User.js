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
  async addGuild (guild) {
    // if this User object is already in this Guild, return
    if (this.isInGuild(guild)) return

    // fetch Guilds associated with this user from their database document
    const { guilds } = await this.server.controllers.get('DatabaseController').fetchDoc({
      db: 'user',
      id: this.id
    })

    // add this Guild to this User object
    this.guilds.push(guild)

    // announce User
    if (this.guilds.length === 1) {
      console.log(`[++] Now seeing ${this.username} in ${guild.name} (1 server now mutual)${this.botLabel}`)
    } else {
      console.log(`[+++] Now also seeing ${this.username} in ${guild.name} (${this.guilds.length} servers now mutual)${this.botLabel}`)
    }

    // if this Guild was already associated with this User's database document, return
    if (guilds && guilds.find(g => g === guild.id)) {
      return
    }

    // update database document
    this.serialize()
  }

  /**
   * Removes a Guild from this User
   *
   * @param {external:Guild} guild discord.js Guild
   * @memberof User
   */
  removeGuild (guild) {
    // if this Guild is associated with this User, remove it
    if (this.guilds.find(g => g.id === guild.id)) {
      // remove this Guild from this User object
      this.guilds = this.guilds.filter(g => g.id !== guild.id)

      // announce User
      if (this.guilds.length === 1) {
        console.log(`[--] No longer seeing ${this.username} in ${guild.name} (1 server now mutual)${this.botLabel}`)
      } if (this.guilds.length > 1) {
        console.log(`[--] No longer seeing ${this.username} in ${guild.name} (${this.guilds.length} servers now mutual)${this.botLabel}`)
      } else {
        console.log(`[---] No longer seeing ${this.username} anywhere${this.botLabel}`)
      }

      // update database document
      this.serialize()
    }
  }

  /**
   * Serializes this User to a database document
   *
   * @memberof Guild
   */
  serialize () {
    this.server.controllers.get('DatabaseController').updateDoc({
      db: 'user',
      id: this.id,
      payload: {
        guilds: this.guilds.map(g => { return g.id }),
        username: this.username
      }
    })
  }
}

module.exports = User
