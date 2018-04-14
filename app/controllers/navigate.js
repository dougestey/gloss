import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { later } from '@ember/runloop';

export default Controller.extend({

  location: service(),

  notifications: service(),

  character: reads('location.character'),

  system: reads('location.system'),

  kills: reads('notifications.kills.[]'),

  init() {
    this._super(...arguments);

    later(() => {
      this.set('loadUiElements', true);
    }, 500);

    this.get('notifications').enable();

    later(() => {
      this.set('loadNotifications', true);
    }, 5000);
  }

});
