import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import {pluck} from '../../lib/utils';
import graphics from '../graphics';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    props$,
    data$,
  } = responses;

  const {isolateSource, isolateSink} = DOM;
  const actions = intent(isolateSource(DOM, 'please'));
  const state$ = model(props$, data$, actions);
  const vtree$ = view(state$).shareReplay(1);

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    props$: O.just({
      width: 1200,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map(pluck('bounds')),
    content$: isolateSink(vtree$, 'please'),
  });

  return {
    DOM: O.just(div(stage.DOM)),
    preventDefault: O.merge(
      actions.preventDefault,
      stage.preventDefault
    ),
  };
};
