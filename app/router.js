import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('welcome', { path: '/' });
  this.route('authorize');
  this.route('navigate', function() {
    this.route('system');
    this.route('constellation');
    this.route('region');
    this.route('tracker');
  });
  this.route('discover', function() {
    this.route('fleets');
    this.route('map');
    this.route('kills');
  });
});

export default Router;
