import {
  EventObject,
  InvokeDefinition,
  BehaviorCreator,
  MachineContext
} from '../types';
import { invoke as invokeActionType } from '../actionTypes';
import { isActorRef } from '../actor';
import { ObservableActorRef } from '../ObservableActorRef';
import { createDynamicAction } from '../../actions/dynamicAction';
import {
  BaseDynamicActionObject,
  DynamicInvokeActionObject,
  InvokeActionObject
} from '..';

export function invoke<
  TContext extends MachineContext,
  TEvent extends EventObject
>(
  invokeDef: InvokeDefinition<TContext, TEvent>
): BaseDynamicActionObject<
  TContext,
  TEvent,
  InvokeActionObject,
  DynamicInvokeActionObject<TContext, TEvent>['params']
> {
  return createDynamicAction(
    invokeActionType,
    invokeDef,
    ({ params, type }, context, _event, { machine }) => {
      const { id, data, src, meta } = params;
      if (isActorRef(src)) {
        return {
          type: type,
          params: {
            ...params,
            ref: src
          }
        } as InvokeActionObject;
      }

      const behaviorCreator: BehaviorCreator<TContext, TEvent> | undefined =
        machine.options.actors[src.type];

      if (!behaviorCreator) {
        return {
          type: type,
          params: params
        } as InvokeActionObject;
      }

      const behavior = behaviorCreator(context, _event.data, {
        id,
        data,
        src,
        _event,
        meta
      });

      return {
        type: type,
        params: {
          ...params,
          id: params.id,
          src: params.src,
          ref: new ObservableActorRef(behavior, id),
          meta
        }
      } as InvokeActionObject;
    }
  );
}