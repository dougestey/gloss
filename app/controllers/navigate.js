/* global $ */
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import { later } from '@ember/runloop';
import { task } from 'ember-concurrency';

export default Controller.extend({

  queryParams: {
    showKillStream: 'stream'
  },

  showKillStream: true,

  application: controller(),

  arbiter: service(),

  discovery: service(),

  location: service(),

  message: service(),

  intel: service(),

  tracker: service(),

  route: reads('application.currentPath'),

  character: reads('location.character'),

  system: reads('location.system'),

  constellation: reads('location.constellation'),

  region: reads('location.region'),

  isConnected: reads('arbiter.connected'),

  systemFleets: reads('intel.fleets.system.[]'),

  constellationFleets: reads('intel.fleets.constellation.[]'),

  regionFleets: reads('intel.fleets.region.[]'),

  trackerFleets: reads('tracker.fleets.[]'),

  trackerKills: reads('tracker.kills.[]'),

  systemKills: reads('intel.kills.system.[]'),

  constellationKills: reads('intel.kills.constellation.[]'),

  regionKills: reads('intel.kills.region.[]'),

  context: computed('route', function() {
    let route = this.get('route');
    let context = route.split('.')[1];

    return context;
  }),

  mode: computed('route', function() {
    let route = this.get('route');
    let mode = route.split('.')[0];

    return mode;
  }),

  kills: computed('context', 'regionKills.[]', 'constellationKills.[]', 'systemKills.[]', 'trackerKills.[]', function() {
    let context = this.get('context');

    return this.get(`${context}Kills`);
  }),

  killsRenderable: computed('kills', 'context', 'regionKills.[]', 'constellationKills.[]', 'systemKills.[]', function() {
    let kills = this.get('kills');

    if (!kills)
      return [];

    return kills.sortBy('time').reverse().slice(0, 500);
  }),

  stats: computed('context', 'system', 'constellation', 'region', function() {
    let context = this.get('context');

    if (context === 'tracker') {
      return {};
    }

    return this.get(`${context}.stats`);
  }),

  selectedFleet: computed('selectedFleetId', 'discovery.fleets.[]', 'systemFleets', 'constellationFleets', 'regionFleets', 'trackerFleets', function() {
    let id = this.get('selectedFleetId');

    if (!id) {
      this.set('selectedFleetCache', null);
      return null;
    }

    let discoveryFleets = this.get('discovery.fleets');
    let selected;

    if (discoveryFleets)
      selected = discoveryFleets.findBy('id', id);

    if (selected) {
      return selected;
    }

    let context = this.get('context');
    let fleetsFromIntel = this.get(`${context}Fleets`);
    let cache = this.get('selectedFleetCache');
    selected = fleetsFromIntel.findBy('id', id);

    if (!selected && cache) {
      return cache;
    } else if (selected) {
      this.set('selectedFleetCache', selected);
    }

    return selected;
  }),

  selectedFleetIsTracked: computed('selectedFleetId', 'trackerFleets.[]', function() {
    let id = this.get('selectedFleetId');
    let fleets = this.get('trackerFleets');

    if (!id)
      return false;

    let existingTrackedFleet = fleets.findBy('id', id);
    return !!existingTrackedFleet;
  }),

  selectFleet: task(function * (id) {
    this.set('selectedFleetId', id);

    $('.ui.threat.modal').modal('show');
    $('.ui.threat.modal').modal('hide dimmer');
    $('.ui.threat.modal').scrollTop(0);
  }).drop(),

  init() {
    this._super(...arguments);

    later(() => {
      this.set('loadUiElements', true);
    }, 500);

    later(() => {
      this.set('loadIntel', true);
    }, 5000);
  },

  actions: {
    toggleKillStream() {
      this.toggleProperty('showKillStream');
    },

    selectFleet(id) {
      this.get('selectFleet').perform(id);
    },

    toggleTracking() {
      let fleet = this.get('selectedFleet');
      let fleetIsTracked = this.get('selectedFleetIsTracked');

      if (fleetIsTracked) {
        this.get('tracker').remove(fleet);
        this.get('message.dispatch').perform(`Tracking disabled`, undefined, 2);
      } else {
        this.get('tracker').add(fleet);
        this.get('message.dispatch').perform(`Tracking enabled`, undefined, 2);
      }
    },
  }

});
