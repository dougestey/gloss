/* global io */
import ENV from 'gloss/config/environment';
import Service, { inject as service } from '@ember/service';
import { bind, later } from '@ember/runloop';
import { reads } from '@ember/object/computed';

export default Service.extend({

  message: service(),

  location: service(),

  discovery: service(),

  session: service(),

  character: reads('session.character'),

  arbiterUrl: ENV.ARBITER_URL,

  connected: false,

  firstConnect: true,

  connect() {
    let arbiterUrl = this.get('arbiterUrl');
    io.sails.url = arbiterUrl;

    let connection = io.sails.connect();
    connection.reconnection = true;

    connection.on('connect', bind(this, this._handleConnect));
    connection.on('disconnect', bind(this, this._handleDisconnect));

    this.set('socket', connection);
  },

  _handleConnect() {
    this.set('connected', true);

    let firstConnect = this.get('firstConnect');

    if (!firstConnect) {
      this.get('message.dispatch').perform(
        `Link re-established`,
        `Arbiter has come back online`,
        5
      );
    } else {
      let character = this.get('character');

      if (character) {
        this.get('location').start(character.id);
        this.get('discovery').enable();
      }
    }
  },

  _handleDisconnect() {
    this.set('connected', false);

    later(() => {
      this.get('message.dispatch').perform(
        'Arbiter connection lost',
        `Please wait a minute, then refresh GLOSS`
      );
    }, 1000);

    this._reconnect();
  },

  _reconnect() {
    let socket = this.get('socket');

    if (!socket.isConnected() && !socket.isConnecting()) {
      socket.reconnect();

      later(() => {
        this._reconnect();
      }, 5000);
    }
  }

});
