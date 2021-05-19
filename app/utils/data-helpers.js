import { TrackedObject } from 'tracked-built-ins';

/**
 * Converts an AV.Model (from LeanCloud) to a Tracked Object.
 * This object will still have the same API as the AV.Model object, but can be handled by Ember better.
 */
export const AVModelToTrackedObject = function (avModel) {
  const trackedObject = new TrackedObject(avModel.toJSON());
  trackedObject.set = (key, value) => {
    trackedObject[key] = value;
    avModel.set(key, value);
  };
  trackedObject.get = avModel.get.bind(avModel);
  trackedObject.destroy = avModel.destroy.bind(avModel);
  trackedObject.save = avModel.save.bind(avModel);
  return trackedObject;
};
