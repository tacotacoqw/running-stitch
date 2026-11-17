// The order book: a run is six orders. At each of the first five stops the player picks one of
// two commissions drawn from the catalogue (an easier one, or a harder one that pays more), and
// the sixth is always the royal commission. Fabrics, customers and hazards are drawn afresh
// every run.

import { CUSTOMERS, GARMENT_CATALOGUE, ROYAL_COMMISSION } from '../data/garmentCatalogue.js';
import { FABRICS } from '../data/fabrics.js';

export const ORDERS_IN_A_RUN = 6;
const TIERS_BY_STOP = [[1, 1], [1, 2], [2, 2], [2, 3], [3, 3]];
const PAY_BY_TIER = { 1: 1, 2: 1.25, 3: 1.5, 4: 2 };

export function writeOrderBook(rng) {
  const unused = [...GARMENT_CATALOGUE];
  const draw = (tier) => {
    const pool = unused.filter((garment) => garment.tier === tier);
    const garment = rng.pick(pool.length > 0 ? pool : unused);
    unused.splice(unused.indexOf(garment), 1);
    return garment;
  };
  const stops = TIERS_BY_STOP.map((tiers, stop) => tiers.map((tier) => writeCommission(rng, draw(tier), stop + 1)));
  stops.push([writeCommission(rng, ROYAL_COMMISSION, ORDERS_IN_A_RUN)]);
  return { stops, stop: 0, taken: [] };
}

function writeCommission(rng, garment, order) {
  const royal = garment === ROYAL_COMMISSION;
  const fabric = royal ? FABRICS[FABRICS.length - 1] : rng.pick(FABRICS);
  const hard = garment.tier - 1;
  return {
    garment,
    fabric,
    royal,
    customer: royal ? 'the Queen' : rng.pick(CUSTOMERS),
    pay: PAY_BY_TIER[garment.tier],
    hazards: {
      pins: 1 + order + (hard > 1 ? 1 : 0),
      buttons: 2 + Math.ceil(order * 0.7),
      bobbins: 1 + Math.floor(order / 3),
      scissors: Math.min(3, Math.max(0, order - 2 + (hard > 0 ? 1 : 0))),
      iron: order >= 4,
    },
  };
}

export function commissionsOnOffer(world) {
  return world.orderBook.stops[world.orderBook.stop];
}

export function orderNumber(world) {
  return world.orderBook.stop + 1;
}
